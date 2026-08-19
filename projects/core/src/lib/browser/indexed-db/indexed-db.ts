import { requireBrowserEnv, stringify, toError } from '../../utils';
import {
  IndexedDBCollectionConfig,
  IndexedDBDatabaseConfig,
  IndexedDBRecord,
} from './indexed-db.type';

export type IndexedDBDatabase = {
  collection<T extends IndexedDBRecord>(collection: string): IndexedDB<T>;
};

/**
 * Typed IndexedDB database and collection helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
export class IndexedDB<T extends IndexedDBRecord> {
  private static readonly instances = new Map<string, IndexedDB<IndexedDBRecord>>();
  private static readonly databaseConfigs = new Map<string, IndexedDBDatabaseConfig>();
  private readonly database: string;
  private readonly collection: string;
  private dbVersion: number;

  private constructor(config: IndexedDBCollectionConfig) {
    this.database = config.database;
    this.collection = config.collection;

    const existedVersion = IndexedDB.databaseConfigs.get(config.database)?.version ?? 1;
    this.dbVersion = config.dbVersion ?? existedVersion;
  }

  private static createCollection<T extends IndexedDBRecord>(
    config: IndexedDBCollectionConfig,
  ): IndexedDB<T> {
    const key = stringify([config.database, config.collection]);
    const existing = this.instances.get(key);

    if (existing) {
      existing.dbVersion = Math.max(existing.dbVersion, config.dbVersion ?? 1);
      return existing as IndexedDB<T>;
    }

    const instance = new IndexedDB<T>(config);
    this.instances.set(key, instance as IndexedDB<IndexedDBRecord>);

    return instance;
  }

  static register(config: IndexedDBDatabaseConfig): IndexedDBDatabase {
    if (!config.database || !Number.isInteger(config.version) || config.version < 1) {
      throw new Error('IndexedDB database and a positive integer version are required.');
    }

    if (!config.collections.length) {
      throw new Error('At least one IndexedDB collection is required.');
    }

    const existingConfig = this.databaseConfigs.get(config.database);
    const normalizedConfig = {
      database: config.database,
      version: Math.max(config.version, existingConfig?.version ?? 1),
      collections: [...new Set([...(existingConfig?.collections ?? []), ...config.collections])],
    };
    this.databaseConfigs.set(config.database, normalizedConfig);

    return {
      collection: <T extends IndexedDBRecord>(collection: string) => {
        if (!normalizedConfig.collections.includes(collection)) {
          throw new Error(`Collection "${collection}" is not registered.`);
        }

        return this.createCollection<T>({
          database: normalizedConfig.database,
          collection,
          dbVersion: normalizedConfig.version,
        });
      },
    };
  }

  static isSupported(): boolean {
    requireBrowserEnv();

    return typeof indexedDB !== 'undefined';
  }

  static async databases(): Promise<IDBDatabaseInfo[]> {
    requireBrowserEnv();

    if (typeof indexedDB.databases !== 'function') {
      return [];
    }

    return indexedDB.databases();
  }

  private openDB(): Promise<IDBDatabase> {
    requireBrowserEnv();

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.database, this.dbVersion);
      let settled = false;

      request.onupgradeneeded = () => {
        const db = request.result;
        const registered = IndexedDB.databaseConfigs.get(this.database);
        const collections = new Set([...(registered?.collections ?? []), this.collection]);

        for (const collection of collections) {
          if (!db.objectStoreNames.contains(collection)) {
            db.createObjectStore(collection, { keyPath: 'id' });
          }
        }
      };

      request.onblocked = () => {
        if (!settled) {
          settled = true;
          reject(new Error(`Opening database "${this.database}" was blocked.`));
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
        };
        if (settled) {
          db.close();
          return;
        }
        settled = true;
        resolve(db);
      };
      request.onerror = () => {
        if (!settled) {
          settled = true;
          reject(toError(request.error, 'Could not open IndexedDB.'));
        }
      };
    });
  }

  private async run<TValue>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<TValue>,
  ): Promise<TValue> {
    const db = await this.openDB();

    try {
      const tx = db.transaction(this.collection, mode);
      const request = operation(tx.objectStore(this.collection));

      return await new Promise<TValue>((resolve, reject) => {
        let result: TValue;
        let settled = false;

        const fail = (error: unknown, fallbackMessage: string) => {
          if (!settled) {
            settled = true;
            reject(toError(error, fallbackMessage));
          }
        };

        request.onsuccess = () => {
          result = request.result;
        };
        request.onerror = () => {
          fail(request.error, 'IndexedDB request failed.');
        };
        tx.oncomplete = () => {
          if (!settled) {
            settled = true;
            resolve(result);
          }
        };
        tx.onerror = () => {
          fail(tx.error, 'IndexedDB transaction failed.');
        };
        tx.onabort = () => {
          fail(tx.error, 'IndexedDB transaction was aborted.');
        };
      });
    } finally {
      db.close();
    }
  }

  async add(item: T): Promise<void> {
    await this.run('readwrite', (store) => {
      return store.add(item);
    });
  }

  async put(item: T): Promise<void> {
    await this.run('readwrite', (store) => {
      return store.put(item);
    });
  }

  async get(id: IDBValidKey): Promise<T | undefined> {
    return this.run('readonly', (store) => {
      return store.get(id);
    }) as Promise<T | undefined>;
  }

  async getAll(): Promise<T[]> {
    return this.run('readonly', (store) => {
      return store.getAll();
    }) as Promise<T[]>;
  }

  async remove(id: IDBValidKey): Promise<void> {
    await this.run('readwrite', (store) => {
      return store.delete(id);
    });
  }

  async clear(): Promise<void> {
    await this.run('readwrite', (store) => {
      return store.clear();
    });
  }
}
