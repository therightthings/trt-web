import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fieldHasErrorType } from '@trt-web/angular';

@Component({
  selector: 'app-field-has-error-type',
  imports: [ReactiveFormsModule],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">fieldHasErrorType</p>
        <h3 class="text-lg font-medium text-slate-950">Check the exact validation key</h3>
        <p class="text-sm leading-6 text-slate-600">
          This helper is useful when one field can show multiple error messages.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <label class="space-y-2 text-sm text-slate-700">
          <span>Tag name</span>
          <input class="w-full rounded border border-slate-300 px-3 py-2" formControlName="tag" />
          <p class="flex flex-wrap gap-2 text-xs text-slate-600">
            <span
              class="rounded border border-slate-200 px-2 py-1"
              [class.text-red-950]="fieldHasErrorType(form, 'tag', 'required')"
            >
              required
            </span>
            <span
              class="rounded border border-slate-200 px-2 py-1"
              [class.text-slate-950]="fieldHasErrorType(form, 'tag', 'minlength')"
            >
              minlength
            </span>
            <span
              class="rounded border border-slate-200 px-2 py-1"
              [class.text-slate-950]="fieldHasErrorType(form, 'tag', 'pattern')"
            >
              pattern
            </span>
          </p>
        </label>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-900">Validation summary</p>
          <p>Required: {{ fieldHasErrorType(form, 'tag', 'required') }}</p>
          <p>Min length: {{ fieldHasErrorType(form, 'tag', 'minlength') }}</p>
          <p>Pattern: {{ fieldHasErrorType(form, 'tag', 'pattern') }}</p>
          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
            type="button"
            (click)="form.markAllAsTouched()"
          >
            Reveal errors
          </button>
        </section>
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
