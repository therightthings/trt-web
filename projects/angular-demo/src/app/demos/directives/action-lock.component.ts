import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionLockDirective } from '@trt-web/angular';

@Component({
  selector: 'app-action-lock',
  imports: [FormsModule, ActionLockDirective],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">[actionLock]</p>
        <h3 class="text-lg font-medium text-slate-950">Prevent accidental double clicks</h3>
        <p class="text-sm leading-6 text-slate-600">
          The directive blocks repeat click events during the configured lock window.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="space-y-3">
          <button
            class="rounded border border-slate-300 px-4 py-2 text-sm text-slate-900 transition-colors hover:border-slate-500"
            actionLock
            [actionLockMs]="lockMs"
            (click)="clickCount = clickCount + 1"
          >
            Primary action
          </button>

          <p class="text-sm text-slate-600">
            Click count: <span class="font-medium text-slate-950">{{ clickCount }}</span>
          </p>
        </div>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <label class="space-y-2 block">
            <span>Lock duration: {{ lockMs }}ms</span>
            <input class="w-full" type="range" min="0" max="3000" step="100" [(ngModel)]="lockMs" />
          </label>

          <p>
            The click handler only runs once per lock window, which is useful for destructive or
            expensive actions.
          </p>

          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-500"
            type="button"
            (click)="clickCount = 0"
          >
            Reset counter
          </button>
        </section>
      </div>
    </article>
  `,
})
export class ActionLockComponent {
  protected lockMs = 1200;
  protected clickCount = 0;
}
