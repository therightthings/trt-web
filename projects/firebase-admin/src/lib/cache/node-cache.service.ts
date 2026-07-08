import { generateHash } from '@trt-web/core';
import NodeCache from 'node-cache';

import { TimeConfig, toMs } from '../utils';

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

export type RepositoryMethod = 'get-many' | 'get-total-count' | 'get-one';

const nodeCacheStore = new NodeCache({
  stdTTL: 30 * 60,
  deleteOnExpire: true,
  useClones: true,
  checkperiod: 30 * 60,
  enableLegacyCallbacks: false,
  maxKeys: -1,
});

export class NodeCacheService {
  static config = {
    debug: false,
  };

  static #instance: NodeCacheService;
  private constructor() {}
  static getInstance() {
    if (!NodeCacheService.#instance) {
      NodeCacheService.#instance = new NodeCacheService();
    }

    return NodeCacheService.#instance;
  }

  get<T = unknown>(key: string) {
    return nodeCacheStore.get<T>(key);
  }

  set(key: string, value: unknown, ttl: number | TimeConfig) {
    const seconds = Math.round(toMs(ttl) / 1000);
    nodeCacheStore.set(key, value, seconds);
  }

  delete(key: string) {
    nodeCacheStore.del(key);
  }

  deleteByPrefix(prefix: string) {
    const keys = nodeCacheStore.keys();
    const matched = keys.filter((k) => k.startsWith(prefix));
    nodeCacheStore.del(matched);
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

    if (NodeCacheService.config.debug) {
      console.log('bump network cache version', userId, group);
    }

    this.saveGroup(userId, group);
    return group;
  }

  getRepositoryKey(
    collectionPath: string,
    options: {
      prefix?: CacheKeyPrefix;
      method: RepositoryMethod;
      id: unknown;
    },
  ) {
    const version = this.getRepositoryVersion(collectionPath, {
      method: options.method,
    });

    return this.generateRepositoryKey({
      prefix: options.prefix ?? '',
      collectionPath: collectionPath,
      method: options.method,
      id: options.id,
      version,
    });
  }

  bumpRepositoryVersion(
    collectionPath: string,
    options: {
      method: RepositoryMethod[];
    },
  ) {
    for (const method of options.method) {
      const versionKey = this.buildRepositoryVersionKey(collectionPath, {
        method,
      });

      const current = this.getRepositoryVersion(collectionPath, { method });
      const next = current + 1;
      this.set(versionKey, next, { value: 30, unit: 'day' });
    }

    if (NodeCacheService.config.debug) {
      console.log('bump repository cache version', collectionPath, options);
    }
  }

  private generateKey(config: {
    prefix?: CacheKeyPrefix;
    version?: number;
    scope?: CacheScope;
    id: unknown;
  }) {
    const { prefix = '', version = 1, scope = 'guest', id } = config;
    const hashId = generateHash(id);
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
    // favorite-store
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

  private getRepositoryVersion(
    collectionPath: string,
    options: {
      method: RepositoryMethod;
    },
  ) {
    const versionKey = this.buildRepositoryVersionKey(collectionPath, options);

    const v = this.get<number>(versionKey);
    return v ?? 1;
  }

  private buildRepositoryVersionKey(
    collectionPath: string,
    options: {
      method: RepositoryMethod;
    },
  ) {
    return `REPO_COLLECTION_VERSION::${collectionPath}::${options.method}`;
  }

  private generateRepositoryKey(config: {
    prefix?: CacheKeyPrefix;
    collectionPath: string;
    version: number;
    method: RepositoryMethod;
    id: unknown;
  }) {
    const { prefix = '', collectionPath, method, id, version } = config;

    const hashId = generateHash(id);
    return [prefix, 'repository', collectionPath, method, hashId, `v-${version}`].join(':');
  }
}
