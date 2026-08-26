import { type TimeConfig, toMs } from '@trt-web/core';
import NodeCache from 'node-cache';

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
}
