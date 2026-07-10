import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreventWhitespaceDirective } from '@trt-web/angular';

@Component({
  selector: 'app-prevent-whitespace',
  imports: [FormsModule, PreventWhitespaceDirective],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">[preventWhitespace]</p>
        <h3 class="text-lg font-medium text-slate-950">Block whitespace-only input</h3>
        <p class="text-sm leading-6 text-slate-600">
          The directive prevents starting a field with spaces only, both on keydown and paste.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <label class="space-y-2 text-sm text-slate-700">
          <span>Username</span>
          <input
            class="w-full rounded border border-slate-300 px-3 py-2 outline-none"
            preventWhitespace
            [(ngModel)]="value"
            placeholder="Try typing spaces first"
          />
          <p class="text-xs text-slate-500">Leading whitespace-only input is blocked.</p>
        </label>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p>Current value</p>
          <div class="rounded border border-slate-200 px-3 py-2 text-slate-900">
            {{ value || 'empty' }}
          </div>
          <p>
            Use this for search boxes, slugs, and other fields where a blank-looking value should
            not be accepted.
          </p>
        </section>
      </div>
    </article>
  `,
})
export class PreventWhitespaceComponent {
  protected value = '';
}
