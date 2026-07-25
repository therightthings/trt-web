import { afterEach, describe, expect, it, vi } from 'vitest';

import { IndexedDB } from './indexed-db';

type User = { id: number; name: string };

class FakeRequest<T> {
  result!: T;
  error: DOMException | null = null;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;

  succeed(result: T) {
    this.result = result;
    queueMicrotask(() => this.onsuccess?.());
  }
}

class FakeStore {
  constructor(private readonly records: Map<IDBValidKey, User>) {}

  add(item: User) {
    const request = new FakeRequest<IDBValidKey>();
    queueMicrotask(() => {
      if (this.records.has(item.id)) {
        request.error = new DOMException('Duplicate key', 'ConstraintError');
        request.onerror?.();
        return;
      }

      this.records.set(item.id, item);
      request.succeed(item.id);
    });
    return request;
  }

  put(item: User) {
    const request = new FakeRequest<IDBValidKey>();
    queueMicrotask(() => {
      this.records.set(item.id, item);
      request.succeed(item.id);
    });
    return request;
  }

  get(id: IDBValidKey) {
    const request = new FakeRequest<User | undefined>();
    queueMicrotask(() => request.succeed(this.records.get(id)));
    return request;
  }

  getAll() {
    const request = new FakeRequest<User[]>();
    queueMicrotask(() => request.succeed([...this.records.values()]));
    return request;
  }

  delete(id: IDBValidKey) {
    const request = new FakeRequest<undefined>();
    queueMicrotask(() => {
      this.records.delete(id);
      request.succeed(undefined);
    });
    return request;
  }

  clear() {
    const request = new FakeRequest<undefined>();
    queueMicrotask(() => {
      this.records.clear();
      request.succeed(undefined);
    });
    return request;
  }
}

class FakeDatabase {
  readonly objectStoreNames = {
    contains: (name: string) => this.stores.has(name),
  };
  onversionchange: (() => void) | null = null;
  private readonly stores = new Map<string, Map<IDBValidKey, User>>();

  createObjectStore(name: string) {
    const records = new Map<IDBValidKey, User>();
    this.stores.set(name, records);
    return new FakeStore(records);
  }

  transaction(name: string, _mode: IDBTransactionMode) {
    const records = this.stores.get(name);
    if (!records) {
      throw new Error(`Object store ${name} does not exist.`);
    }

    const transaction = {
      error: null,
      onabort: null as (() => void) | null,
      oncomplete: null as (() => void) | null,
      onerror: null as (() => void) | null,
      objectStore: () => new FakeStore(records),
    };

    setTimeout(() => transaction.oncomplete?.(), 0);
    return transaction;
  }

  close = vi.fn();
}

function createIndexedDbMock() {
  const databases = new Map<string, FakeDatabase>();

  return {
    databases: vi.fn(async () => [{ name: 'test-db', version: 1 }]),
    open: vi.fn((name: string, _version: number) => {
      const request = new FakeRequest<FakeDatabase>() as FakeRequest<FakeDatabase> & {
        onupgradeneeded: (() => void) | null;
        onblocked: (() => void) | null;
      };
      request.onupgradeneeded = null;
      request.onblocked = null;

      queueMicrotask(() => {
        let database = databases.get(name);
        if (!database) {
          database = new FakeDatabase();
          databases.set(name, database);
          request.result = database;
          request.onupgradeneeded?.();
        }

        request.succeed(database);
      });

      return request;
    }),
  };
}

function stubBrowserShell() {
  vi.stubGlobal('window', { document: {} });
  vi.stubGlobal('document', {});
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('IndexedDB', () => {
  it('returns the same instance for the same database and collection', () => {
    const database = IndexedDB.register({
      database: 'singleton-db',
      version: 1,
      collections: ['users', 'products'],
    });
    const first = database.collection<User>('users');
    const second = database.collection<User>('users');
    const products = database.collection<User>('products');

    expect(first).toBe(second);
    expect(first).not.toBe(products);
  });

  it('checks whether IndexedDB is supported', () => {
    stubBrowserShell();
    expect(IndexedDB.isSupported()).toBe(false);

    vi.stubGlobal('indexedDB', createIndexedDbMock());
    expect(IndexedDB.isSupported()).toBe(true);
  });

  it('registers database collections and lists databases', async () => {
    stubBrowserShell();
    const indexedDb = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDb);

    const registeredDatabase = IndexedDB.register({
      database: 'registered-db',
      version: 1,
      collections: ['users', 'products', 'users'],
    });

    const users = registeredDatabase.collection<User>('users');
    expect(users).toBe(registeredDatabase.collection<User>('users'));

    await expect(IndexedDB.databases()).resolves.toEqual([{ name: 'test-db', version: 1 }]);
    expect(indexedDb.databases).toHaveBeenCalledTimes(1);
  });

  it('adds, reads, lists, removes, and clears records', async () => {
    stubBrowserShell();
    const indexedDb = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDb);
    const database = IndexedDB.register({
      database: 'test-db',
      version: 1,
      collections: ['users'],
    }).collection<User>('users');

    await database.add({ id: 1, name: 'Alice' });
    await expect(database.get(1)).resolves.toEqual({ id: 1, name: 'Alice' });
    await expect(database.getAll()).resolves.toEqual([{ id: 1, name: 'Alice' }]);

    await database.remove(1);
    await expect(database.get(1)).resolves.toBeUndefined();

    await database.add({ id: 2, name: 'Bob' });
    await database.put({ id: 2, name: 'Updated Bob' });
    await expect(database.get(2)).resolves.toEqual({ id: 2, name: 'Updated Bob' });
    await database.clear();
    await expect(database.getAll()).resolves.toEqual([]);
  });

  it('rejects duplicate keys and closes database connections', async () => {
    stubBrowserShell();
    const indexedDb = createIndexedDbMock();
    vi.stubGlobal('indexedDB', indexedDb);
    const database = IndexedDB.register({
      database: 'test-db',
      version: 1,
      collections: ['users'],
    }).collection<User>('users');

    await database.add({ id: 1, name: 'Alice' });
    await expect(database.add({ id: 1, name: 'Duplicate' })).rejects.toThrow('Duplicate key');

    const openedDatabase = (await new Promise<FakeDatabase>((resolve) => {
      const request = indexedDb.open('test-db', 1);
      request.onsuccess = () => resolve(request.result);
    })) as FakeDatabase;

    expect(openedDatabase.close).toHaveBeenCalled();
  });
});
