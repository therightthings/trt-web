import { Component, input, signal } from '@angular/core';
import { injectDestroy } from '@trt-web/angular';
import { interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-destroy-ticker',
  template: `
    <article class="card card-compact bg-base-200 border border-base-300 shadow-sm">
      <div class="card-body gap-3">
        <div class="badge badge-outline badge-sm">Child component</div>
        <div class="space-y-2 text-sm text-base-content/70">
          <p>
            Label: <span class="font-medium text-base-content">{{ label() }}</span>
          </p>
          <p>
            Ticks: <span class="font-medium text-base-content">{{ ticks() }}</span>
          </p>
        </div>
      </div>
    </article>
  `,
})
export class DestroyTickerComponent {
  readonly label = input('Active while mounted');
  readonly ticks = signal(0);

  constructor() {
    interval(1000)
      .pipe(takeUntil(injectDestroy()))
      .subscribe(() => {
        this.ticks.update((value) => value + 1);
      });
  }
}

@Component({
  selector: 'app-inject-destroy',
  imports: [DestroyTickerComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">injectDestroy</div>
          <h3 class="card-title text-lg">Auto-clean up subscriptions with DestroyRef</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The helper exposes a destroy notifier, so stream subscriptions stop when the component
            disappears.
          </p>
        </header>

        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-outline btn-sm"
            type="button"
            (click)="visible.update((value) => !value)"
          >
            Toggle child
          </button>
          <button class="btn btn-primary btn-sm" type="button" (click)="visible.set(true)">
            Show child
          </button>
        </div>

        @if (visible()) {
          <app-destroy-ticker label="This timer stops cleanly when removed" />
        }

        <p class="text-sm text-base-content/70">
          Current visible state:
          <span class="font-medium text-base-content">{{ visible() }}</span>
        </p>
      </div>
    </article>
  `,
})
export class InjectDestroyComponent {
  readonly visible = signal(true);
}
