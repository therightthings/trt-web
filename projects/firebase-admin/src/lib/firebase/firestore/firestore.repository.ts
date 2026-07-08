import { wait } from '@trt-web/core';
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  Filter,
  Firestore,
  getFirestore,
  Query,
  Timestamp,
  Transaction,
  WriteBatch,
  WriteResult,
} from 'firebase-admin/firestore';

import { CacheService, FirestoreCacheService } from '../../cache';
import {
  CacheQueryOption,
  DocumentDataWithTimestamp,
  FirestoreFilterQuery,
  firestoreLimit,
  PagingQuery,
  WhereQuery,
} from './firestore.type';

export abstract class FireStoreRepository {
  private readonly cacheService = FirestoreCacheService.getInstance();
  protected readonly store: Firestore = getFirestore();
  protected collectionPath = '';
  protected docPath = '';

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  get collectionRef() {
    return this.store.collection(this.collectionPath);
  }

  get docRef() {
    return this.store.doc(this.docPath);
  }

  async backfillTimestamp() {
    const batch = this.store.batch();
    const snapshot = await this.store.collection(this.collectionPath).get();

    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data() as DocumentDataWithTimestamp;
      if (!data.createdAt) {
        batch.update(doc.ref, {
          createdAt: doc.createTime,
        });
        console.log(`[${doc.id}] added createdAt field`);
        await wait(500);
      }
      if (!data.updatedAt) {
        batch.update(doc.ref, {
          updatedAt: doc.updateTime,
        });
        console.log(`[${doc.id}] added updatedAt field`);
        await wait(500);
      }
    }

    await batch.commit().then(async () => {
      const totalCount = await this.getTotalCount();
      console.log(`Backfilled timestamp for ${totalCount} old documents`);
    });
  }

  getTimestamp(doc: DocumentSnapshot) {
    const data = doc.data() as DocumentDataWithTimestamp;
    let createdAt = doc.createTime;
    let updatedAt = doc.updateTime;

    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt;
    }
    if (data.updatedAt instanceof Timestamp) {
      updatedAt = data.updatedAt;
    }

    return {
      createdAt: createdAt ? createdAt.toDate().toISOString() : '',
      updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
    };
  }

  private buildFirestoreFilter(filter: FirestoreFilterQuery): Filter {
    if ('field' in filter) {
      return Filter.where(filter.field, filter.op, filter.value);
    }

    const nestedFilters = filter.filters.map((item) => this.buildFirestoreFilter(item));

    return filter.operator === 'and' ? Filter.and(...nestedFilters) : Filter.or(...nestedFilters);
  }

  async getTotalCount(
    whereOrFilter: WhereQuery[] | FirestoreFilterQuery = [],
    options?: Omit<CacheQueryOption, 'select'>,
  ) {
    const where = Array.isArray(whereOrFilter) ? whereOrFilter : [];
    const filter = Array.isArray(whereOrFilter) ? null : whereOrFilter;
    const enabledCollectionGroup = options?.collectionGroup ?? false;
    const enabledCache = options?.cache ?? false;
    const enabledDebug = options?.debug ?? false;
    const cacheTtl = options?.cacheTtl ?? { value: 10, unit: 'minute' };
    const cacheKey = this.cacheService.getRepositoryKey(this.collectionPath, {
      method: 'get-total-count',
      id: {
        where,
        filter,
      },
    });
    if (enabledCache) {
      const cached = this.cacheService.get<number>(cacheKey);
      if (cached != undefined && cached != null) {
        if (CacheService.config.debug) {
          console.log(`[cache-repo] get-total-count served from ${cacheKey}`);
        }
        return cached;
      }
    }

    let ref: Query = this.store.collection(this.collectionPath);

    if (enabledCollectionGroup) {
      ref = this.store.collectionGroup(this.collectionPath);
    }

    if (Array.isArray(where) && where.length > 0) {
      for (const c of where) {
        ref = ref.where(c.field, c.op, c.value);
      }
    }
    if (filter) {
      ref = ref.where(this.buildFirestoreFilter(filter));
    }
    const snap = await ref.count().get();
    const count = snap.data().count;

    if (enabledCache) {
      this.cacheService.set(cacheKey, count, cacheTtl);
    }

    if (enabledDebug) {
      console.log(
        '[firestore] getTotalCount',
        JSON.stringify(
          {
            collection: this.collectionPath,
            where: where,
            filter: filter,
            cache: enabledCache,
            cacheTtl: enabledCache ? cacheTtl : null,
          },
          null,
          2,
        ),
      );
    }

    return count;
  }

  async getPagingDocuments<T = any>(
    paging: PagingQuery<T>,
    options?: Omit<CacheQueryOption, 'select'>,
  ): Promise<{
    data: T[];
    lastId: string | null;
  }> {
    paging.limit ??= 20;
    paging.unlimited ??= false;
    const debug = options?.debug ?? false;

    // caching
    const enabledCollectionGroup = options?.collectionGroup ?? false;
    const enabledCache = options?.cache ?? false;
    const cacheKey = this.cacheService.getRepositoryKey(this.collectionPath, {
      method: 'get-many',
      id: {
        where: paging.where,
        filter: paging.filter,
        sort: paging.sort,
        limit: paging.limit,
        lastId: paging.lastDocumentId,
        select: paging.select,
        collectionGroup: options?.collectionGroup,
      },
    });
    const cacheTtl = options?.cacheTtl ?? { value: 10, unit: 'minute' };
    if (enabledCache) {
      const cached = this.cacheService.get(cacheKey);
      if (cached) {
        if (CacheService.config.debug) {
          console.log(`[cache-repo] get-many served from ${cacheKey}`);
        }
        return cached as {
          data: T[];
          lastId: string | null;
        };
      }
    }

    let queryRef: Query;
    if (enabledCollectionGroup) {
      queryRef = this.store.collectionGroup(this.collectionPath);
    } else {
      queryRef = this.store.collection(this.collectionPath);
    }

    // where conditions
    if (Array.isArray(paging.where) && paging.where.length > 0) {
      for (const w of paging.where) {
        queryRef = queryRef.where(w.field, w.op, w.value);
      }
    }
    if (paging.filter) {
      queryRef = queryRef.where(this.buildFirestoreFilter(paging.filter));
    }
    // order by
    if (paging.sort != null) {
      const sorts = Array.isArray(paging.sort) ? paging.sort : [paging.sort];
      for (const s of sorts) {
        queryRef = queryRef.orderBy(s.title, s.direction || 'desc');
      }
    }
    // startAt
    if (paging.startAt != null) {
      queryRef = queryRef.startAt(paging.startAt);
    }
    // endAt
    if (paging.endAt != null) {
      queryRef = queryRef.endAt(paging.endAt);
    }
    // start after last document
    if (paging.lastDocumentId?.trim()) {
      const lastDocRef = this.store.collection(this.collectionPath).doc(paging.lastDocumentId);
      const lastDocSnap = await lastDocRef.get();
      if (lastDocSnap.exists) {
        queryRef = queryRef.startAfter(lastDocSnap);
      }
    }
    // limit
    if (!paging.unlimited && paging.limit) {
      queryRef = queryRef.limit(paging.limit);
    }
    // select
    if (Array.isArray(paging.select) && paging.select.length > 0) {
      queryRef = queryRef.select(...(paging.select as string[]));
    }

    if (debug) {
      console.log(
        '[firestore] getPagingDocuments',
        JSON.stringify(
          {
            collection: this.collectionPath,
            collectionGroup: enabledCollectionGroup,
            limit: paging.limit,
            unlimited: paging.unlimited,
            select: paging.select ? paging.select : null,
            where: paging.where ? paging.where : null,
            filter: paging.filter ? paging.filter : null,
            orderBy: paging.sort ? paging.sort : null,
            startAt: paging.startAt ? paging.startAt : null,
            endAt: paging.endAt ? paging.endAt : null,
            lastDocumentId: paging.lastDocumentId ? paging.lastDocumentId : null,
            cache: enabledCache,
            cacheTtl: enabledCache ? cacheTtl : null,
          },
          null,
          2,
        ),
      );
    }

    const snapshot = await queryRef.get();
    const documents = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        refPath: doc.ref.path,
        ...doc.data(),
        ...this.getTimestamp(doc),
      } as DocumentData & { id: string };
    });

    let lastDocumentPath: string | null = null;
    if (snapshot.docs.length > 0) {
      lastDocumentPath = snapshot.docs[snapshot.docs.length - 1].id;
    }

    const value = {
      data: documents as T[],
      lastId: lastDocumentPath,
    };

    if (enabledCache) {
      this.cacheService.set(cacheKey, value, cacheTtl);
    }

    return value;
  }

  async getDocumentById<T = any>(
    documentPath: string,
    options?: Omit<CacheQueryOption<T>, 'collectionGroup'>,
  ): Promise<T | null> {
    const debug = options?.debug ?? false;
    const enabledCache = options?.cache ?? false;
    const cacheTtl = options?.cacheTtl ?? { value: 10, unit: 'minute' };
    const cacheKey = this.cacheService.getRepositoryKey(this.collectionPath, {
      method: 'get-one',
      id: { documentPath: documentPath, select: options?.select },
    });

    if (enabledCache) {
      const cached = this.cacheService.get<T>(cacheKey);
      if (cached) {
        if (CacheService.config.debug) {
          console.log(`[cache-repo] get-one served from ${cacheKey}`);
        }
        return cached;
      }
    }

    let queryRef = this.store
      .collection(this.collectionPath)
      .where(FieldPath.documentId(), '==', documentPath)
      .limit(1);

    if (Array.isArray(options?.select) && options.select.length > 0) {
      queryRef = queryRef.select(...(options.select as string[]));
    }

    if (debug) {
      console.log(
        '[firestore] getDocumentById',
        JSON.stringify(
          {
            collection: this.collectionPath,
            select: options?.select ? options.select : null,
            cache: enabledCache,
            cacheTtl: enabledCache ? cacheTtl : null,
          },
          null,
          2,
        ),
      );
    }

    const querySnapshot = await queryRef.get();
    if (querySnapshot.empty) {
      return null;
    }

    const snapshot = querySnapshot.docs[0];
    const data = snapshot.data();

    const value = {
      id: snapshot.id,
      ...data,
      ...this.getTimestamp(snapshot),
    } as T;

    if (enabledCache) {
      this.cacheService.set(cacheKey, value, cacheTtl);
    }

    return value;
  }

  async upsertDocument<T = any>(
    value: T | Partial<T>,
    documentPath?: string,
  ): Promise<T & { id: string }> {
    let docRef: DocumentReference;
    let id: string;

    if (documentPath) {
      docRef = this.store.collection(this.collectionPath).doc(documentPath);
      id = documentPath;
      await docRef.set(value as any, { merge: true });
      console.log(
        `[firestore] merge updated document successfully: ${this.collectionPath}/${documentPath}`,
      );
    } else {
      docRef = await this.store.collection(this.collectionPath).add(value as any);
      id = docRef.id;
      console.log(`[firestore] created document successfully: ${this.collectionPath}/${docRef.id}`);
    }

    const docSnapshot = await docRef.get();
    const data = docSnapshot.data() as T;

    return { id, ...data };
  }

  async updateDocument<T = any>(documentPath: string, value: Partial<T>): Promise<WriteResult> {
    return await this.store
      .collection(this.collectionPath)
      .doc(documentPath)
      .update(value)
      .then((result) => {
        console.log(
          `[firestore] update document successfully: ${this.collectionPath}/${documentPath}`,
        );
        return result;
      });
  }

  async updateMany<T = any>(payload: { id: string; partialData: Partial<T> }[]) {
    if (!payload.length) {
      return;
    }

    const MAX_BATCH = firestoreLimit.MAX_BATCH_COMMIT;
    const batches: WriteBatch[] = [];

    for (let i = 0; i < payload.length; i += MAX_BATCH) {
      const batch = this.store.batch();
      const chunk = payload.slice(i, i + MAX_BATCH);

      chunk.forEach((data) => {
        const ref = this.collectionRef.doc(data.id);
        batch.update(ref, data.partialData);
      });
      batches.push(batch);
    }

    for (const batch of batches) {
      await batch.commit();
    }
    console.log(`[firestore] update many document successfully: ${this.collectionPath}`);
  }

  async deleteDocument(documentPath: string): Promise<WriteResult> {
    return this.store
      .collection(this.collectionPath)
      .doc(documentPath)
      .delete()
      .then((result) => {
        console.log(
          `[firestore] delete document successfully: ${this.collectionPath}/${documentPath}`,
        );
        return result;
      });
  }

  async deleteMany(ids: string[]) {
    if (!ids.length) {
      return;
    }

    const MAX_BATCH = firestoreLimit.MAX_BATCH_COMMIT;
    const batches: WriteBatch[] = [];

    for (let i = 0; i < ids.length; i += MAX_BATCH) {
      const batch = this.store.batch();
      const chunk = ids.slice(i, i + MAX_BATCH);

      chunk.forEach((id) => {
        const ref = this.collectionRef.doc(id);
        batch.delete(ref);
      });

      batches.push(batch);
    }

    for (const batch of batches) {
      await batch.commit();
    }

    console.log(`[firestore] delete many document successfully: ${this.collectionPath}`);
  }

  runTransaction<T>(updateFn: (tx: Transaction) => Promise<any>) {
    return this.store.runTransaction(updateFn);
  }
}
