import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { vnPhoneNumberValidator } from '@trt-web/angular';

@Component({
  selector: 'app-vn-phone-number-validator',
  imports: [FormsModule],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">vnPhoneNumberValidator</div>
          <h3 class="card-title text-lg">Validate Vietnamese phone numbers</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The helper returns a boolean for mobile and landline-style numbers using the current
            regex rules.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <label class="form-control gap-2 text-sm">
            <span>Phone number</span>
            <input
              class="input input-bordered w-full"
              [(ngModel)]="phone"
              placeholder="Example: 0912345678"
            />
          </label>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p>
                Valid:
                <span class="font-medium text-base-content">{{
                  vnPhoneNumberValidator(phone)
                }}</span>
              </p>

              <div class="space-y-2">
                @for (sample of samples; track sample.value) {
                  <div
                    class="rounded-box border border-base-300 bg-base-100 px-3 py-2 text-base-content/80"
                  >
                    <span>{{ sample.value }}</span>
                    <span class="float-right font-medium text-base-content">{{
                      vnPhoneNumberValidator(sample.value)
                    }}</span>
                  </div>
                }
              </div>
            </div>
          </section>
        </div>
      </div>
    </article>
  `,
})
export class VnPhoneNumberValidatorComponent {
  protected phone = '0912345678';
  protected readonly samples = [
    { value: '0912345678' },
    { value: '+84912345678' },
    { value: '01234' },
    { value: 'abcd' },
  ];

  protected readonly vnPhoneNumberValidator = vnPhoneNumberValidator;
}
