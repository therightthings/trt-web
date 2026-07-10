import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fieldHasErrors,fieldHasErrorType } from '@trt-web/angular';

@Component({
  selector: 'app-field-has-errors',
  imports: [JsonPipe, ReactiveFormsModule],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">fieldHasErrors</p>
        <h3 class="text-lg font-medium text-slate-950">
          Show errors only after touch or dirty state
        </h3>
        <p class="text-sm leading-6 text-slate-600">
          This helper keeps validation display logic compact and consistent across fields.
        </p>
      </header>

      <form class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]" [formGroup]="form">
        <div class="space-y-4">
          <label class="space-y-2 block text-sm text-slate-700">
            <span>Full name</span>
            <input
              class="w-full rounded border border-slate-300 px-3 py-2"
              formControlName="name"
            />
            @if (fieldHasErrors(form, 'name')) {
              <p class="text-xs text-slate-600">
                @if (fieldHasErrorType(form, 'name', 'required')) {
                  Name is required.
                }
                @if (fieldHasErrorType(form, 'name', 'minlength')) {
                  Name must be at least 3 characters.
                }
              </p>
            }
          </label>

          <label class="space-y-2 block text-sm text-slate-700">
            <span>Email</span>
            <input
              class="w-full rounded border border-slate-300 px-3 py-2"
              formControlName="email"
            />
            @if (fieldHasErrors(form, 'email')) {
              <p class="text-xs text-slate-600">
                @if (fieldHasErrorType(form, 'email', 'required')) {
                  Email is required.
                }
                @if (fieldHasErrorType(form, 'email', 'email')) {
                  Enter a valid email address.
                }
              </p>
            }
          </label>
        </div>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-900">Form snapshot</p>
          <pre class="overflow-auto rounded border border-slate-200 p-3 text-xs text-slate-700">{{
            form.value | json
          }}</pre>
          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
            type="button"
            (click)="form.markAllAsTouched()"
          >
            Mark touched
          </button>
        </section>
      </form>
    </article>
  `,
})
export class FieldHasErrorsComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly fieldHasErrors = fieldHasErrors;
  protected readonly fieldHasErrorType = fieldHasErrorType;
}
