import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { logFormErrors } from '@trt-web/angular';

@Component({
  selector: 'app-log-form-errors',
  imports: [JsonPipe, ReactiveFormsModule],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">logFormErrors</p>
        <h3 class="text-lg font-medium text-slate-950">
          Mark every control and print nested errors
        </h3>
        <p class="text-sm leading-6 text-slate-600">
          The helper walks a nested form tree, marks controls dirty, and logs invalid fields to the
          console.
        </p>
      </header>

      <form class="space-y-4" [formGroup]="form">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 text-sm text-slate-700">
            <span>Project name</span>
            <input
              class="w-full rounded border border-slate-300 px-3 py-2"
              formControlName="projectName"
            />
          </label>

          <div formGroupName="owner" class="space-y-2 text-sm text-slate-700">
            <span>Owner</span>
            <input
              class="w-full rounded border border-slate-300 px-3 py-2"
              formControlName="name"
              placeholder="Name"
            />
            <input
              class="w-full rounded border border-slate-300 px-3 py-2"
              formControlName="email"
              placeholder="Email"
            />
          </div>
        </div>

        <div formArrayName="tags" class="space-y-2 text-sm text-slate-700">
          <div class="flex items-center justify-between">
            <span>Tags</span>
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="button"
              (click)="addTag()"
            >
              Add tag
            </button>
          </div>

          @for (tag of tags.controls; track $index) {
            <input
              class="w-full rounded border border-slate-300 px-3 py-2"
              [formControlName]="$index"
            />
          }
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
            type="button"
            (click)="submit()"
          >
            Validate and log
          </button>
          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
            type="button"
            (click)="prefillInvalid()"
          >
            Fill invalid values
          </button>
        </div>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-900">Form snapshot</p>
          <pre class="overflow-auto rounded border border-slate-200 p-3 text-xs text-slate-700">{{
            form.value | json
          }}</pre>
        </section>
      </form>
    </article>
  `,
})
export class LogFormErrorsComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    projectName: ['', Validators.required],
    owner: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    }),
    tags: this.fb.array([this.fb.control('', Validators.required)]),
  });

  get tags(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  addTag(): void {
    this.tags.push(this.fb.control('', Validators.required));
  }

  submit(): void {
    if (this.form.invalid) {
      logFormErrors(this.form);
      return;
    }

    console.info('Form is valid', this.form.value);
  }

  prefillInvalid(): void {
    this.form.patchValue({
      projectName: '',
      owner: {
        name: '',
        email: 'invalid-email',
      },
    });
    this.tags.at(0)?.setValue('');
  }
}
