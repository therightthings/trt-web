# @trt-web/angular

Reusable Angular directives, pipes, services, and reactive utilities.

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

### AutoFocusDirective

Automatically focuses the host element when it is initialized.

#### Methods

- `ngOnInit`: focus the host element when the directive initializes.

#### Examples

```html
<input autofocus />
```

### FreeDraggingDirective

Makes an element draggable within the document.

#### Methods

- `pointerdown`: start dragging from the host element.
- `pointermove`: update the element position while dragging.
- `pointerup`: stop dragging and release the pointer interaction.

#### Examples

```html
<section freeDragging>Drag this panel</section>
```

### HooksTracking

Tracks Angular lifecycle hooks for diagnostics.

#### Methods

- `ngOnChanges`: track input changes when they occur.
- `ngOnInit`: track component or directive initialization.
- `ngOnDestroy`: track component or directive destruction.

#### Examples

```ts
@Component({ template: '' })
export class ExampleComponent {}
```

### PreventWhitespaceDirective

Blocks whitespace input in form controls.

#### Methods

- `keydown`: prevent whitespace key input in the host control.

#### Examples

```html
<input preventWhitespace />
```

### TypedTemplateDirective

Provides typed template context support.

#### Methods

- `ngTemplateContextGuard`: narrow the template context type for Angular's template checker.

#### Examples

```html
<ng-template let-item [typedTemplateOf]="items">{{ item }}</ng-template>
```

## Angular Aria

Accessible Angular wrappers built on the official Angular Aria package.

### Accordion

Accordion disclosure wrappers.

#### Methods

- `TrtAccordion`: provide the accessible accordion container and state.
- `TrtAccordionItem`: provide an expandable accordion item.
- `TrtAccordionGroup`: group related accordion items.
- `TrtAccordionTrigger`: control the expanded state of an accordion item.
- `TrtAccordionPanel`: provide the expandable accordion panel.
- `TrtAccordionContent`: provide content inside an accordion panel.

#### Examples

```html
<trt-accordion></trt-accordion>
```

### Combobox

Combobox and popup wrappers.

#### Methods

- `TrtCombobox`: provide combobox state and interaction behavior.
- `TrtComboboxWidget`: connect the combobox input widget to the state.
- `TrtComboboxPopup`: render and associate the popup content.

#### Examples

```html
<trt-combobox></trt-combobox>
```

### Listbox

Listbox and option wrappers.

#### Methods

- `TrtListbox`: provide listbox keyboard navigation and selection behavior.
- `TrtOption`: provide a selectable listbox option.

#### Examples

```html
<trt-listbox></trt-listbox>
```

### Grid

Grid navigation and selection wrappers.

#### Methods

- `TrtGrid`: provide grid navigation and selection behavior.
- `TrtGridRow`: provide an accessible grid row.
- `TrtGridCell`: provide an accessible grid cell.
- `TrtGridCellWidget`: provide the interactive widget inside a grid cell.

#### Examples

```html
<trt-grid></trt-grid>
```

### Menu

Menu and menubar wrappers.

#### Methods

- `TrtMenu`: provide menu and keyboard navigation behavior.
- `TrtMenuItem`: provide an actionable menu item.
- `TrtMenuTrigger`: connect a trigger to menu visibility.
- `TrtMenuBar`: provide menubar navigation behavior.
- `TrtMenuContent`: provide the menu content container.

#### Examples

```html
<trt-menu></trt-menu>
```

### Tabs

Tabs, tab list, and tab panel wrappers.

#### Methods

- `TrtTabs`: provide tab selection behavior.
- `TrtTab`: provide a selectable tab.
- `TrtTabPanel`: provide the content associated with a tab.
- `TrtTabList`: provide the tab list and keyboard navigation container.
- `TrtTabContent`: provide tab content associated with a tab panel.

#### Examples

```html
<trt-tabs></trt-tabs>
```

### Toolbar

Toolbar and widget wrappers.

#### Methods

- `TrtToolbar`: provide toolbar keyboard navigation behavior.
- `TrtToolbarWidget`: provide a toolbar widget and focus target.
- `TrtToolbarWidgetGroup`: group related toolbar widgets.

#### Examples

```html
<trt-toolbar></trt-toolbar>
```

### Tree

Tree and tree item wrappers.

#### Methods

- `TrtTree`: provide tree navigation and expansion behavior.
- `TrtTreeItem`: provide an expandable or selectable tree item.
- `TrtTreeItemGroup`: provide a group of child tree items.

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

- `provideHttpCache`: register the HTTP cache provider with optional configuration.
- `httpCacheInterceptor`: intercept HTTP requests and serve or store cacheable responses.
- `HttpCacheService`: create cache contexts and manage cached responses and invalidation.

#### Examples

```ts
import { provideHttpCache } from '@trt-web/angular';

provideHttpCache();
```

## Operators

RxJS operators for request and refresh flows.

### RequestOperators

Observable request-state and lifecycle helpers.

#### Methods

- `autoRefresh`: refresh an observable value on a schedule or external trigger.
- `toRequestState`: map an observable into loading, success, and error request states.
- `injectDestroy`: create a lifecycle-bound destroy notifier for RxJS cleanup.

#### Examples

```ts
import { toRequestState } from '@trt-web/angular';

const state$ = source$.pipe(toRequestState());
```

## Pipes

Reusable Angular pipes for safe template value transformation.

### SafePipe

Safely transforms values for Angular templates.

#### Methods

- `transform`: safely transform a value for use in an Angular template.

#### Examples

```html
{{ value | safe }}
```

## Reactive Forms

Form validation and error helpers.

### FormValidation

Utilities for inspecting and logging form errors.

#### Methods

- `fieldHasErrorType`: check whether a named form field has a specific validation error.
- `fieldHasErrors`: check whether a named form field has one or more validation errors.
- `logFormErrors`: recursively log validation errors from a control or nested form group.
- `vnPhoneNumberValidator`: validate a Vietnamese phone number format.

#### Examples

```ts
import { vnPhoneNumberValidator } from '@trt-web/angular';

control.addValidators(vnPhoneNumberValidator());
```

## Signal Store

Signal-based state management with optional local, session, and IndexedDB persistence.

### SignalStore

Signal-based state store with optional persistence helpers.

#### Methods

- `configure`: configure the store, persistence type, key, and synchronization behavior.
- `reset`: reset the store state and remove its persisted snapshot when configured.

#### Examples

```ts
import { SignalStore } from '@trt-web/angular';

await store.configure({
  storage: {
    type: 'indexed-db',
    database: 'MyAppDB',
    collection: 'signal-store',
    key: 'todos',
  },
});
```
