import { Component, input } from '@angular/core';

export type ApiPreference = {
  name: string;
  description: string;
  optional: boolean;
  default: unknown;
  unit: string;
};

@Component({
  selector: 'app-api-preferences',
  template: `
    <section class="card bg-base-200 border border-base-300 shadow-sm">
      <div class="card-body gap-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="card-title text-base">{{ title() }}</h4>
          @if (subtitle()) {
            <span class="text-sm text-base-content/60">{{ subtitle() }}</span>
          }
        </div>

        @if (preferences().length) {
          <div class="overflow-x-auto rounded-box border border-base-300">
            <table class="table table-zebra table-sm bg-base-100">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Optional</th>
                  <th>Default</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                @for (item of preferences(); track item.name) {
                  <tr>
                    <td class="font-medium text-base-content">{{ item.name }}</td>
                    <td class="text-base-content/70">{{ item.description }}</td>
                    <td>
                      <span class="badge badge-outline" [class.badge-success]="item.optional">
                        {{ item.optional ? 'Optional' : 'Required' }}
                      </span>
                    </td>
                    <td class="font-mono text-xs text-base-content">
                      {{ formatDefault(item.default) }}
                    </td>
                    <td class="text-base-content/70">{{ item.unit || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div
            class="rounded-box border border-dashed border-base-300 bg-base-200 p-4 text-sm text-base-content/60"
          >
            No API preferences available.
          </div>
        }
      </div>
    </section>
  `,
})
export class ApiPreferencesComponent {
  readonly title = input('API Preferences');
  readonly subtitle = input<string | null>(null);
  readonly preferences = input<ApiPreference[]>([]);

  protected formatDefault(value: unknown): string {
    if (value === undefined) {
      return '—';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
}
