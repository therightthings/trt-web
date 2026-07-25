import { effect, Injectable, Signal, signal } from '@angular/core';
import { IndexedDB, LocalStorage, SessionStorage } from '@trt-web/core';

import { toMs } from '../utils';
import {
  IdType,
  initialSignalStoreConfig,
  initialState,
  SignalStoreAsyncConfig,
  SignalStoreConfig,
  SignalStoreStorageType,
  SignalStoreSyncConfig,
  StateType,
} from './signal-store.type';

@Injectable({
  providedIn: 'root',
})
export class SignalStore<T extends { id: IdType }> {
  readonly #state = signal<StateType<T>>(initialState<T>());
  readonly #config = signal<SignalStoreConfig>(initialSignalStoreConfig());
  readonly #isHydrating = signal(false);
  #writeQueues = new Map<string, Promise<void>>();
  #skipIndexedDbWrites = new Set<string>();

  constructor() {
    effect((onCleanup) => {
      const config = this.#config();
      const state = this.#state();
      const storageConfig = config.storage;

      if (!storageConfig.storageSync || this.#isHydrating()) {
        return;
      }

      const { type, key, syncDelay = 0 } = storageConfig;
      const indexedDbQueueKey =
        type === 'indexed-db' ? this.getIndexedDbQueueKey(storageConfig) : undefined;

      if (indexedDbQueueKey && this.#skipIndexedDbWrites.delete(indexedDbQueueKey)) {
        return;
      }

      const timerId = setTimeout(() => {
        if (type === 'indexed-db') {
          const queue = this.#writeQueues.get(indexedDbQueueKey!) ?? Promise.resolve();
          const nextQueue = queue
            .then(async () => {
              await this.getIndexedDbStorage(storageConfig).set(key, state);
            })
            .catch((error) => {
              this.reportIndexedDbError(indexedDbQueueKey!, error);
            });
          this.#writeQueues.set(indexedDbQueueKey!, nextQueue);
          return;
        }

        this.getStorage(type).set(key, state);
      }, toMs(syncDelay));

      onCleanup(() => {
        clearTimeout(timerId);
      });
    });
  }

  get snapshot(): StateType<T> {
    return this.#state();
  }

  get state(): Signal<StateType<T>> {
    return this.#state.asReadonly();
  }

  get config(): Signal<SignalStoreConfig> {
    return this.#config.asReadonly();
  }

  /**
   * Apply store config.
   * - `storage.storageSync = true` enables persistence.
   * - `storage.loadFromStorage = true` restores state from storage on setup.
   * - `expiredIn` becomes the default expiry window used by `setData()`.
   */
  configure(config: SignalStoreSyncConfig): void;
  configure(config: SignalStoreAsyncConfig): Promise<void>;
  configure(config: SignalStoreConfig): void | Promise<void>;
  configure(config: SignalStoreConfig): void | Promise<void> {
    if (config.storage.storageSync && config.storage.type === 'indexed-db') {
      return this.configureIndexedDb(config as SignalStoreAsyncConfig);
    }

    this.#config.set(config);

    const { storage } = config;

    if (storage.storageSync === true && storage.loadFromStorage === true) {
      const { type, key } = storage;
      const storedState = this.getStorage(type).get<StateType<T>>(key);

      if (storedState) {
        this.#state.set(storedState);
      }
    }
  }

  private async configureIndexedDb(config: SignalStoreAsyncConfig): Promise<void> {
    this.#isHydrating.set(true);
    this.#config.set(config);

    try {
      if (config.storage.loadFromStorage) {
        const storedState = await this.getIndexedDbStorage(config.storage).get<StateType<T>>(
          config.storage.key,
        );

        if (storedState) {
          this.#state.set(storedState);
        }
      }
    } catch (error) {
      console.error('SignalStore IndexedDB read failed.', error);
    } finally {
      this.#isHydrating.set(false);
    }
  }

  isExpired() {
    return Date.now() > this.#state().expired;
  }

  /**
   * Replace the whole dataset, refresh `totalCount`, and reset loading/error flags.
   */
  setData(
    data: T[],
    options: {
      totalCount?: number;
    } = {},
  ): void {
    const config = this.#config();
    const expired = Date.now() + toMs(config.expiredIn);
    const count = options.totalCount ?? data.length;

    this.#state.update(() => {
      return {
        data: data,
        expired: expired,
        totalCount: count,
        loading: false,
        error: null,
      };
    });
  }

  /**
   * Update the loading flag without touching the data payload.
   */
  setLoading(loading: boolean) {
    this.#state.update((prev) => {
      return { ...prev, loading };
    });
  }

  /**
   * Update the error state without touching the data payload.
   */
  setError(error: unknown) {
    this.#state.update((prev) => {
      return { ...prev, error };
    });
  }

  addNewData(
    item: T,
    options?: {
      mode: 'push' | 'unshift';
    },
  ): void {
    const { mode = 'push' } = options ?? {};
    this.#state.update((prev) => {
      const nextData = mode === 'push' ? [...prev.data, item] : [item, ...prev.data];
      const nextCount = prev.totalCount + 1;

      return {
        ...prev,
        data: nextData,
        totalCount: nextCount,
      };
    });
  }

  /**
   * Find one item by id from the current snapshot.
   */
  getDataById(id: IdType): T | null {
    return this.#state().data.find((item) => item.id === id) ?? null;
  }

  /**
   * Merge partial fields into an item with the matching id.
   */
  updateDataById(id: IdType, updated: Partial<T>): void {
    this.#state.update((prev) => {
      const nextData = prev.data.map((item) => {
        return item.id === id ? { ...item, ...updated } : item;
      });

      return {
        ...prev,
        data: nextData,
      };
    });
  }

  /**
   * Remove an item by id from the current snapshot and keep `totalCount` in sync.
   */
  deleteDataById(id: IdType): void {
    this.#state.update((prev) => {
      const nextData = prev.data.filter((item) => item.id !== id);
      let nextCount = prev.totalCount;
      if (nextData.length < prev.data.length) {
        nextCount -= 1;
      }

      return {
        ...prev,
        data: nextData,
        totalCount: nextCount,
      };
    });
  }

  /**
   * Reset in-memory state and clear persisted storage when enabled.
   */
  reset(): void | Promise<void> {
    this.#state.set(initialState<T>());

    const { storage } = this.#config();
    if (storage.storageSync) {
      if (storage.type === 'indexed-db') {
        const queueKey = this.getIndexedDbQueueKey(storage);
        this.#skipIndexedDbWrites.add(queueKey);
        const queue = this.#writeQueues.get(queueKey) ?? Promise.resolve();
        const nextQueue = queue
          .then(() => this.getIndexedDbStorage(storage).remove(storage.key))
          .catch((error) => {
            this.reportIndexedDbError(queueKey, error);
          });
        this.#writeQueues.set(queueKey, nextQueue);
        return nextQueue;
      }

      this.getStorage(storage.type).remove(storage.key);
    }
  }

  private getStorage(storage: Exclude<SignalStoreStorageType, 'indexed-db'>) {
    return storage === 'session' ? SessionStorage : LocalStorage;
  }

  private getIndexedDbStorage(config: SignalStoreAsyncConfig['storage']) {
    const database = IndexedDB.register({
      database: config.database,
      version: config.version ?? 1,
      collections: [config.collection],
    });

    return {
      get: <TValue>(key: string) =>
        database
          .collection<{ id: string; value: TValue }>(config.collection)
          .get(key)
          .then((record) => record?.value),
      set: async <TValue>(key: string, value: TValue) => {
        const collection = database.collection<{ id: string; value: TValue }>(config.collection);
        await collection.put({ id: key, value });
      },
      remove: async (key: string) => {
        await database.collection<{ id: string; value: unknown }>(config.collection).remove(key);
      },
    };
  }

  private getIndexedDbQueueKey(config: SignalStoreAsyncConfig['storage']): string {
    return JSON.stringify([config.database, config.collection, config.key]);
  }

  private reportIndexedDbError(queueKey: string, error: unknown): void {
    this.#skipIndexedDbWrites.add(queueKey);
    this.#state.update((state) => {
      return { ...state, error };
    });
    console.error('SignalStore IndexedDB persistence failed.', error);
  }
}
