import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { fieldHasErrors, fieldHasErrorType } from '@trt-web/angular';

@Component({
  selector: 'app-field-has-errors',
  imports: [JsonPipe, ReactiveFormsModule],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">fieldHasErrors</div>
          <h3 class="card-title text-lg">Show errors only after touch or dirty state</h3>
          <p class="text-sm leading-6 text-base-content/70">
            This helper keeps validation display logic compact and consistent across fields.
          </p>
        </header>

        <form class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]" [formGroup]="form">
          <div class="space-y-4">
            <label class="form-control gap-2 text-sm">
              <span>Full name</span>
              <input class="input input-bordered w-full" formControlName="name" />
              @if (fieldHasErrors(form, 'name')) {
                <p class="text-xs text-base-content/60">
                  @if (fieldHasErrorType(form, 'name', 'required')) {
                    Name is required.
                  }
                  @if (fieldHasErrorType(form, 'name', 'minlength')) {
                    Name must be at least 3 characters.
                  }
                </p>
              }
            </label>

            <label class="form-control gap-2 text-sm">
              <span>Email</span>
              <input class="input input-bordered w-full" formControlName="email" />
              @if (fieldHasErrors(form, 'email')) {
                <p class="text-xs text-base-content/60">
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

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p class="font-medium text-base-content">Form snapshot</p>
              <pre
                class="overflow-auto rounded-box border border-base-300 bg-base-100 p-3 text-xs text-base-content"
                >{{ form.value | json }}</pre
              >
              <button
                class="btn btn-outline btn-sm"
                type="button"
                (click)="form.markAllAsTouched()"
              >
                Mark touched
              </button>
            </div>
          </section>
        </form>
      </div>
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
