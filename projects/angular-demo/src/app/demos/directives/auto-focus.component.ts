import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoFocusDirective } from '@trt-web/angular';

@Component({
  selector: 'app-auto-focus',
  imports: [FormsModule, AutoFocusDirective],
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
              [autoFocus]="enabled"
              [autoFocusDelay]="delay"
              [(ngModel)]="query"
              placeholder="This field gets focus"
            />
          </label>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <label class="flex items-center justify-between gap-3">
                <span>Enable auto focus</span>
                <input type="checkbox" class="toggle toggle-primary" [(ngModel)]="enabled" />
              </label>

              <label class="form-control gap-2">
                <span>Delay: {{ delay }}ms</span>
                <input
                  class="range range-primary"
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  [(ngModel)]="delay"
                />
              </label>

              <p>
                Current value:
                <span class="font-medium text-base-content">{{ query || 'empty' }}</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  `,
})
export class AutoFocusComponent {
  protected enabled = true;
  protected delay = 150;
  protected query = '';
}
