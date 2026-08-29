export type IndexedDBCollectionConfig = {
  database: string;
  collection: string;
  dbVersion?: number;
};

export type IndexedDBDatabaseConfig = {
  database: string;
  version: number;
  collections: string[];
};

export type IndexedDBRecord = { id: IDBValidKey };
