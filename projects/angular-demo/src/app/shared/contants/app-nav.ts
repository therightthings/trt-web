export interface DemoNavLink {
  label: string;
  path: string;
  note?: string;
}

export interface DemoGroup {
  label: string;
  path: string;
  description: string;
  links: DemoNavLink[];
}

export const DEMO_GROUPS: DemoGroup[] = [
  {
    label: 'Directives',
    path: '/directives',
    description: 'Behavioral directives for focus, dragging, locking, typing, and template typing.',
    links: [
      { label: 'Auto focus', path: 'auto-focus', note: 'input[autoFocus]' },
      { label: 'Action lock', path: 'action-lock', note: '[actionLock]' },
      { label: 'Free dragging', path: 'free-dragging', note: '[freeDragging]' },
      { label: 'Prevent whitespace', path: 'prevent-whitespace', note: '[preventWhitespace]' },
      { label: 'Typed template', path: 'typed-template', note: 'ng-template[typedTemplate]' },
      { label: 'Hook tracking', path: 'hook-tracking', note: 'Logs lifecycle hooks' },
    ],
  },
  {
    label: 'Operators',
    path: '/operators',
    description: 'RxJS helpers for request state, polling refresh, and destroy lifecycle cleanup.',
    links: [
      { label: 'Auto refresh', path: 'auto-refresh', note: 'Polling helper' },
      { label: 'Request state', path: 'to-request-state', note: 'loading / done / error' },
      { label: 'Inject destroy', path: 'inject-destroy', note: 'DestroyRef bridge' },
    ],
  },
  {
    label: 'Forms',
    path: '/forms',
    description: 'Reactive-form helpers for validation, error lookup, and error logging.',
    links: [
      { label: 'Field has errors', path: 'field-has-errors', note: 'dirty / touched check' },
      { label: 'Field has error type', path: 'field-has-error-type', note: 'error key lookup' },
      { label: 'Log form errors', path: 'log-form-errors', note: 'mark + print all errors' },
      { label: 'VN phone validator', path: 'vn-phone-number-validator', note: 'Boolean validator' },
    ],
  },
  {
    label: 'Data & UI',
    path: '/data',
    description: 'HTTP cache, signal store, safe pipe, and time conversion helpers.',
    links: [
      { label: 'HTTP cache', path: 'http-cache', note: 'Interceptor + cache service' },
      { label: 'Signal store', path: 'signal-store', note: 'Signals + persistence' },
      { label: 'Safe pipe', path: 'safe-pipe', note: 'Safe HTML / style / URL' },
      { label: 'toMs utility', path: 'to-ms', note: 'Normalize time values' },
    ],
  },
  {
    label: 'Angular Aria',
    path: '/aria',
    description:
      'Directive-first accessibility demos for accordion, combobox, grid, listbox, menu, tabs, toolbar, and tree.',
    links: [
      { label: 'Accordion', path: 'accordion', note: 'ngAccordionGroup / Trigger / Panel' },
      { label: 'Combobox', path: 'combobox', note: 'ngCombobox + popup widget' },
      { label: 'Grid', path: 'grid', note: 'ngGrid / Row / Cell / Widget' },
      { label: 'Listbox', path: 'listbox', note: 'ngListbox / ngOption' },
      { label: 'Menu', path: 'menu', note: 'ngMenuBar / Menu / Trigger' },
      { label: 'Tabs', path: 'tabs', note: 'ngTabs / TabList / TabPanel' },
      { label: 'Toolbar', path: 'toolbar', note: 'ngToolbar / Widget / Group' },
      { label: 'Tree', path: 'tree', note: 'ngTree / TreeItem / Group' },
    ],
  },
];
