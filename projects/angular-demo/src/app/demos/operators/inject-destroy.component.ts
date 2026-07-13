import { Component, input, signal } from '@angular/core';
import { injectDestroy } from '@trt-web/angular';
import { interval, takeUntil } from 'rxjs';

@Component({
  selector: 'app-destroy-ticker',
  template: `
    <article class="rounded border border-slate-200 p-4">
      <p class="text-xs tracking-[0.2em] text-slate-500">Child component</p>
      <div class="mt-3 space-y-2 text-sm text-slate-600">
        <p>
          Label: <span class="font-medium text-slate-950">{{ label() }}</span>
        </p>
        <p>
          Ticks: <span class="font-medium text-slate-950">{{ ticks() }}</span>
        </p>
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
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">injectDestroy</p>
        <h3 class="text-lg font-medium text-slate-950">
          Auto-clean up subscriptions with DestroyRef
        </h3>
        <p class="text-sm leading-6 text-slate-600">
          The helper exposes a destroy notifier, so stream subscriptions stop when the component
          disappears.
        </p>
      </header>

      <div class="flex flex-wrap gap-2">
        <button
          class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
          type="button"
          (click)="visible.update((value) => !value)"
        >
          Toggle child
        </button>
        <button
          class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
          type="button"
          (click)="visible.set(true)"
        >
          Show child
        </button>
      </div>

      @if (visible()) {
        <app-destroy-ticker label="This timer stops cleanly when removed" />
      }

      <p class="text-sm text-slate-600">
        Current visible state:
        <span class="font-medium text-slate-950">{{ visible() }}</span>
      </p>
    </article>
  `,
})
export class InjectDestroyComponent {
  readonly visible = signal(true);
}
