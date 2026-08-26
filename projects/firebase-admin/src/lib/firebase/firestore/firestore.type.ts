import type { TimeConfig } from '@trt-web/core';
import { DocumentData, Timestamp, WhereFilterOp } from 'firebase-admin/firestore';

export const firestoreLimit = {
  MAX_IN_VALUES: 30,
  MAX_ARRAY_CONTAINS_ANY_VALUES: 30,
  MAX_BATCH_COMMIT: 500,
  MAX_NOT_IN_VALUES: 10,
  MAX_WHERE_CONDITIONS: 100,
  MAX_ORDERBY_FIELDS: 100,
  MAX_DISJUNCTIONS: 30,
  MAX_ARRAY_CONTAINS_CLAUSES: 1,
  ALLOW_MULTIPLE_NOT_IN: false,
};

export type RepositoryMethod = 'get-many' | 'get-total-count' | 'get-one';

export type DocumentDataWithTimestamp = DocumentData & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export interface WhereQuery {
  field: string;
  op: WhereFilterOp;
  value: any;
}

export type FirestoreFilterQuery =
  | WhereQuery
  | {
      operator: 'and' | 'or';
      filters: FirestoreFilterQuery[];
    };

export interface PagingQuery<T = any> {
  limit?: number;
  unlimited?: boolean;
  lastDocumentId?: string;
  sort?: SortQuery | SortQuery[];
  startAt?: any;
  endAt?: any;
  where?: WhereQuery[];
  filter?: FirestoreFilterQuery;
  select?: (keyof T)[];
}

export interface CacheQueryOption<T = any> {
  cache?: boolean;
  cacheTtl?: TimeConfig;
  collectionGroup?: boolean;
  debug?: boolean;
  select?: (keyof T)[];
}

export interface SortQuery {
  title: string;
  direction?: 'asc' | 'desc';
}
