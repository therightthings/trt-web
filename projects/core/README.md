# @trt-web/core

- Shared building blocks for cleaner web apps

## Installation

- With NPM (or Yarn, Bun,...):

```bash
npm install @trt-web/core
```

## Public API

### Direct exports

- `BrowserClipboard`
  - `copy`: copy text to the clipboard.
  - `read`: read text from the clipboard.

  ```ts
  const copied = await BrowserClipboard.copy('Copied from the browser');
  const text = await BrowserClipboard.read();
  console.log(copied); // { permission: 'granted', data: 'Copied from the browser', success: true }
  console.log(text); // 'Copied from the browser'

  const blocked = await BrowserClipboard.copy('Blocked text');
  console.log(blocked); // { permission: 'denied', success: false }
  ```

- `BrowserEnvironment`
  - `getLocale`: get the user's preferred locale.
  - `getInformation`: get browser environment, hardware, battery, storage, screen, or all information.

  ```ts
  import { BrowserEnvironment } from '@trt-web/core';

  const locale = BrowserEnvironment.getLocale();
  const hardware = await BrowserEnvironment.getInformation({ scope: 'hardware' });
  const battery = await BrowserEnvironment.getInformation({ scope: 'battery' });
  const environment = await BrowserEnvironment.getInformation({ scope: 'environment' });
  const screen = await BrowserEnvironment.getInformation({ scope: 'screen' });
  const all = await BrowserEnvironment.getInformation(); // 'all' is the default scope

  console.log(locale); // 'en'
  console.log(hardware); // { hardware: { cores: 8, memoryGB: 16 } }
  console.log(battery); // { battery: { charging: true, percent: 50 } }
  console.log(environment); // { environment: { locale: 'en-US', preferredLanguages: ['en-US', 'vi-VN'], os: 'macOS', browser: 'Safari', browserVersion: 17, engine: 'WebKit', deviceType: 'desktop' } }
  console.log(screen.screenInfo.window); // { innerWidth: 1280, innerHeight: 720, outerHeight: 900, outerWidth: 1440 }
  console.log(all.storageHealth); // { ratio: 0.5, quotaGB: 0, persistent: true, risk: 'low' }
  ```

- `BrowserLocation`
  - `getLocation`: get the current geolocation with permission handling and speed presets.

  ```ts
  const location = await BrowserLocation.getLocation({ speed: 'fast' });
  console.log(location); // { permission: 'granted', data: { coords: { latitude: 5, longitude: 6 } }, success: true }
  console.log(await BrowserLocation.getLocation({ speed: 'accurate' })); // { permission: 'granted', data: { coords: { latitude: 3, longitude: 4 } }, success: true }
  console.log(await BrowserLocation.getLocation()); // { permission: 'unsupported', success: false } when geolocation is unavailable
  ```

- `BrowserPermission`
  - `getState`: check the state of a browser permission.
  - `request`: request a browser permission.

  ```ts
  const current = await BrowserPermission.getState('geolocation');
  const requested = current === 'prompt' ? await BrowserPermission.request('geolocation') : current;
  console.log(current); // 'granted' | 'denied' | 'prompt' | 'unsupported'
  console.log(requested); // 'granted' when permission is granted
  console.log(await BrowserPermission.request('notifications')); // 'prompt' when the browser returns 'default'
  console.log(await BrowserPermission.request('geolocation')); // 'denied' when the user rejects access
  ```

- `BrowserPresentation`
  - `enterFullscreen`: enter fullscreen mode for an element.
  - `exitFullscreen`: exit fullscreen mode.
  - `enterPictureInPicture`: enter picture-in-picture mode for a video.
  - `exitPictureInPicture`: exit picture-in-picture mode.

  ```ts
  const entered = await BrowserPresentation.enterFullscreen(element);
  const exited = await BrowserPresentation.exitFullscreen();
  console.log({ entered, exited }); // { entered: true, exited: true }
  console.log(await BrowserPresentation.enterFullscreen()); // false when fullscreen is unsupported
  console.log(await BrowserPresentation.enterPictureInPicture(video)); // true
  console.log(await BrowserPresentation.exitPictureInPicture()); // true
  ```

- `BrowserResource`
  - `assetUrl`: resolve an asset path against the document base URL.
  - `isCached`: check whether a browser resource is cached.
  - `loadScript`: load a script once and reuse concurrent requests.
  - `loadLink`: load a stylesheet once and reuse concurrent requests.
  - `download`: download a URL, Blob, or File with an optional filename and target.

  ```ts
  import { BrowserResource } from '@trt-web/core';

  await BrowserResource.loadScript('/assets/analytics.js');
  await BrowserResource.loadLink('/assets/theme.css');

  const cached = await BrowserResource.isCached('/assets/theme.css');

  BrowserResource.download('/exports/report.pdf', {
    name: 'monthly-report',
    ext: 'pdf',
    target: '_self',
  });

  console.log({ cached }); // { cached: true } when the resource is found in Cache Storage or has a zero transfer size
  console.log(BrowserResource.assetUrl('assets/theme.css')); // 'https://example.com/app/assets/theme.css'
  ```

- `BrowserShare`
  - `share`: share content through the Web Share API.

  ```ts
  const result = await BrowserShare.share({
    title: 'Monthly report',
    text: 'The report is ready.',
    url: 'https://example.com/report',
  });
  console.log(result); // { permission: 'granted', data: { title: 'Monthly report', text: 'The report is ready.', url: 'https://example.com/report' }, success: true }
  console.log(await BrowserShare.share({ text: 'Not shareable' })); // { permission: 'denied', success: false } when navigator.canShare() returns false
  console.log(await BrowserShare.share({ text: 'Cancelled' })); // { permission: 'granted', success: false } when navigator.share() rejects
  ```

- `IndexedDB`
  - `isSupported`: check whether IndexedDB is available in the browser.
  - `register`: register a database and return its database handle.
  - `collection`: get a singleton collection instance from a database handle.
  - `databases`: list databases available on the current origin.
  - `add`: add an item to a collection.
  - `put`: add or replace an item by its `id`.
  - `get`: get an item by its `id`.
  - `getAll`: get all items from a collection.
  - `remove`: remove an item by its `id`.
  - `clear`: remove all items from a collection.

  ```ts
  import { IndexedDB } from '@trt-web/core';

  type User = {
    id: number;
    name: string;
    email: string;
  };

  if (IndexedDB.isSupported()) {
    const appDatabase = IndexedDB.register({
      database: 'MyAppDB',
      version: 1,
      collections: ['users'],
    });

    const users = appDatabase.collection<User>('users');

    await users.put({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
    });

    const user = await users.get(1);
    const allUsers = await users.getAll();

    console.log(user); // { id: 1, name: 'Alice', email: 'alice@example.com' }
    console.log(allUsers); // [{ id: 1, name: 'Alice', email: 'alice@example.com' }]

    await users.remove(1);
    await users.clear();

    // The record is removed and the collection is empty after clear().
  }
  ```

Register the database before using its collections. Increase `version` when
adding collections or changing the database schema.

- `Cookie`
  - `isSupported`: check whether cookies are supported and enabled.
  - `set`: store typed data in a cookie.
  - `get`: read typed data from a cookie.
  - `remove`: remove a cookie.
  - `clear`: remove all accessible cookies.
  - `exists`: check whether a cookie exists.

  ```ts
  Cookie.set('preferences', { theme: 'dark' }, { expiresIn: 7 });
  const preferences = Cookie.get<{ theme: string }>('preferences');
  console.log(preferences, Cookie.exists('preferences')); // { theme: 'dark' } true
  Cookie.set('session', { active: true }, { expiresIn: { value: 1, unit: 'hour' } });
  console.log(Cookie.get('session')); // { active: true }
  Cookie.remove('preferences');
  Cookie.clear();
  console.log(Cookie.get('session')); // undefined
  ```

- `LocalStorage`
  - `isSupported`: check whether `localStorage` is supported and available.
  - `set`: store typed data in `localStorage`.
  - `get`: read typed data from `localStorage`.
  - `remove`: remove an item from `localStorage`.
  - `clear`: remove all items from `localStorage`.
  - `exists`: check whether a key exists in `localStorage`.

  ```ts
  LocalStorage.set('profile', { id: 1, name: 'Alice' });
  const profile = LocalStorage.get<{ id: number; name: string }>('profile');
  console.log(profile, LocalStorage.exists('profile')); // { id: 1, name: 'Alice' } true
  LocalStorage.remove('profile');
  console.log(LocalStorage.get('profile')); // undefined
  LocalStorage.clear();
  ```

- `SessionStorage`
  - `isSupported`: check whether `sessionStorage` is supported and available.
  - `set`: store typed data in `sessionStorage`.
  - `get`: read typed data from `sessionStorage`.
  - `remove`: remove an item from `sessionStorage`.
  - `clear`: remove all items from `sessionStorage`.
  - `exists`: check whether a key exists in `sessionStorage`.

  ```ts
  SessionStorage.set('draft', { title: 'Untitled' });
  console.log(SessionStorage.get('draft')); // { title: 'Untitled' }
  console.log(SessionStorage.exists('draft')); // true
  SessionStorage.remove('draft');
  console.log(SessionStorage.get('draft')); // undefined
  SessionStorage.clear();
  ```

### trt.browser

- `createWorker`: create a Web Worker from a function.

  ```ts
  const worker = trt.browser.createWorker((value: number) => value * 2);
  worker.terminate();
  console.log(worker instanceof Worker); // true
  ```

- `runWorker`: run a function in a Web Worker and resolve its result.

  ```ts
  const sum = await trt.browser.runWorker(
    (values: number[]) => values.reduce((total, value) => total + value, 0),
    [2, 3],
  );
  console.log(sum); // 5
  ```

### trt.date

- `generateTimestamp`: generate a timestamp value.

  ```ts
  console.log(trt.date.generateTimestamp()); // '2026-07-25T...Z'
  ```

- `getDateRange`: resolve common preset ranges and dynamic ranges into `startDate` / `endDate`.

  ```ts
  const range = trt.date.getDateRange('this_week', new Date('2026-07-03T17:00:00.000Z'));
  console.log(range); // { startDate: '2026-06-29', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 3, unit: 'day' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2026-06-30', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('last_7_days', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-06-27', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('today', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-07-03', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('yesterday', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-07-02', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('last_30_days', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-06-04', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('this_month', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-07-01', endDate: '2026-07-03' }
  console.log(trt.date.getDateRange('this_year', new Date('2026-07-03T17:00:00.000Z'))); // { startDate: '2026-01-01', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 2, unit: 'week' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2026-06-19', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 1, unit: 'month' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2026-06-03', endDate: '2026-07-03' }
  console.log(
    trt.date.getDateRange({ value: 1, unit: 'year' }, new Date('2026-07-03T17:00:00.000Z')),
  ); // { startDate: '2025-07-03', endDate: '2026-07-03' }
  ```

### trt.dom

- `generateRandomColor`: generate a random color value.

  ```ts
  const color = trt.dom.generateRandomColor({ format: 'rgb', opacity: 0.5 });
  console.log(color); // 'rgba(36, 149, 97, 0.5)' (random RGB values)
  console.log(trt.dom.generateRandomColor({ format: 'hex', opacity: 0.5 })); // '#RRGGBBAA' (8-character lowercase hex)
  console.log(trt.dom.generateRandomColor()); // '#RRGGBB' (lowercase random hex color)
  console.log(trt.dom.generateRandomColor({ format: 'rgb' })); // 'rgb(R, G, B)'
  ```

- `getElementInfo`: read size and position details from an element.

  ```ts
  const info = trt.dom.getElementInfo(document.querySelector('#app')!);
  console.log(info); // { width: 640, height: 480, top: 0, left: 0, right: 640, bottom: 480 }
  ```

- `varCSS`: read/write CSS custom property values.

  ```ts
  trt.dom.varCSS('--brand-color', '#2563eb'); // set value
  console.log(trt.dom.varCSS('--brand-color')); // '#2563eb'
  ```

### trt.file

- `compressImageFile`: compress and resize image files.

  ```ts
  const file = input.files?.[0];
  if (file) {
    const compressed = await trt.file.compressImageFile(file, {
      maxWidth: 1200,
      quality: 0.8,
    });
    console.log(compressed instanceof File, compressed.type); // true 'image/jpeg'
  }
  ```

- `convertFileSize`: convert file size values between byte units.

  ```ts
  console.log(trt.file.convertFileSize(1024, 'byte:kb')); // 1
  console.log(trt.file.convertFileSize(2, 'Gb:Mb')); // 2048
  console.log(trt.file.convertFileSize(1.5, 'Mb:byte')); // 1572864
  console.log(trt.file.convertFileSize(1, 'Mb:Gb', { decimalPlaces: 4 })); // 0.001
  try {
    trt.file.convertFileSize(Number.POSITIVE_INFINITY, 'byte:kb');
  } catch (error) {
    console.log((error as Error).message); // 'value must be a finite number'
  }
  ```

- `fileToDataUrl`: convert a file to a data URL.

  ```ts
  const file = input.files?.[0];
  if (file) {
    const dataUrl = await trt.file.fileToDataUrl(file);
    console.log(dataUrl.startsWith('data:')); // true
  }
  ```

- `fileToObjectUrl`: convert a file to an object URL.

  ```ts
  const file = input.files?.[0];
  if (file) {
    const objectUrl = trt.file.fileToObjectUrl(file);
    console.log(objectUrl.startsWith('blob:')); // true
    URL.revokeObjectURL(objectUrl);
  }
  ```

- `getImageSize`: inspect image dimensions.

  ```ts
  console.log(await trt.file.getImageSize('/assets/photo.jpg')); // { width: 1920, height: 1080 } for a 1920x1080 image
  ```

- `loadImage`: load an image element from a source.

  ```ts
  const image = await trt.file.loadImage('/assets/photo.jpg');
  console.log(image instanceof HTMLImageElement, image.complete); // true true
  ```

### trt.number

- `calcBayesianRating`: calculate a Bayesian-style rating using a global average prior.

  ```ts
  console.log(
    trt.number.calcBayesianRating({
      ratingAvg: 4.5,
      ratingCount: 6,
      globalAvg: 3.5,
      minimumVotesThreshold: 2,
    }),
  ); // 4.25
  console.log(trt.number.calcBayesianRating({ ratingAvg: 4.8, ratingCount: 0, globalAvg: 3.6 })); // 3.6
  console.log(trt.number.calcBayesianRating({ ratingAvg: 5, ratingCount: 1, globalAvg: 3 })); // 3.182
  ```

- `calcHaversineDistance`: calculate distance between two latitude/longitude points.

  ```ts
  console.log(
    trt.number.calcHaversineDistance(
      { latitude: 36.12, longitude: -86.67 },
      { latitude: 33.94, longitude: -118.4 },
    ),
  ); // 2886.444 (km, approximately)
  console.log(
    trt.number.calcHaversineDistance(
      { latitude: 10.123, longitude: 106.456 },
      { latitude: 10.123, longitude: 106.456 },
    ),
  ); // 0
  ```

- `calcSimpleBayesianRating`: calculate a weighted rating without a prior.

  ```ts
  console.log(
    trt.number.calcSimpleBayesianRating({
      ratingAvg: 4.8,
      ratingCount: 12,
      minimumVotesThreshold: 8,
    }),
  ); // 2.88
  console.log(trt.number.calcSimpleBayesianRating({ ratingAvg: 4.8, ratingCount: 0 })); // 0
  ```

- `formatViewCount`: format a view count into compact notation like `1.2k`.

  ```ts
  console.log(trt.number.formatViewCount(1000)); // '1k'
  console.log(trt.number.formatViewCount(1234)); // '1.2k'
  console.log(trt.number.formatViewCount(999)); // '999'
  console.log(trt.number.formatViewCount(1250, { decimalPlaces: 2 })); // '1.25k'
  console.log(trt.number.formatViewCount(1250, { decimalPlaces: 0 })); // '1k'
  console.log(trt.number.formatViewCount(1_250_000)); // '1.3m'
  console.log(trt.number.formatViewCount(2_500_000, { uppercase: true })); // '2.5M'
  console.log(trt.number.formatViewCount(2_500_000_000)); // '2.5b'
  ```

- `generateRandomNumber`: generate integer or decimal numbers in a range.

  ```ts
  console.log(trt.number.generateRandomNumber(1, 10)); // integer from 1 to 10
  console.log(trt.number.generateRandomNumber(1, 2, { decimal: true, decimalPlaces: 3 })); // decimal from 1.000 to 2.000
  try {
    trt.number.generateRandomNumber(1.2, 3);
  } catch (error) {
    console.log((error as Error).message); // 'min and max must be integers'
  }
  ```

### trt.object

- `cleanObj`: remove empty values from objects and nested structures.

  ```ts
  console.log(trt.object.cleanObj({ name: 'Alice', empty: '', value: null })); // { name: 'Alice' }
  console.log(
    trt.object.cleanObj({
      a: undefined,
      d: 0,
      e: false,
      nested: { value: null, name: 'Alice' },
    }),
  ); // { d: 0, e: false, nested: { name: 'Alice' } }
  console.log(trt.object.cleanObj({ a: null, b: undefined, c: '' })); // {}
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  try {
    trt.object.cleanObj(circular);
  } catch (error) {
    console.log((error as Error).message); // 'Circular reference detected'
  }
  ```

- `removeDuplicateObjects`: deduplicate object arrays while preserving structure.

  ```ts
  console.log(trt.object.removeDuplicateObjects([{ id: 1 }, { id: 1 }, { id: 2 }])); // [{ id: 1 }, { id: 2 }]
  console.log(
    trt.object.removeDuplicateObjects(
      [
        { id: 1, name: 'A' },
        { id: 1, name: 'B' },
        { id: 2, name: 'C' },
      ],
      (item) => String(item.id),
    ),
  ); // [{ id: 1, name: 'A' }, { id: 2, name: 'C' }]
  ```

### trt.timing

- `debounce`: debounce function calls.

  ```ts
  const search = trt.timing.debounce((keyword: string) => {
    return keyword.toUpperCase();
  }, 300);
  search('indexed database');
  console.log(search.pending()); // true
  console.log(search.flush()); // 'INDEXED DATABASE'
  search.cancel();
  console.log(search.pending()); // false

  const leadingSearch = trt.timing.debounce(
    (keyword: string) => {
      return keyword.toUpperCase();
    },
    300,
    {
      leading: true,
      trailing: false,
    },
  );
  console.log(leadingSearch('first')); // 'FIRST'
  ```

- `throttle`: throttle function calls.

  ```ts
  const handleScroll = trt.timing.throttle(() => {
    console.log(window.scrollY);
  }, 100);
  console.log(handleScroll()); // current window.scrollY value
  console.log(handleScroll.pending()); // true or false, depending on the throttle window
  handleScroll.cancel();

  const trailing = trt.timing.throttle(
    (value: string) => {
      return value;
    },
    100,
    {
      leading: false,
      trailing: true,
    },
  );
  trailing('queued');
  console.log(trailing.pending()); // true
  console.log(trailing.flush()); // undefined; callback receives 'queued'
  ```

- `wait`: pause execution for a duration.

  ```ts
  await trt.timing.wait({ value: 10, unit: 'millisecond' });
  console.log('ready'); // 'ready' (after at least 10 ms)
  ```

### trt.string

- `capitalize`: capitalize a string or selected string fields in an object.

  ```ts
  const profile = {
    firstName: 'alice',
    lastName: 'nguyen van an',
    bio: 'frontend developer',
    age: 30,
  };

  console.log(trt.string.capitalize('hello')); // 'Hello' (string mode defaults to 'first')
  console.log(trt.string.capitalize('hello world', { mode: 'first' })); // 'Hello world'
  console.log(trt.string.capitalize('hello world', { mode: 'words' })); // 'Hello World'
  console.log(trt.string.capitalize(profile)); // same object values; no fields selected
  console.log(trt.string.capitalize(profile, { first: ['firstName'] })); // { firstName: 'Alice', lastName: 'nguyen van an', bio: 'frontend developer', age: 30 }
  console.log(trt.string.capitalize(profile, { words: ['lastName', 'bio'] })); // { firstName: 'alice', lastName: 'Nguyen Van An', bio: 'Frontend Developer', age: 30 }

  const article = {
    title: 'hello world',
    author: 'alice nguyen',
    summary: '',
  };
  console.log(trt.string.capitalize(article, { first: ['title'], words: ['author'] })); // { title: 'Hello world', author: 'Alice Nguyen', summary: '' }
  console.log(trt.string.capitalize({ title: null }, { first: ['title'] })); // { title: '' }
  ```

- `generateHash`: create a hash string.

  ```ts
  console.log(await trt.string.generateHash('hello')); // '5aa762ae383fbb727af3c7a36d4940a5b8c40a989452d2304fc958ff3f354e7a'
  ```

- `generateId`: generate a unique identifier.

  ```ts
  console.log(trt.string.generateId().length); // 36 (UUID string)
  ```

- `generateRandomString`: generate a random string.

  ```ts
  console.log(trt.string.generateRandomString(8).length); // 8
  ```

- `generateSearchKeys`: build searchable prefixes and tokens from text.

  ```ts
  console.log(trt.string.generateSearchKeys('Đắk Lắk')); // ['da', 'dak', 'dak ', 'dak l', 'dak la', 'dak lak', 'dl', 'la', 'lak']
  console.log(trt.string.generateSearchKeys('中文 😀')); // []
  console.log(
    trt.string.generateSearchKeys('Café', {
      minPrefixLength: 1,
      includePhrasePrefixes: false,
      includeAcronym: false,
    }),
  ); // ['c', 'ca', 'caf', 'cafe']
  console.log(
    trt.string.generateSearchKeys('Café', {
      minPrefixLength: 1,
      maxPrefixLength: 2,
      includePhrasePrefixes: false,
      includeAcronym: false,
    }),
  ); // ['c', 'ca', 'cafe']
  console.log(trt.string.generateSearchKeys('Đắk Lắk', { includePhrasePrefixes: false })); // ['da', 'dak', 'dak lak', 'dl', 'la', 'lak']
  console.log(trt.string.generateSearchKeys('Đắk Lắk', { includeAcronym: false })); // ['da', 'dak', 'dak ', 'dak l', 'dak la', 'dak lak', 'la', 'lak']
  ```

- `generateSortOrderKey`: generate a sortable order key for drag-and-drop style ordering.

  ```ts
  type SortableItem = {
    id: number;
    name: string;
    sortKey: string;
  };

  const items: SortableItem[] = [
    {
      id: 1,
      name: 'Item 1',
      sortKey: trt.string.generateSortOrderKey(),
    },
  ];

  for (let id = 2; id <= 10; id += 1) {
    const previous = items[items.length - 1]?.sortKey;

    items.push({
      id,
      name: `Item ${id}`,
      sortKey: trt.string.generateSortOrderKey({ previous }),
    });
  }

  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  console.log(items.length, items[0].sortKey.length); // 10 64
  console.log(items.map((item) => item.name)); // ['Item 1', 'Item 2', ..., 'Item 10']
  ```

  To insert an item between two existing items, pass the key before and after
  the insertion point. The option names are `previous` and `next`:

  ```ts
  function insertBetween(list: SortableItem[], item: Omit<SortableItem, 'sortKey'>, index: number) {
    const previous = list[index - 1]?.sortKey;
    const next = list[index]?.sortKey;

    list.splice(index, 0, {
      ...item,
      sortKey: trt.string.generateSortOrderKey({ previous, next }),
    });
  }

  insertBetween(items, { id: 11, name: 'Inserted item' }, 5);
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  console.log(items[5].name, items[5].sortKey.length); // 'Inserted item' 64
  ```

  To swap adjacent items, remove the item from its old position and generate
  a new key at its new position:

  ```ts
  function moveItem(list: SortableItem[], from: number, to: number) {
    const [item] = list.splice(from, 1);
    const previous = list[to - 1]?.sortKey;
    const next = list[to]?.sortKey;

    item.sortKey = trt.string.generateSortOrderKey({ previous, next });
    list.splice(to, 0, item);
  }

  moveItem(items, 0, 1); // swap the first two items
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  console.log(items[0].name, items[1].name); // 'Item 2' 'Item 1'
  ```

  If the same gap is continuously subdivided, midpoint allocation supports at
  most `ceil(log2(62^64 - 1)) = 382` successful insertions in the worst case.
  The exact limit depends on the distance between the two current keys. After
  the gap is exhausted, the function throws `No available rank between
previous and next`; re-index the list to create new gaps before retrying.

  ```ts
  let successfulInsertions = 0;

  for (let attempt = 1; attempt <= 382; attempt += 1) {
    try {
      insertBetween(items, { id: 100 + attempt, name: `Inserted ${attempt}` }, 1);
      successfulInsertions += 1;
    } catch (error) {
      console.log((error as Error).message); // 'No available rank between previous and next'
      break;
    }
  }

  console.log(successfulInsertions <= 382); // true
  ```

  This is the limit for repeatedly subdividing one gap, not the total number
  of records. Distributing inserts across different gaps supports many more
  records.

  ```ts
  try {
    trt.string.generateSortOrderKey({ previous: 'U'.padEnd(64, '0'), next: 'U'.padEnd(64, '0') });
  } catch (error) {
    console.log((error as Error).message); // 'Previous rank must be smaller than next rank'
  }
  ```

- `removeTones`: normalize text by removing accents and unsupported characters.

  ```ts
  console.log(trt.string.removeTones('Đặng Văn Lâm')); // 'Dang Van Lam'
  console.log(trt.string.removeTones('Crème brûlée')); // 'creme brulee'
  console.log(trt.string.removeTones('中文 Café 😀')); // 'cafe'
  console.log(trt.string.removeTones('中文 Café 😀', { removeNonLatinAscii: false })); // '中文 cafe'
  console.log(trt.string.removeTones('Đắk Lắk', { separator: '_' })); // 'dak_lak'
  console.log(trt.string.removeTones('Crème brûlée', { separator: '|' })); // 'creme|brulee'
  console.log(trt.string.removeTones('Straße')); // 'strasse'
  console.log(trt.string.removeTones('Ærøskøbing')); // 'aeroskobing'
  console.log(trt.string.removeTones('Łódź')); // 'lodz'
  ```
