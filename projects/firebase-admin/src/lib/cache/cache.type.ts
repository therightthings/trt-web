export type CacheScope = 'get-list-users' | 'guest';

export type CacheKeyPrefix = string;

export type CacheEntry = {
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
