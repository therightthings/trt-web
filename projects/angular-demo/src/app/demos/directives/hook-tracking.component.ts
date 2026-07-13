import { Component, input, signal } from '@angular/core';
import { HooksTracking } from '@trt-web/angular';

@Component({
  selector: 'app-hook-tracker-preview',
  template: `
    <article class="card card-compact bg-base-200 border border-base-300 shadow-sm">
      <div class="card-body gap-3">
        <div class="badge badge-outline badge-sm">Hook tracking preview</div>
        <div class="space-y-2 text-sm text-base-content/70">
          <p>
            Label: <span class="font-medium text-base-content">{{ label() }}</span>
          </p>
          <p>
            Counter: <span class="font-medium text-base-content">{{ count() }}</span>
          </p>
          <p>
            Pulse: <span class="font-medium text-base-content">{{ pulse() }}</span>
          </p>
        </div>
      </div>
    </article>
  `,
})
export class HookTrackerPreviewComponent extends HooksTracking {
  readonly label = input('Hook tracking');
  readonly count = input(0);
  readonly pulse = input(false);
}

@Component({
  selector: 'app-hook-tracking',
  imports: [HookTrackerPreviewComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">Lifecycle logs</div>
          <h3 class="card-title text-lg">Track Angular hook execution</h3>
          <p class="text-sm leading-6 text-base-content/70">
            Open the browser console to see <code>HooksTracking</code> logging lifecycle activity.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          @if (visible()) {
            <app-hook-tracker-preview [label]="label" [count]="count()" [pulse]="pulse()" />
          }

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <label class="form-control gap-2">
                <span>Label</span>
                <input
                  class="input input-bordered w-full"
                  [value]="label"
                  (input)="label = $any($event.target).value"
                />
              </label>

              <div class="flex flex-wrap gap-2">
                <button
                  class="btn btn-outline btn-sm"
                  type="button"
                  (click)="count.update((value) => value + 1)"
                >
                  Increment
                </button>
                <button
                  class="btn btn-outline btn-sm"
                  type="button"
                  (click)="pulse.update((value) => !value)"
                >
                  Toggle pulse
                </button>
                <button
                  class="btn btn-outline btn-sm"
                  type="button"
                  (click)="visible.update((value) => !value)"
                >
                  Toggle component
                </button>
              </div>

              <p>
                Count: <span class="font-medium text-base-content">{{ count() }}</span>
              </p>
              <p>
                Pulse: <span class="font-medium text-base-content">{{ pulse() }}</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  `,
})
export class HookTrackingComponent {
  protected readonly visible = signal(true);
  protected readonly count = signal(0);
  protected readonly pulse = signal(false);
  protected label = 'Hook tracking';
}
