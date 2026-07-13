import { Component, computed, input, signal } from '@angular/core';

type CodeSampleTab = {
  fileExt: string;
  code: string;
};

@Component({
  selector: 'app-code-sample',
  template: `
    <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
      <div class="card-body gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="card-title text-base">{{ title() }}</h4>
          @if (badge()) {
            <span class="badge badge-outline badge-sm">{{ badge() }}</span>
          }
        </div>

        @if (code().length) {
          <div role="tablist" class="tabs tabs-lift">
            @for (sample of code(); track sample.fileExt) {
              <button
                type="button"
                role="tab"
                class="tab"
                [class.tab-active]="activeSample().fileExt === sample.fileExt"
                [attr.aria-selected]="activeSample().fileExt === sample.fileExt"
                (click)="activeFileExt.set(sample.fileExt)"
              >
                {{ sample.fileExt.toUpperCase() }}
              </button>
              <div class="tab-content bg-base-100 border-base-300 p-6">
                <pre
                  class="overflow-auto text-xs leading-6"
                ><code>{{ activeSample().code }}</code></pre>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class CodeSampleComponent {
  readonly title = input('Code example');
  readonly badge = input<string | null>(null);
  readonly code = input<CodeSampleTab[]>([]);
  protected readonly activeFileExt = signal<string | null>(null);
  protected readonly activeSample = computed(() => {
    const samples = this.code();
    const selected = this.activeFileExt();

    if (selected) {
      const matched = samples.find((sample) => sample.fileExt === selected);
      if (matched) {
        return matched;
      }
    }

    return samples[0] ?? null;
  });
}
