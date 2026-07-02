import { HttpContext, HttpEvent } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { TimeConfig, toMs } from '../utils';
import {
  HTTP_CACHE_GROUP_TOKEN,
  HTTP_CACHE_ID_TOKEN,
  HTTP_CACHE_OVERWRITE_TOKEN,
  HTTP_CACHE_TAGS_TOKEN,
  HTTP_CACHE_TTL_TOKEN,
} from './http-cache.token';
import { HttpCacheConfig, HttpCacheState } from './http-cache.type';

export function normalizeTags(tags?: string[]): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  const tagSet = new Set(
    tags.map((tag) => {
      return tag.trim();
    }),
  );

  return Array.from(tagSet).filter(Boolean);
}

@Injectable({
  providedIn: 'root',
})
export class HttpCacheService {
  static globalConfig = signal<HttpCacheConfig>({
    ttl: 5 * 60 * 1000,
    debug: false,
  });

  private caches = new Map<string, HttpCacheState>();
  private pendingRequests = new Map<string, Observable<HttpEvent<unknown>>>();

  static createContext(
    config: {
      ttl?: TimeConfig | number;
      tag?: string[];
      group?: string;
      id?: string;
      overwrite?: boolean;
    } = {},
  ) {
    const context = new HttpContext();
    const globalConfig = this.globalConfig();
    const { overwrite = false, ttl = globalConfig.ttl } = config;

    const tag = normalizeTags(config.tag);
    const group = config?.group?.trim();
    const id = config?.id?.trim();

    context.set(HTTP_CACHE_TTL_TOKEN, toMs(ttl));
    context.set(HTTP_CACHE_OVERWRITE_TOKEN, overwrite);

    if (tag.length) {
      context.set(HTTP_CACHE_TAGS_TOKEN, tag);
    }
    if (group) {
      context.set(HTTP_CACHE_GROUP_TOKEN, group);
    }
    if (id) {
      context.set(HTTP_CACHE_ID_TOKEN, id);
    }

    return context;
  }

  private getConfig() {
    return HttpCacheService.globalConfig();
  }

  get(key: string): HttpCacheState | undefined {
    const item = this.caches.get(key);
    if (!item) return undefined;

    if (Date.now() > item.createdTime + item.ttl) {
      this.caches.delete(key);
      return undefined;
    }

    if (this.getConfig().debug) {
      console.log('%c[angular] Hit', 'color: green; font-weight: bold;', key);
    }

    return item;
  }

  set(key: string, value: HttpCacheState) {
    if (this.getConfig().debug) {
      console.log('%c[angular] Stored', 'color: blue; font-weight: bold;', key);
    }
    this.caches.set(key, value);

    setTimeout(() => {
      if (this.caches.get(key)?.createdTime === value.createdTime) {
        this.caches.delete(key);
        if (this.getConfig().debug) {
          console.log('%c[angular] Expired', 'color: orange;', key);
        }
      }
    }, value.ttl);
  }

  getPending(key: string) {
    return this.pendingRequests.get(key);
  }

  setPending(key: string, request$: Observable<HttpEvent<unknown>>) {
    this.pendingRequests.set(key, request$);
  }

  clearPending(key: string) {
    this.pendingRequests.delete(key);
  }

  delete(key: string) {
    this.caches.delete(key);
    if (this.getConfig().debug) {
      console.log('%c[angular] Deleted', 'color: red;', key);
    }
  }

  deleteByTag(tags: string[]) {
    const _tags = normalizeTags(tags);
    const caches = this.caches.entries();
    for (const [key, cache] of caches) {
      for (const tag of _tags) {
        if (cache.tags?.includes(tag)) {
          this.delete(key);
        }
      }
    }
  }

  deleteByGroup(group: string) {
    const normalizedGroup = group.trim();
    if (!normalizedGroup) return;

    for (const [key, cache] of this.caches.entries()) {
      if (cache.group === normalizedGroup) {
        this.delete(key);
      }
    }
  }

  deleteById(id: string) {
    const normalizedId = id.trim();
    if (!normalizedId) return;

    for (const [key, cache] of this.caches.entries()) {
      if (cache.id === normalizedId) {
        this.delete(key);
      }
    }
  }

  updateCacheById<T = unknown>(id: string, updater: (cacheRes: T) => T) {
    const normalizedId = id.trim();
    if (!normalizedId) return;

    for (const [key, cache] of this.caches.entries()) {
      if (cache.id !== normalizedId) continue;

      const nextBody = updater(cache.response.body);
      const nextResponse = cache.response.clone({ body: nextBody });

      this.caches.set(key, {
        ...cache,
        response: nextResponse,
        createdTime: Date.now(),
      });

      if (this.getConfig().debug) {
        console.log('%c[angular] Updated', 'color: teal; font-weight: bold;', key);
      }
    }
  }

  clearAll() {
    this.caches.clear();
    this.pendingRequests.clear();
    if (this.getConfig().debug) {
      console.log('%c[angular] All cache cleared', 'color: purple;');
    }
  }
}
