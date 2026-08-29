# @trt-web/core

- Shared building blocks for cleaner web apps

## Installation

- With NPM (or Yarn, Bun,...):

```bash
npm install @trt-web/core
```

## trt.worker

Worker utilities for creating and running Web Workers.

### createWorker

Create a Web Worker from a function.

#### Methods

- `createWorker<T, R>(handler: (value: T) => R): Worker`: create a Web Worker from a function.

#### Examples

```ts
import { trt } from '@trt-web/core';

const worker = trt.worker.createWorker((value: number) => {
  return value * 2;
});
worker.terminate();
console.log(worker instanceof Worker); // true
```

### runWorker

Run a function in a Web Worker and resolve its result.

#### Methods

- `runWorker<T, R>(handler: (value: T) => R, value: T): Promise<R>`: run a function in a Web Worker and resolve its result.

#### Examples

```ts
import { trt } from '@trt-web/core';

const sum = await trt.worker.runWorker(
  (values: number[]) => {
    return values.reduce((total, value) => total + value, 0);
  },
  [2, 3],
);
console.log(sum); // 5
```

## trt.date

Date and time utilities for generating timestamps and resolving date ranges.

### generateTimestamp

generate a timestamp value.

#### Methods

- `generateTimestamp(): string`: generate a timestamp value.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(trt.date.generateTimestamp()); // '2026-07-25T...Z'
```

### getDateRange

resolve common preset ranges and dynamic ranges into `startDate` / `endDate`.

#### Methods

- `getDateRange(range: RangeDate | DynamicRangeDate, rootDate?: Date): { startDate: string; endDate: string }`: resolve a date range into start and end dates.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(trt.date.getDateRange('this_week'));

const rootDate = new Date('2026-07-03T17:00:00.000Z');

console.log(trt.date.getDateRange({ value: 3, unit: 'day' }, rootDate)); // { startDate: '2026-06-30', endDate: '2026-07-03' }
console.log(trt.date.getDateRange('last_7_days', rootDate)); // { startDate: '2026-06-27', endDate: '2026-07-03' }
console.log(trt.date.getDateRange('today', rootDate)); // { startDate: '2026-07-03', endDate: '2026-07-03' }
console.log(trt.date.getDateRange('yesterday', rootDate)); // { startDate: '2026-07-02', endDate: '2026-07-03' }
console.log(trt.date.getDateRange('last_30_days', rootDate)); // { startDate: '2026-06-04', endDate: '2026-07-03' }
console.log(trt.date.getDateRange('this_month', rootDate)); // { startDate: '2026-07-01', endDate: '2026-07-03' }
console.log(trt.date.getDateRange('this_year', rootDate)); // { startDate: '2026-01-01', endDate: '2026-07-03' }
console.log(trt.date.getDateRange({ value: 2, unit: 'week' }, rootDate)); // { startDate: '2026-06-19', endDate: '2026-07-03' }
console.log(trt.date.getDateRange({ value: 1, unit: 'month' }, rootDate)); // { startDate: '2026-06-03', endDate: '2026-07-03' }
console.log(trt.date.getDateRange({ value: 1, unit: 'year' }, rootDate)); // { startDate: '2025-07-03', endDate: '2026-07-03' }
```

## trt.dom

DOM utilities for inspecting elements, generating colors, and managing CSS variables.

### generateRandomColor

generate a random color value.

#### Methods

- `generateRandomColor(config?: GenerateColorConfig): string`: generate a random color value.

#### Examples

```ts
import { trt } from '@trt-web/core';

const color = trt.dom.generateRandomColor({ format: 'rgb', opacity: 0.5 });
console.log(color); // 'rgba(36, 149, 97, 0.5)' (random RGB values)
console.log(trt.dom.generateRandomColor({ format: 'hex', opacity: 0.5 })); // '#RRGGBBAA' (8-character lowercase hex)
console.log(trt.dom.generateRandomColor()); // '#RRGGBB' (lowercase random hex color)
console.log(trt.dom.generateRandomColor({ format: 'rgb' })); // 'rgb(R, G, B)'
```

### getElementInfo

read size and position details from an element.

#### Methods

- `getElementInfo(element: HTMLElement): object`: read size and position details from an element.

#### Examples

```ts
import { trt } from '@trt-web/core';

const info = trt.dom.getElementInfo(document.querySelector('#app')!);
console.log(info); // { width: 640, height: 480, top: 0, left: 0, right: 640, bottom: 480 }
```

### varCSS

read or write a CSS custom property.

#### Methods

- `varCSS(name: string, value?: string): string`: read or write a CSS custom property.

#### Examples

- Basic

```ts
import { trt } from '@trt-web/core';

trt.dom.varCSS('--brand-color', '#2563eb');
console.log(trt.dom.varCSS('--brand-color')); // '#2563eb'
```

- Advanced

```ts
import { trt } from '@trt-web/core';

trt.dom.varCSS('--brand-color', '#2563eb');
console.log(trt.dom.varCSS('--brand-color')); // '#2563eb'
```

## trt.file

File utilities for converting, loading, resizing, and processing files and images.

### compressImageFile

compress and resize image files.

#### Methods

- `compressImageFile(file: File, config?: { maxWidth?: number; outputFormat?: 'image/jpeg' | 'image/webp'; quality?: number }): Promise<File>`: compress and resize an image file.

#### Examples

```ts
import { trt } from '@trt-web/core';

const file = input.files?.[0];
if (file) {
  const compressed = await trt.file.compressImageFile(file, {
    maxWidth: 1200,
    quality: 0.8,
  });
  console.log(compressed instanceof File, compressed.type); // true 'image/jpeg'
}
```

### convertFileSize

convert file size values between byte units.

#### Methods

- `convertFileSize(value: number, unit: string, config?: { decimalPlaces?: number }): number`: convert a file size between units.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

### fileToDataUrl

convert a file to a data URL.

#### Methods

- `fileToDataUrl(file: File): Promise<string>`: convert a file to a data URL.

#### Examples

```ts
import { trt } from '@trt-web/core';

const file = input.files?.[0];
if (file) {
  const dataUrl = await trt.file.fileToDataUrl(file);
  console.log(dataUrl.startsWith('data:')); // true
}
```

### fileToObjectUrl

convert a file to an object URL.

#### Methods

- `fileToObjectUrl(source: Blob | File | string, options?: { type?: string }): string`: convert a Blob, File, or data URL to an object URL.

#### Examples

```ts
import { trt } from '@trt-web/core';

const file = input.files?.[0];
if (file) {
  const objectUrl = trt.file.fileToObjectUrl(file);
  console.log(objectUrl.startsWith('blob:')); // true
  URL.revokeObjectURL(objectUrl);
}
```

### getImageSize

inspect image dimensions.

#### Methods

- `getImageSize(blob: File | string, options?: { revokeObjectUrl?: boolean }): Promise<{ width: number; height: number }>`: inspect image dimensions.

#### Examples

```ts
import { trt } from '@trt-web/core';

const fileSize = await trt.file.getImageSize('/assets/photo.jpg');
console.log(fileSize); // { width: 1920, height: 1080 } for a 1920x1080 image
```

### loadImage

load an image element from a source.

#### Methods

- `loadImage(src: string): Promise<HTMLImageElement>`: load an image element from a source.

#### Examples

```ts
import { trt } from '@trt-web/core';

const image = await trt.file.loadImage('/assets/photo.jpg');
console.log(image instanceof HTMLImageElement, image.complete); // true true
```

## trt.number

Number utilities for ratings, geographic distance, formatting, and random values.

### calcBayesianRating

calculate a Bayesian-style rating using a global average prior.

#### Methods

- `calcBayesianRating(params: { ratingAvg: number; ratingCount: number; globalAvg: number; minimumVotesThreshold?: number }): number`: calculate a Bayesian-style rating using a global average prior.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

### calcHaversineDistance

calculate distance between two latitude/longitude points.

#### Methods

- `calcHaversineDistance(from: Point, to: Point, options?: { unit?: 'km' | 'm' }): number`: calculate distance between two latitude/longitude points.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

### calcSimpleBayesianRating

calculate a weighted rating without a prior.

#### Methods

- `calcSimpleBayesianRating(params: { ratingAvg: number; ratingCount: number; minimumVotesThreshold?: number }): number`: calculate a weighted rating without a prior.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(
  trt.number.calcSimpleBayesianRating({
    ratingAvg: 4.8,
    ratingCount: 12,
    minimumVotesThreshold: 8,
  }),
); // 2.88
console.log(trt.number.calcSimpleBayesianRating({ ratingAvg: 4.8, ratingCount: 0 })); // 0
```

### formatViewCount

format a view count into compact notation like `1.2k`.

#### Methods

- `formatViewCount(value: number, config?: FormatViewCountConfig): string`: format a view count into compact notation like `1.2k`.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(trt.number.formatViewCount(1000)); // '1k'
console.log(trt.number.formatViewCount(1234)); // '1.2k'
console.log(trt.number.formatViewCount(999)); // '999'
console.log(trt.number.formatViewCount(1250, { decimalPlaces: 2 })); // '1.25k'
console.log(trt.number.formatViewCount(1250, { decimalPlaces: 0 })); // '1k'
console.log(trt.number.formatViewCount(1_250_000)); // '1.3m'
console.log(trt.number.formatViewCount(2_500_000, { uppercase: true })); // '2.5M'
console.log(trt.number.formatViewCount(2_500_000_000)); // '2.5b'
```

### generateRandomNumber

generate integer or decimal numbers in a range.

#### Methods

- `generateRandomNumber(min: number, max: number, config?: GenerateRandomNumberConfig): number`: generate an integer or decimal number in a range.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(trt.number.generateRandomNumber(1, 10)); // integer from 1 to 10
console.log(trt.number.generateRandomNumber(1, 2, { decimal: true, decimalPlaces: 3 })); // decimal from 1.000 to 2.000
try {
  trt.number.generateRandomNumber(1.2, 3);
} catch (error) {
  console.log((error as Error).message); // 'min and max must be integers'
}
```

## trt.object

Object utilities for cleaning nested data and removing duplicate objects.

### cleanObj

remove empty values from objects and nested structures.

#### Methods

- `cleanObj<T extends object>(obj: Partial<T>): Partial<T>`: remove empty values from objects and nested structures.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

### removeDuplicateObjects

deduplicate object arrays while preserving structure.

#### Methods

- `removeDuplicateObjects<T>(array: T[], filterFn?: (item: T) => string): T[]`: deduplicate an object array while preserving its structure.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

## trt.timing

Timing utilities for delaying, debouncing, and throttling function execution.

### debounce

debounce function calls.

#### Methods

- `debounce<T extends (...args: any[]) => any>(func: T, wait?: number | TimeConfig, options?: DebounceOptions): DebouncedFunction<T>`: debounce function calls.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

### throttle

throttle function calls.

#### Methods

- `throttle<T extends (...args: any[]) => any>(func: T, wait?: number | TimeConfig, options?: ThrottleOptions): ThrottledFunction<T>`: throttle function calls.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

### wait

pause execution for a duration.

#### Methods

- `wait(time: number | TimeConfig): Promise<void>`: pause execution for a duration.

#### Examples

```ts
import { trt } from '@trt-web/core';

await trt.timing.wait({ value: 10, unit: 'millisecond' });
console.log('ready'); // 'ready' (after at least 10 ms)
```

## trt.string

String utilities for capitalization, hashing, identifiers, random values, and search keys.

### capitalize

capitalize a string or selected string fields in an object.

#### Methods

- `capitalize(data: string, config?: CapitalizeStringConfig): string`: capitalize a string.
- `capitalize<T extends Record<string, unknown>>(data: T, config?: CapitalizeObjectConfig<T>): T`: capitalize selected string fields in an object.

#### Examples

```ts
import { trt } from '@trt-web/core';

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

### generateHash

create a hash string.

#### Methods

- `generateHash(data: unknown): Promise<string>`: create a SHA-256 hash string from a value.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(await trt.string.generateHash('hello')); // '5aa762ae383fbb727af3c7a36d4940a5b8c40a989452d2304fc958ff3f354e7a'
```

### generateId

generate a unique identifier.

#### Methods

- `generateId(): string`: generate a UUID identifier.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(trt.string.generateId().length); // 36 (UUID string)
```

### generateRandomString

generate a random string.

#### Methods

- `generateRandomString(length?: number): string`: generate a random hexadecimal string with the requested byte length.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(trt.string.generateRandomString(8).length); // 8
```

### generateSearchKeys

build searchable prefixes and tokens from text.

#### Methods

- `generateSearchKeys(value: string, options?: { minPrefixLength?: number; maxPrefixLength?: number; includePhrasePrefixes?: boolean; includeAcronym?: boolean }): string[]`: build normalized searchable keys, word prefixes, phrase prefixes, and an optional acronym.

#### Examples

```ts
import { trt } from '@trt-web/core';

console.log(trt.string.generateSearchKeys('Café')); // normalized keys without tones
console.log(
  trt.string.generateSearchKeys('Đắk Lắk', {
    minPrefixLength: 1,
    includePhrasePrefixes: false,
    includeAcronym: false,
  }),
); // ['d', 'da', 'dak', 'l', 'la', 'lak']
console.log(trt.string.generateSearchKeys('中文 😀')); // []
```
