import { TimeConfig } from '../utils';

export type IdType = string | number;

/**
 * Supported backing stores for `SignalStore` persistence.
 */
export type SignalStoreStorageType = 'local' | 'session';

/**
 * Persistence settings when storage sync is enabled.
 * `type` selects the backing store, `loadFromStorage` restores saved state on startup.
 */
export type SignalStoreEnabledConfig = {
  storageSync: true;
  key: string;
  type: SignalStoreStorageType;
  loadFromStorage: boolean;
  syncDelay: number | TimeConfig;
};

/**
 * Persistence settings when storage sync is disabled.
 */
export type SignalStoreDisabledConfig = {
  storageSync: false;
};

/**
 * Store configuration.
 * - `storage` controls persistence behavior.
 * - `expiredIn` is the expiry duration used by `setData()`.
 */
export type SignalStoreConfig = {
  storage: SignalStoreEnabledConfig | SignalStoreDisabledConfig;
  expiredIn: number | TimeConfig;
};

/**
 * Runtime state shape managed by `SignalStore`.
 * `totalCount` reflects the current list size or a server-provided total count.
 */
export type StateType<T> = {
  data: T[];
  totalCount: number;
  expired: number;
  loading: boolean;
  error: unknown;
};

/**
 * Initial empty state for a store instance.
 */
export function initialState<T>(): StateType<T> {
  return {
    data: [] as T[],
    totalCount: 0,
    expired: 0,
    loading: false,
    error: null,
  };
}

/**
 * Default config with storage sync disabled and no expiry window.
 */
export function initialSignalStoreConfig(): SignalStoreConfig {
  return {
    storage: {
      storageSync: false,
    },
    expiredIn: 0,
  };
}
