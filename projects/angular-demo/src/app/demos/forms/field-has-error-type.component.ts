import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fieldHasErrorType } from '@trt-web/angular';

@Component({
  selector: 'app-field-has-error-type',
  imports: [ReactiveFormsModule],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">fieldHasErrorType</div>
          <h3 class="card-title text-lg">Check the exact validation key</h3>
          <p class="text-sm leading-6 text-base-content/70">
            This helper is useful when one field can show multiple error messages.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <label class="form-control gap-2 text-sm">
            <span>Tag name</span>
            <input class="input input-bordered w-full" formControlName="tag" />
            <p class="flex flex-wrap gap-2 text-xs text-base-content/60">
              <span class="badge" [class.badge-error]="fieldHasErrorType(form, 'tag', 'required')">
                required
              </span>
              <span
                class="badge"
                [class.badge-secondary]="fieldHasErrorType(form, 'tag', 'minlength')"
              >
                minlength
              </span>
              <span
                class="badge"
                [class.badge-secondary]="fieldHasErrorType(form, 'tag', 'pattern')"
              >
                pattern
              </span>
            </p>
          </label>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p class="font-medium text-base-content">Validation summary</p>
              <p>Required: {{ fieldHasErrorType(form, 'tag', 'required') }}</p>
              <p>Min length: {{ fieldHasErrorType(form, 'tag', 'minlength') }}</p>
              <p>Pattern: {{ fieldHasErrorType(form, 'tag', 'pattern') }}</p>
              <button
                class="btn btn-outline btn-sm"
                type="button"
                (click)="form.markAllAsTouched()"
              >
                Reveal errors
              </button>
            </div>
          </section>
        </div>
      </div>
    </article>
  `,
})
export class FieldHasErrorTypeComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    tag: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-z0-9-]+$/)]],
  });

  protected readonly fieldHasErrorType = fieldHasErrorType;
}
