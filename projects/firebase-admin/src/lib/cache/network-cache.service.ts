import type { TimeConfig } from '@trt-web/core';

import { hashData } from '../utils/hash-data';
import { CacheService } from './cache.service';

export type CacheScope = 'get-list-users' | 'guest';

type CacheKeyPrefix = string;

type CacheEntry = {
  key: string;
  version: number;
};

export type GroupCacheKey = {
  userId: string;
  users: {
    listing: CacheEntry;
  };
};

export class NetworkCacheService {
  private readonly cacheService = CacheService.getInstance();

  static #instance: NetworkCacheService;
  private constructor() {}
  static getInstance() {
    if (!NetworkCacheService.#instance) {
      NetworkCacheService.#instance = new NetworkCacheService();
    }

    return NetworkCacheService.#instance;
  }

  get<T = unknown>(key: string) {
    return this.cacheService.get<T>(key);
  }

  set(key: string, value: unknown, ttl: number | TimeConfig) {
    this.cacheService.set(key, value, ttl);
  }

  delete(key: string) {
    this.cacheService.delete(key);
  }

  deleteByPrefix(prefix: string) {
    this.cacheService.deleteByPrefix(prefix);
  }

  getNetworkKey(config: { userId?: string; url: string }): string {
    const { userId, url } = config;
    const scope = this.resolveScopeByUrl(url);

    if (!userId || scope === 'guest') {
      return this.generateKey({ id: { url } });
    }

    const group = this.getGroupCache(userId);
    const entry = this.getCacheEntry(group, scope);
    const id = { userId, url };
    entry.key = this.generateKey({
      version: entry.version,
      scope,
      id,
    });
    this.saveGroup(userId, group);

    return entry.key;
  }

  bumpNetworkVersion(userId: string, scopes: CacheScope[]) {
    const group = this.getGroupCache(userId);

    for (const scope of scopes) {
      const entry = this.getCacheEntry(group, scope);
      if (entry.key) {
        this.delete(entry.key);
      }
      entry.version += 1;
    }

    if (CacheService.config.debug) {
      console.log('bump network cache version', userId, group);
    }

    this.saveGroup(userId, group);
    return group;
  }

  private generateKey(config: {
    prefix?: CacheKeyPrefix;
    version?: number;
    scope?: CacheScope;
    id: unknown;
  }) {
    const { prefix = '', version = 1, scope = 'guest', id } = config;
    const hashId = hashData(id);
    const auth = scope !== 'guest' ? 'auth' : '';
    return [prefix, 'network', auth, scope, hashId, `v-${version}`].filter(Boolean).join(':');
  }

  private createDefaultGroup(userId: string): GroupCacheKey {
    const makeEntry = (): CacheEntry => ({ key: '', version: 1 });

    return {
      userId,
      users: { listing: makeEntry() },
    };
  }

  private buildUserGroupKey(userId: string) {
    return `USER_GROUP_KEY:${userId}`;
  }

  private saveGroup(userId: string, group: GroupCacheKey) {
    this.set(this.buildUserGroupKey(userId), group, { value: 1, unit: 'day' });
  }

  private getGroupCache(userId?: string) {
    if (!userId) return this.createDefaultGroup('');

    const group = this.get<GroupCacheKey>(this.buildUserGroupKey(userId));

    if (!group || group.userId !== userId) {
      const fresh = this.createDefaultGroup(userId);
      this.saveGroup(userId, fresh);
      return fresh;
    }

    return group;
  }

  private resolveScopeByUrl(url: string): CacheScope {
    if (url.includes('users') && url.includes('list-users')) {
      return 'get-list-users';
    }

    return 'guest';
  }

  private getCacheEntry(group: GroupCacheKey, scope: CacheScope): CacheEntry {
    switch (scope) {
      case 'get-list-users':
        return group.users.listing;
      default:
        return { version: 1, key: '' };
    }
  }
}
