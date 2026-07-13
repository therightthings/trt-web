import { Component, signal } from '@angular/core';
import { AutoFocusDirective } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../shared/components/code-sample.component';

@Component({
  selector: 'app-auto-focus',
  imports: [AutoFocusDirective, ApiPreferencesComponent, CodeSampleComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">input[autoFocus]</div>
          <h3 class="card-title text-lg">Auto focus after render</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The directive focuses an input after the next render pass and optional delay.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <label class="form-control gap-2 text-sm">
            <span>Search term</span>
            <input
              class="input input-bordered w-full"
              autoFocus
              [autoFocusDelay]="delay()"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
              placeholder="This field gets focus"
            />
          </label>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <label class="flex items-center justify-between gap-3">
                <span>Enable auto focus</span>
                <input
                  type="checkbox"
                  class="toggle toggle-primary"
                  [checked]="enabled()"
                  (change)="enabled.set($any($event.target).checked)"
                />
              </label>

              <label class="form-control gap-2">
                <span>Delay: {{ delay() }}ms</span>
                <input
                  class="range range-primary"
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  [value]="delay()"
                  (input)="delay.set($any($event.target).valueAsNumber)"
                />
              </label>

              <p>
                Current value:
                <span class="font-medium text-base-content">{{ query() || 'empty' }}</span>
              </p>
            </div>
          </section>
        </div>

        <app-code-sample [code]="codeExample" />
        <app-api-preferences [preferences]="preferences" />
      </div>
    </article>
  `,
})
export class AutoFocusComponent {
  protected readonly enabled = signal(true);
  protected readonly delay = signal(150);
  protected readonly query = signal('');
  protected readonly preferences: ApiPreference[] = [
    {
      name: 'autoFocusDelay',
      description: 'Waits a short time before focusing after the next render pass.',
      optional: true,
      default: 150,
      unit: 'ms',
    },
  ];
  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<input autoFocus />`,
    },
  ];
}
