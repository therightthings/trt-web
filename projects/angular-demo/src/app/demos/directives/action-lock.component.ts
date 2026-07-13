import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionLockDirective } from '@trt-web/angular';

@Component({
  selector: 'app-action-lock',
  imports: [FormsModule, ActionLockDirective],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">[actionLock]</div>
          <h3 class="card-title text-lg">Prevent accidental double clicks</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The directive blocks repeat click events during the configured lock window.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="space-y-3">
            <button
              class="btn btn-primary btn-sm"
              actionLock
              [actionLockMs]="lockMs"
              (click)="clickCount = clickCount + 1"
            >
              Primary action
            </button>

            <p class="text-sm text-base-content/70">
              Click count: <span class="font-medium text-base-content">{{ clickCount }}</span>
            </p>
          </div>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <label class="form-control gap-2">
                <span>Lock duration: {{ lockMs }}ms</span>
                <input
                  class="range range-primary"
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  [(ngModel)]="lockMs"
                />
              </label>

              <p>
                The click handler only runs once per lock window, which is useful for destructive or
                expensive actions.
              </p>

              <button class="btn btn-outline btn-sm" type="button" (click)="clickCount = 0">
                Reset counter
              </button>
            </div>
          </section>
        </div>
      </div>
    </article>
  `,
})
export class ActionLockComponent {
  protected lockMs = 1200;
  protected clickCount = 0;
}
