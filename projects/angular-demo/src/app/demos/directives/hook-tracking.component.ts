import { Component, input, signal } from '@angular/core';
import { HooksTracking } from '@trt-web/angular';

@Component({
  selector: 'app-hook-tracker-preview',
  template: `
    <article class="rounded border border-slate-200 p-4">
      <p class="text-xs tracking-[0.2em] text-slate-500">Hook tracking preview</p>
      <div class="mt-3 space-y-2 text-sm text-slate-600">
        <p>
          Label: <span class="font-medium text-slate-950">{{ label() }}</span>
        </p>
        <p>
          Counter: <span class="font-medium text-slate-950">{{ count() }}</span>
        </p>
        <p>
          Pulse: <span class="font-medium text-slate-950">{{ pulse() }}</span>
        </p>
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
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">Lifecycle logs</p>
        <h3 class="text-lg font-medium text-slate-950">Track Angular hook execution</h3>
        <p class="text-sm leading-6 text-slate-600">
          Open the browser console to see <code>HooksTracking</code> logging lifecycle activity.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        @if (visible()) {
          <app-hook-tracker-preview [label]="label" [count]="count()" [pulse]="pulse()" />
        }

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <label class="space-y-2 block">
            <span>Label</span>
            <input
              class="w-full rounded border border-slate-300 px-3 py-2 outline-none"
              [value]="label"
              (input)="label = $any($event.target).value"
            />
          </label>

          <div class="flex flex-wrap gap-2">
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="button"
              (click)="count.update((value) => value + 1)"
            >
              Increment
            </button>
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="button"
              (click)="pulse.update((value) => !value)"
            >
              Toggle pulse
            </button>
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="button"
              (click)="visible.update((value) => !value)"
            >
              Toggle component
            </button>
          </div>

          <p>
            Count: <span class="font-medium text-slate-950">{{ count() }}</span>
          </p>
          <p>
            Pulse: <span class="font-medium text-slate-950">{{ pulse() }}</span>
          </p>
        </section>
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
