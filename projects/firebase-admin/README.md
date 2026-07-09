# @trt-web/firebase-admin

- Shared Firebase Admin helpers for backend services

## Installation

- With NPM (or Yarn, Bun,...):

```bash
npm install @trt-web/firebase-admin
```

## Compatibility

- Firebase Admin SDK 14 and newer.

## Cache

- `withCache`: wrap Express GET routes with response caching.
- `CacheService`: low-level in-memory cache wrapper.
- `FirestoreCacheService`: versioned cache helper for Firestore repositories.
- `NetworkCacheService`: cache key helper for network responses.

## Firebase

- `FireAuthService`: authentication helpers for Firebase Admin.
- `FireStoreRepository`: base Firestore repository with query, paging, mutation, and transaction helpers.
- `FirebaseMessagingService`: Firebase Cloud Messaging helpers.
