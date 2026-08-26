import { TimeConfig } from '@trt-web/core';

import { hashData } from '../utils/hash-data';
import { CacheService } from './cache.service';
import { CacheKeyPrefix, RepositoryMethod } from './cache.type';

export class FirestoreCacheService {
  private readonly cacheService = CacheService.getInstance();

  static #instance: FirestoreCacheService;

  private constructor() {}
  static getInstance() {
    if (!FirestoreCacheService.#instance) {
      FirestoreCacheService.#instance = new FirestoreCacheService();
    }

    return FirestoreCacheService.#instance;
  }

  get<T = unknown>(key: string) {
    return this.cacheService.get<T>(key);
  }

  set(key: string, value: unknown, ttl: number | TimeConfig) {
    this.cacheService.set(key, value, ttl);
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
      this.cacheService.set(versionKey, next, { value: 30, unit: 'day' });
    }

    if (CacheService.config.debug) {
      console.log('bump repository cache version', collectionPath, options);
    }
  }

  private getRepositoryVersion(
    collectionPath: string,
    options: {
      method: RepositoryMethod;
    },
  ) {
    const versionKey = this.buildRepositoryVersionKey(collectionPath, options);

    const v = this.cacheService.get<number>(versionKey);
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

    const hashId = hashData(id);
    return [prefix, 'repository', collectionPath, method, hashId, `v-${version}`].join(':');
  }
}
