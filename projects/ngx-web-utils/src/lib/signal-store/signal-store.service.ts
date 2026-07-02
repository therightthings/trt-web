import { effect, Injectable, Signal, signal } from '@angular/core';
import { LocalStorage, SessionStorage } from '../browser';
import { toMs } from '../utils';
import {
  IdType,
  initialSignalStoreConfig,
  initialState,
  SignalStoreConfig,
  SignalStoreStorageType,
  StateType,
} from './signal-store.type';

@Injectable({
  providedIn: 'root',
})
export class SignalStore<T extends { id: IdType }> {
  readonly #state = signal<StateType<T>>(initialState<T>());
  readonly #config = signal<SignalStoreConfig>(initialSignalStoreConfig());

  constructor() {
    effect((onCleanup) => {
      const config = this.#config();
      const state = this.#state();
      const storageConfig = config.storage;

      if (!storageConfig.storageSync) {
        return;
      }

      const { type, key, syncDelay = 0 } = storageConfig;

      const timerId = setTimeout(() => {
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
  configure(config: SignalStoreConfig) {
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
  reset(): void {
    this.#state.set(initialState<T>());

    const { storage } = this.#config();
    if (storage.storageSync) {
      const { type, key } = storage;
      this.getStorage(type).remove(key);
    }
  }

  private getStorage(storage: SignalStoreStorageType) {
    return storage === 'session' ? SessionStorage : LocalStorage;
  }
}
