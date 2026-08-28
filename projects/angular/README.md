# @trt-web/angular

Shared building blocks for cleaner Angular web apps.

## Installation

Install the package with npm, Yarn, or Bun:

```bash
npm install @trt-web/angular
```

Import the ARIA base styles when using the accessibility wrappers:

```ts
import '@trt-web/angular/aria-base-styles.css';
```

## Compatibility

Angular 16 through Angular 22.

## Directives

Angular directives for common interaction and template behavior.

### ActionLockDirective

Prevents repeated user actions while an asynchronous task is running.

#### Methods

- `isLocked(): boolean`: check whether the action is currently locked.

#### Examples

```html
<button actionLock (click)="save()">Save</button>
```

### FreeDraggingDirective

Makes an element draggable within the document.

#### Methods

- `pointerdown`: start dragging from the host element.
- `pointermove`: update the element position while dragging.
- `pointerup`: stop dragging.

#### Examples

```html
<section freeDragging>Drag this panel</section>
```

### HooksTracking

Tracks Angular lifecycle hooks for diagnostics.

#### Methods

- `ngOnInit`: track initialization.
- `ngOnDestroy`: track destruction.

#### Examples

```ts
@Component({ template: '' })
export class ExampleComponent {}
```

### PreventWhitespaceDirective

Blocks whitespace input in form controls.

#### Methods

- `keydown`: prevent whitespace key input.

#### Examples

```html
<input preventWhitespace />
```

### TypedTemplateDirective

Provides typed template context support.

#### Methods

- `ngTemplateContextGuard`: narrow the template context type.

#### Examples

```html
<ng-template let-item [typedTemplateOf]="items">{{ item }}</ng-template>
```

## Angular Aria

Accessible Angular wrappers built on the official Angular Aria package.

### Accordion

Accordion disclosure wrappers.

#### Methods

- `TrtAccordion`: provide an accordion container.
- `TrtAccordionItem`: provide an accordion item.

#### Examples

```html
<trt-accordion></trt-accordion>
```

### Combobox

Combobox and popup wrappers.

#### Methods

- `TrtCombobox`: provide combobox behavior.
- `TrtComboboxWidget`: connect the combobox widget.
- `TrtComboboxPopup`: render the popup content.

#### Examples

```html
<trt-combobox></trt-combobox>
```

### Listbox

Listbox and option wrappers.

#### Methods

- `TrtListbox`: provide listbox behavior.
- `TrtOption`: provide a selectable option.

#### Examples

```html
<trt-listbox></trt-listbox>
```

### Grid

Grid navigation and selection wrappers.

#### Methods

- `TrtGrid`: provide grid behavior.
- `TrtGridRow`: provide a grid row.
- `TrtGridCell`: provide a grid cell.

#### Examples

```html
<trt-grid></trt-grid>
```

### Menu

Menu and menubar wrappers.

#### Methods

- `TrtMenu`: provide menu behavior.
- `TrtMenuItem`: provide a menu item.
- `TrtMenuTrigger`: connect a menu trigger.

#### Examples

```html
<trt-menu></trt-menu>
```

### Tabs

Tabs, tab list, and tab panel wrappers.

#### Methods

- `TrtTabs`: provide tab behavior.
- `TrtTab`: provide a tab.
- `TrtTabPanel`: provide tab content.

#### Examples

```html
<trt-tabs></trt-tabs>
```

### Toolbar

Toolbar and widget wrappers.

#### Methods

- `TrtToolbar`: provide toolbar behavior.
- `TrtToolbarWidget`: provide a toolbar widget.

#### Examples

```html
<trt-toolbar></trt-toolbar>
```

### Tree

Tree and tree item wrappers.

#### Methods

- `TrtTree`: provide tree behavior.
- `TrtTreeItem`: provide a tree item.
- `TrtTreeItemGroup`: provide a tree item group.

#### Examples

```html
<trt-tree></trt-tree>
```

For full details, refer to the [official Angular Aria documentation](https://angular.dev/guide/aria/overview).

## HTTP Cache

HTTP response caching helpers.

### HttpCache

Configure and manage cached HTTP responses.

#### Methods

- `provideHttpCache`: configure the cache provider.
- `httpCacheInterceptor`: cache HTTP responses through an interceptor.
- `HttpCacheService`: manage cached responses and invalidation.

#### Examples

```ts
provideHttpCache();
```

## Operators

RxJS operators for request and refresh flows.

### RequestOperators

Observable request-state and lifecycle helpers.

#### Methods

- `autoRefresh`: refresh values on a schedule or trigger.
- `toRequestState`: map an observable to a request-state object.
- `injectDestroy$`: create a destroy notifier for cleanup.

#### Examples

```ts
const state$ = source$.pipe(toRequestState());
```

## Pipes

### SafePipe

Safely transforms values for Angular templates.

#### Methods

- `transform`: safely transform a template value.

#### Examples

```html
{{ value | safe }}
```

## Reactive Forms

Form validation and error helpers.

### FormValidation

Utilities for inspecting and logging form errors.

#### Methods

- `fieldHasErrorType`: check for a specific control error.
- `fieldHasErrors`: check whether a control or group has errors.
- `logFormErrors`: log nested form validation errors.
- `vnPhoneNumberValidator`: validate Vietnamese phone numbers.

#### Examples

```ts
control.addValidators(vnPhoneNumberValidator());
```

## Signal Store

### SignalStore

Signal-based state store with optional persistence helpers.

#### Methods

- `configure`: configure the store and its storage adapter.
- `reset`: reset the store state.

#### Examples

```ts
await store.configure({
  storage: {
    type: 'indexed-db',
    database: 'MyAppDB',
    collection: 'signal-store',
    key: 'todos',
  },
});
```
