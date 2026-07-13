import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoFocusDirective } from '@trt-web/angular';

@Component({
  selector: 'app-auto-focus',
  imports: [FormsModule, AutoFocusDirective],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">input[autoFocus]</p>
        <h3 class="text-lg font-medium text-slate-950">Auto focus after render</h3>
        <p class="text-sm leading-6 text-slate-600">
          The directive focuses an input after the next render pass and optional delay.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <label class="space-y-2 text-sm text-slate-700">
          <span>Search term</span>
          <input
            class="w-full rounded border border-slate-300 px-3 py-2 outline-none"
            [autoFocus]="enabled"
            [autoFocusDelay]="delay"
            [(ngModel)]="query"
            placeholder="This field gets focus"
          />
        </label>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <label class="flex items-center justify-between gap-3">
            <span>Enable auto focus</span>
            <input type="checkbox" [(ngModel)]="enabled" />
          </label>

          <label class="space-y-2 block">
            <span>Delay: {{ delay }}ms</span>
            <input class="w-full" type="range" min="0" max="1000" step="50" [(ngModel)]="delay" />
          </label>

          <p>
            Current value: <span class="font-medium text-slate-900">{{ query || 'empty' }}</span>
          </p>
        </section>
      </div>
    </article>
  `,
})
export class AutoFocusComponent {
  protected enabled = true;
  protected delay = 150;
  protected query = '';
}
