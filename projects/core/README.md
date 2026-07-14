# @trt-web/core

- Shared building blocks for cleaner web apps

## Installation

- With NPM (or Yarn, Bun,...):

```bash
npm install @trt-web/core
```

## Public API

### Direct exports

- `BrowserClipboard`: read and write clipboard content.
- `BrowserEnvironment`: inspect locale, hardware, battery, storage, and screen details.
- `BrowserLocation`: get geolocation with permission handling and speed presets.
- `BrowserPermission`: browser permission helper for checking and requesting permissions.
- `BrowserPresentation`: fullscreen and picture-in-picture helpers.
- `BrowserResource`: asset URLs, script/link loading, and file downloads.
- `BrowserShare`: browser share helper for Web Share API.
- `Cookie`: typed cookie helper with JSON serialization.
- `LocalStorage`: typed wrapper around `localStorage`.
- `SessionStorage`: typed wrapper around `sessionStorage`.

### TrtCore.Browser

- `createWorker`: create a Web Worker from a function.
- `runWorker`: run a function in a Web Worker and resolve its result.

### TrtCore.Date

- `generateTimestamp`: generate a timestamp value.
- `getDateRange`: resolve common preset ranges and dynamic ranges into `startDate` / `endDate`.

### TrtCore.DOM

- `generateRandomColor`: generate a random color value.
- `getElementInfo`: read size and position details from an element.
- `varCSS`: read/write CSS custom property values.

### TrtCore.File

- `compressImageFile`: compress and resize image files.
- `convertFileSize`: convert file size values between byte units.
- `fileToDataUrl`: convert a file to a data URL.
- `fileToObjectUrl`: convert a file to an object URL.
- `getImageSize`: inspect image dimensions.
- `loadImage`: load an image element from a source.

### TrtCore.Number

- `calcBayesianRating`: calculate a Bayesian-style rating using a global average prior.
- `calcHaversineDistance`: calculate distance between two latitude/longitude points.
- `calcSimpleBayesianRating`: calculate a weighted rating without a prior.
- `generateRandomNumber`: generate integer or decimal numbers in a range.
- `formatViewCount`: format a view count into compact notation like `1.2k`.

### TrtCore.Object

- `cleanObj`: remove empty values from objects and nested structures.
- `removeDuplicateObjects`: deduplicate object arrays while preserving structure.

### TrtCore.RateLimit

- `debounce`: debounce function calls.
- `throttle`: throttle function calls.
- `wait`: pause execution for a duration.

### TrtCore.String

- `capitalizeFirst`: capitalize the first letter of a string.
- `capitalizeTextFields`: capitalize string fields in objects.
- `capitalizeWords`: capitalize each word in a string.
- `generateHash`: create a hash string.
- `generateId`: generate a unique identifier.
- `generateRandomString`: generate a random string.
- `generateSearchKeys`: build searchable prefixes and tokens from text.
- `generateSortOrderKey`: generate a sortable order key for drag-and-drop style ordering.
- `removeTones`: normalize text by removing accents and unsupported characters.
