# @trt-web/core

- Shared building blocks for cleaner web apps

## Installation

- With NPM (or Yarn, Bun,...):

```bash
npm install @trt-web/core
```

## Utilities

### Browser

- `BrowserPermission`: browser permission helper for checking and requesting permissions.
- `LocalStorage`: typed wrapper around `localStorage`.
- `SessionStorage`: typed wrapper around `sessionStorage`.

### Date

- `generateTimestamp`: generate a timestamp value.
- `getDateRange`: resolve common preset ranges and dynamic ranges into `startDate` / `endDate`.

### DOM

- `generateRandomColor`: generate a random color value.
- `getElementInfo`: read size and position details from an element.
- `varCSS`: read/write CSS custom property values.

### File

- `compressImageFile`: compress and resize image files.
- `fileToDataUrl`: convert a file to a data URL.
- `fileToObjectUrl`: convert a file to an object URL.
- `getImageSize`: inspect image dimensions.

### Number

- `calcBayesianRating`: calculate a Bayesian-style rating using a global average prior.
- `calcHaversineDistance`: calculate distance between two latitude/longitude points.
- `calcSimpleBayesianRating`: calculate a weighted rating without a prior.
- `generateRandomNumber`: generate integer or decimal numbers in a range.
- `formatViewCount`: format a view count into compact notation like `1.2k`.

### Object

- `cleanObj`: remove empty values from objects and nested structures.
- `removeDuplicateObjects`: deduplicate object arrays while preserving structure.

### Rate Limit

- `debounce`: debounce function calls.
- `throttle`: throttle function calls.
- `wait`: pause execution for a duration.

### String

- `capitalizeFirst`: capitalize the first letter of a string.
- `capitalizeTextFields`: capitalize string fields in objects.
- `capitalizeWords`: capitalize each word in a string.
- `generateHash`: create a hash string.
- `generateId`: create a unique identifier.
- `generateRandomString`: generate a random string.
- `generateSearchKeys`: build searchable prefixes and tokens from text.
- `generateSortOrderKey`: generate a sortable order key for drag-and-drop style ordering.
- `removeTones`: normalize text by removing accents and unsupported characters.
