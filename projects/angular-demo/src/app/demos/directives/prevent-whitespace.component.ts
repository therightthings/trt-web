import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreventWhitespaceDirective } from '@trt-web/angular';

@Component({
  selector: 'app-prevent-whitespace',
  imports: [FormsModule, PreventWhitespaceDirective],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">[preventWhitespace]</div>
          <h3 class="card-title text-lg">Block whitespace-only input</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The directive prevents starting a field with spaces only, both on keydown and paste.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <label class="form-control gap-2 text-sm">
            <span>Username</span>
            <input
              class="input input-bordered w-full"
              preventWhitespace
              [(ngModel)]="value"
              placeholder="Try typing spaces first"
            />
            <p class="text-xs text-base-content/60">Leading whitespace-only input is blocked.</p>
          </label>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p>Current value</p>
              <div
                class="rounded-box border border-base-300 bg-base-100 px-3 py-2 text-base-content"
              >
                {{ value || 'empty' }}
              </div>
              <p>
                Use this for search boxes, slugs, and other fields where a blank-looking value
                should not be accepted.
              </p>
            </div>
          </section>
        </div>
      </div>
    </article>
  `,
})
export class PreventWhitespaceComponent {
  protected value = '';
}
