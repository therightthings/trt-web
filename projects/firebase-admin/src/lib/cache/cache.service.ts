import NodeCache from 'node-cache';

import { TimeConfig, toMs } from '../utils';
import { hashData } from '../utils/hash-data';
import { CacheEntry, CacheKeyPrefix, CacheScope, GroupCacheKey } from './cache.type';

export class CacheService {
  static config = {
    debug: false,
  };

  static #instance: CacheService;
  private readonly nodeCacheStore: NodeCache;

  private constructor() {
    this.nodeCacheStore = new NodeCache({
      stdTTL: 30 * 60,
      deleteOnExpire: true,
      useClones: true,
      checkperiod: 30 * 60,
      enableLegacyCallbacks: false,
      maxKeys: -1,
    });
  }
  static getInstance() {
    if (!CacheService.#instance) {
      CacheService.#instance = new CacheService();
    }

    return CacheService.#instance;
  }

  get<T = unknown>(key: string) {
    return this.nodeCacheStore.get<T>(key);
  }

  set(key: string, value: unknown, ttl: number | TimeConfig) {
    const seconds = Math.max(1, Math.ceil(toMs(ttl) / 1000));
    this.nodeCacheStore.set(key, value, seconds);
  }

  delete(key: string) {
    this.nodeCacheStore.del(key);
  }

  deleteByPrefix(prefix: string) {
    const keys = this.nodeCacheStore.keys();
    const matched = keys.filter((k) => k.startsWith(prefix));
    this.nodeCacheStore.del(matched);
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
}
