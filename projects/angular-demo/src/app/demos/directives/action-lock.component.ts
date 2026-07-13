import { Component, signal } from '@angular/core';
import { ActionLockDirective } from '@trt-web/angular';

import { ApiPreferencesComponent } from '../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../shared/components/code-sample.component';

@Component({
  selector: 'app-action-lock',
  imports: [ActionLockDirective, ApiPreferencesComponent, CodeSampleComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">[actionLock]</div>
          <h3 class="card-title text-lg">Prevent accidental double clicks</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The directive blocks repeat click events during the configured lock window.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="space-y-3">
            <button
              class="btn btn-primary btn-sm"
              actionLock
              [actionLockMs]="lockMs()"
              (click)="clickCount.update((value) => value + 1)"
            >
              Primary action
            </button>

            <p class="text-sm text-base-content/70">
              Click count: <span class="font-medium text-base-content">{{ clickCount() }}</span>
            </p>
          </div>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <label class="form-control gap-2">
                <span>Lock duration: {{ lockMs() }}ms</span>
                <input
                  class="range range-primary"
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  [value]="lockMs()"
                  (input)="lockMs.set($any($event.target).valueAsNumber)"
                />
              </label>

              <p>
                The click handler only runs once per lock window, which is useful for destructive or
                expensive actions.
              </p>

              <button class="btn btn-outline btn-sm" type="button" (click)="clickCount.set(0)">
                Reset counter
              </button>
            </div>
          </section>
        </div>

        <app-code-sample title="Code example" badge="Basic usage" [code]="codeExample" />

        <app-api-preferences [preferences]="preferences" />
      </div>
    </article>
  `,
})
export class ActionLockComponent {
  protected readonly lockMs = signal(1200);
  protected readonly clickCount = signal(0);
  protected readonly preferences = [
    {
      name: 'actionLockMs',
      description: 'How long the action stays locked after a successful click.',
      optional: true,
      default: 1200,
      unit: 'ms',
    },
  ];
  protected readonly codeExample = [
    {
      fileExt: 'ts',
      code: `import { Component } from '@angular/core';
import { ActionLockDirective } from '@trt-web/angular';

@Component({
  selector: 'app-action-lock',
  imports: [ActionLockDirective],
  template: \`<button actionLock [actionLockMs]="1200">Save</button>\`,
})
export class ActionLockComponent {}`,
    },
  ];
}
