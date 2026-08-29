# @trt-web/firebase-admin

Firebase Admin utilities for authentication, Firestore, storage, messaging, and backend services.

## Installation

```bash
npm install @trt-web/firebase-admin
```

## Compatibility

Firebase Admin SDK 14 and newer.

## Cache

Cache utilities for Express routes, Firestore repositories, and network data.

### Cache Middleware

Provides Express middleware and in-memory cache helpers for HTTP responses.

#### Methods

- `withCache`: wrap Express GET routes with response caching.
- `CacheService.getInstance(): CacheService`: get the shared cache service.
- `CacheService.get<T>(key: string): T | undefined`: read a cached value.
- `CacheService.set(key: string, value: unknown, ttl: number | TimeConfig): void`: store a value with a TTL.
- `CacheService.delete(key: string): void`: remove a cached value.
- `CacheService.deleteByPrefix(prefix: string): void`: remove values by key prefix.

#### Examples

- Basic usage

```ts
import { CacheService } from '@trt-web/firebase-admin';
const cache = CacheService.getInstance(); // singleton pattern
cache.set('profile:42', { id: 42 }, 60);
const profile = cache.get<{ id: number }>('profile:42');
```

- Advance usage

```ts
import { CacheService } from '@trt-web/firebase-admin';
const cache = CacheService.getInstance();
cache.set('profile:42', { id: 42 }, 60);
const profile = cache.get<{ id: number }>('profile:42');
```

- Expert usage

```ts
import { CacheService } from '@trt-web/firebase-admin';
const cache = CacheService.getInstance();
cache.set('profile:42', { id: 42 }, 60);
const profile = cache.get<{ id: number }>('profile:42');
```

### Firestore Cache

Provides versioned cache helpers for Firestore repositories.

#### Methods

- `FirestoreCacheService.getInstance(): FirestoreCacheService`: get the shared Firestore cache service.
- `get<T>(key: string): T | undefined`: read a cached repository value.
- `set(key: string, value: unknown, ttl: number | TimeConfig): void`: cache a repository value.
- `getRepositoryKey(...): string`: create a repository cache key.
- `bumpRepositoryVersion(...): void`: invalidate repository cache entries.

#### Examples

```ts
import { FirestoreCacheService } from '@trt-web/firebase-admin';
const cache = FirestoreCacheService.getInstance();
cache.bumpRepositoryVersion('users');
```

### Network Cache

Creates scoped cache keys and invalidates cached network responses.

#### Methods

- `NetworkCacheService.getInstance(): NetworkCacheService`: get the shared network cache service.
- `get<T>(key: string): T | undefined`: read a cached network value.
- `set(key: string, value: unknown, ttl: number | TimeConfig): void`: cache a network value.
- `delete(key: string): void`: remove a cached network value.
- `deleteByPrefix(prefix: string): void`: remove network values by prefix.
- `getNetworkKey(config: { userId?: string; url: string }): string`: create a network cache key.
- `bumpNetworkVersion(userId: string, scopes: CacheScope[]): void`: invalidate network cache scopes.

#### Examples

```ts
import { NetworkCacheService } from '@trt-web/firebase-admin';
const cache = NetworkCacheService.getInstance();
const key = cache.getNetworkKey({ userId: 'user-42', url: '/profile' });
cache.set(key, { name: 'Alice' }, 60);
```

## Firebase

Firebase Admin authentication, Firestore, Storage, and messaging helpers.

### Fire Auth

Provides Firebase Admin authentication and user-account helpers.

#### Methods

- `FireAuthService.getInstance(): FireAuthService`: get the shared authentication service.
- `verifyIdToken(idToken: string)`: verify an ID token.
- `createSessionCookie(idToken: string, expiresInMs: number)`: create a session cookie.
- `revokeUserTokens(uid: string)`: revoke user refresh tokens.
- `getUser(uid: string)`: get a user by UID.
- `getUserByPhoneNumber(phoneNumber: string)`: get a user by phone number.
- `createUserWithPhone(phoneNumber: string)`: create a user with a phone number.
- `deleteUser(uid: string)`: delete a user.

#### Examples

```ts
import { FireAuthService } from '@trt-web/firebase-admin';
const auth = FireAuthService.getInstance();
const user = await auth.verifyIdToken(idToken);
```

### Firestore Repository

Provides a reusable base repository for Firestore queries, paging, mutations, and transactions.

#### Methods

- `backfillTimestamp(): Promise<void>`: backfill missing document timestamps.
- `getTimestamp(doc: DocumentSnapshot): Timestamp`: read a document timestamp.
- `getTotalCount(...): Promise<number>`: count matching documents.
- `getDocumentById(...): Promise<T | undefined>`: get a document by ID.
- `getPagingDocuments(...): Promise<U[]>`: read a page of documents.
- `createDocument(value: Omit<T, 'id'>): Promise<T & { id: string }>`: create a document.
- `upsertDocument(...): Promise<T>`: create or replace a document.
- `updateDocument(...): Promise<WriteResult>`: update a document.
- `updateMany(...): Promise<WriteResult[]>`: update multiple documents.
- `deleteDocument(documentPath: string): Promise<WriteResult>`: delete a document.
- `deleteMany(ids: string[]): Promise<WriteResult[]>`: delete multiple documents.
- `runTransaction<T>(updateFn: ...): Promise<T>`: run a Firestore transaction.

#### Examples

```ts
import { FireStoreRepository } from '@trt-web/firebase-admin';
class UserRepository extends FireStoreRepository<User> {
  constructor() {
    super('users');
  }
}
```

### Fire Storage

Provides Firebase Storage upload, download URL, metadata, and multipart form helpers.

#### Methods

- `deleteFile(path: string): Promise<void>`: delete a Storage file.
- `deleteFileFromStorage(path: string): Promise<boolean>`: delete a file and return its status.
- `getFileMetadata(path: string): Promise<object>`: read file metadata.
- `getDownloadUrl(path: string, token: string): string`: create a tokenized download URL.
- `getPublicDownloadUrl(path: string): string`: create a public download URL.
- `upload(...): Promise<...>`: upload file data.
- `uploadFileToFirestoreStorage(...): Promise<...>`: upload a file from a form payload.
- `readFormData<T>(...): Promise<T>`: parse multipart form data.

#### Examples

```ts
import { FireStorageService } from '@trt-web/firebase-admin';
const storage = new FireStorageService();
const url = storage.getPublicDownloadUrl('images/avatar.png');
```

### Firebase Messaging

Provides Firebase Cloud Messaging delivery, topic, and token helpers.

#### Methods

- `FirebaseMessagingService.getInstance(): FirebaseMessagingService`: get the shared messaging service.
- `sendToDevice(...): Promise<...>`: send a message to one device.
- `sendToMultipleDevices(...): Promise<...>`: send a message to multiple devices.
- `sendToTopic(...): Promise<...>`: send a message to a topic.
- `subscribeToTopic(token: string, topic: string): Promise<...>`: subscribe a token to a topic.
- `unsubscribeFromTopic(token: string, topic: string): Promise<...>`: unsubscribe a token.
- `validateTokens(tokens: string[]): Promise<...>`: validate messaging tokens.

#### Examples

```ts
import { FirebaseMessagingService } from '@trt-web/firebase-admin';
const messaging = FirebaseMessagingService.getInstance();
await messaging.sendToTopic('news', { notification: { title: 'Update' } });
```
