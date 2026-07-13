import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { logFormErrors } from '@trt-web/angular';

import { CodeSampleComponent } from '../../shared/components/code-sample.component';

@Component({
  selector: 'app-log-form-errors',
  imports: [JsonPipe, ReactiveFormsModule, CodeSampleComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">logFormErrors</div>
          <h3 class="card-title text-lg">Mark every control and print nested errors</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The helper walks a nested form tree, marks controls dirty, and logs invalid fields to
            the console.
          </p>
        </header>

        <form class="space-y-4" [formGroup]="form">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="form-control gap-2 text-sm">
              <span>Project name</span>
              <input class="input input-bordered w-full" formControlName="projectName" />
            </label>

            <div formGroupName="owner" class="space-y-2 text-sm">
              <span>Owner</span>
              <input
                class="input input-bordered w-full"
                formControlName="name"
                placeholder="Name"
              />
              <input
                class="input input-bordered w-full"
                formControlName="email"
                placeholder="Email"
              />
            </div>
          </div>

          <div formArrayName="tags" class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span>Tags</span>
              <button class="btn btn-outline btn-sm" type="button" (click)="addTag()">
                Add tag
              </button>
            </div>

            @for (tag of tags.controls; track $index) {
              <input class="input input-bordered w-full" [formControlName]="$index" />
            }
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn btn-primary btn-sm" type="button" (click)="submit()">
              Validate and log
            </button>
            <button class="btn btn-outline btn-sm" type="button" (click)="prefillInvalid()">
              Fill invalid values
            </button>
          </div>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p class="font-medium text-base-content">Form snapshot</p>
              <pre
                class="overflow-auto rounded-box border border-base-300 bg-base-100 p-3 text-xs text-base-content"
                >{{ form.value | json }}</pre
              >
            </div>
          </section>
        </form>

        <app-code-sample title="Code example" badge="Basic usage" [code]="codeExample" />
      </div>
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

  protected readonly codeExample = [
    {
      fileExt: 'ts',
      code: `import { logFormErrors } from '@trt-web/angular';

if (form.invalid) {
  logFormErrors(form);
}`,
    },
  ];
}
