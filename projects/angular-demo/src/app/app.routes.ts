import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'components',
      },
      {
        path: 'components',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'accordion',
          },
          {
            path: 'accordion',
            loadComponent: () =>
              import('./demos/components/accordion/accordion.component').then(
                (m) => m.AccordionComponent,
              ),
          },
        ],
      },
      {
        path: 'directives',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'auto-focus',
          },
          {
            path: 'auto-focus',
            loadComponent: () =>
              import('./demos/directives/auto-focus.component').then((m) => m.AutoFocusComponent),
          },
          {
            path: 'action-lock',
            loadComponent: () =>
              import('./demos/directives/action-lock.component').then((m) => m.ActionLockComponent),
          },
          {
            path: 'free-dragging',
            loadComponent: () =>
              import('./demos/directives/free-dragging.component').then(
                (m) => m.FreeDraggingComponent,
              ),
          },
          {
            path: 'prevent-whitespace',
            loadComponent: () =>
              import('./demos/directives/prevent-whitespace.component').then(
                (m) => m.PreventWhitespaceComponent,
              ),
          },
          {
            path: 'typed-template',
            loadComponent: () =>
              import('./demos/directives/typed-template.component').then(
                (m) => m.TypedTemplateComponent,
              ),
          },
          {
            path: 'hook-tracking',
            loadComponent: () =>
              import('./demos/directives/hook-tracking.component').then(
                (m) => m.HookTrackingComponent,
              ),
          },
        ],
      },
      {
        path: 'operators',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'auto-refresh',
          },
          {
            path: 'auto-refresh',
            loadComponent: () =>
              import('./demos/operators/auto-refresh.component').then(
                (m) => m.AutoRefreshComponent,
              ),
          },
          {
            path: 'to-request-state',
            loadComponent: () =>
              import('./demos/operators/to-request-state.component').then(
                (m) => m.ToRequestStateComponent,
              ),
          },
          {
            path: 'inject-destroy',
            loadComponent: () =>
              import('./demos/operators/inject-destroy.component').then(
                (m) => m.InjectDestroyComponent,
              ),
          },
        ],
      },
      {
        path: 'forms',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'field-has-errors',
          },
          {
            path: 'field-has-errors',
            loadComponent: () =>
              import('./demos/forms/field-has-errors.component').then(
                (m) => m.FieldHasErrorsComponent,
              ),
          },
          {
            path: 'field-has-error-type',
            loadComponent: () =>
              import('./demos/forms/field-has-error-type.component').then(
                (m) => m.FieldHasErrorTypeComponent,
              ),
          },
          {
            path: 'log-form-errors',
            loadComponent: () =>
              import('./demos/forms/log-form-errors.component').then(
                (m) => m.LogFormErrorsComponent,
              ),
          },
          {
            path: 'vn-phone-number-validator',
            loadComponent: () =>
              import('./demos/forms/vn-phone-number-validator.component').then(
                (m) => m.VnPhoneNumberValidatorComponent,
              ),
          },
        ],
      },
      {
        path: 'data',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'http-cache',
          },
          {
            path: 'http-cache',
            loadComponent: () =>
              import('./demos/data/http-cache.component').then((m) => m.HttpCacheComponent),
          },
          {
            path: 'signal-store',
            loadComponent: () =>
              import('./demos/data/signal-store.component').then((m) => m.SignalStoreComponent),
          },
          {
            path: 'safe-pipe',
            loadComponent: () =>
              import('./demos/data/safe-pipe.component').then((m) => m.SafePipeComponent),
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'directives',
      },
    ],
  },
];
