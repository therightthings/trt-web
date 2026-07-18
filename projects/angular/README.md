# @trt-web/angular

- Shared building blocks for cleaner Angular web apps

## Installation

- With NPM (or Yarn, Bun,...):

```bash
npm install @trt-web/angular
```

- Import the ARIA base styles when you use the accessibility wrappers:

```ts
import '@trt-web/angular/aria-base-styles.css';
```

## Compatibility

- Angular 16 through Angular 22.

## Directives

- `ActionLockDirective`: prevent repeated user actions while a task is running.
- `FreeDraggingDirective`: make an element draggable.
- `HooksTracking`: track Angular lifecycle hooks.
- `PreventWhitespaceDirective`: block whitespace input.
- `TypedTemplateDirective`: provide typed template context support.

## Angular Aria

- `TrtAccordion*`: accordion wrapper directives for grouped disclosure panels.
- `TrtCombobox`, `TrtComboboxWidget`, `TrtComboboxPopup`: combobox wrapper directives.
- `TrtListbox` and `TrtOption`: listbox/selectable option wrappers.
- `TrtGrid*`: grid wrapper directives for table-like navigation and selection.
- `TrtMenu*`: menu, menubar, trigger, item, and content wrappers.
- `TrtTabs*`: tabs, tab list, tab, tab panel, and tab content wrappers.
- `TrtToolbar*`: toolbar and widget wrappers.
- `TrtTree*`: tree, tree item, and tree item group wrappers.

- For full details, please refer to the official Angular Team documentation: [angular-aria](https://angular.dev/guide/aria/overview)

## HTTP Cache

- `httpCacheInterceptor`: cache HTTP responses through an interceptor.
- `provideHttpCache`: configure the cache provider.
- `HttpCacheService`: manage cached responses, pending requests, and invalidation helpers.

## Operators

- `autoRefresh`: refresh values on a schedule or trigger.
- `toRequestState`: map observables into request-state objects.
- `injectDestroy$`: create a destroy notifier for RxJS cleanup.

## Pipes

- `safePipe`: safely transform values for Angular templates.

## Reactive Forms

- `fieldHasErrorType`: check whether a form control has a specific error.
- `fieldHasErrors`: check whether a form control or group has any errors.
- `logFormErrors`: log nested form validation errors.
- `vnPhoneNumberValidator`: validate Vietnamese phone numbers.

## Signal Store

- `SignalStore`: signal-based state store with optional persistence helpers.
