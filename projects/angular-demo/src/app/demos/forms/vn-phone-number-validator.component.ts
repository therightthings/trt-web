import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { vnPhoneNumberValidator } from '@trt-web/angular';

@Component({
  selector: 'app-vn-phone-number-validator',
  imports: [FormsModule],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">vnPhoneNumberValidator</p>
        <h3 class="text-lg font-medium text-slate-950">Validate Vietnamese phone numbers</h3>
        <p class="text-sm leading-6 text-slate-600">
          The helper returns a boolean for mobile and landline-style numbers using the current regex
          rules.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <label class="space-y-2 text-sm text-slate-700">
          <span>Phone number</span>
          <input
            class="w-full rounded border border-slate-300 px-3 py-2"
            [(ngModel)]="phone"
            placeholder="Example: 0912345678"
          />
        </label>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p>
            Valid:
            <span class="font-medium text-slate-950">{{ vnPhoneNumberValidator(phone) }}</span>
          </p>

          <div class="space-y-2">
            @for (sample of samples; track sample.value) {
              <div
                class="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-slate-700"
              >
                <span>{{ sample.value }}</span>
                <span class="font-medium text-slate-950">{{
                  vnPhoneNumberValidator(sample.value)
                }}</span>
              </div>
            }
          </div>
        </section>
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
