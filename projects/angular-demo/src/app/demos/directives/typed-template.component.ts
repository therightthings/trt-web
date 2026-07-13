import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { TypedTemplateDirective } from '@trt-web/angular';

type Person = {
  name: string;
  role: string;
  active: boolean;
};

type PersonTemplateContext = {
  $implicit: Person;
  index: number;
};

@Component({
  selector: 'app-typed-template',
  imports: [NgTemplateOutlet, TypedTemplateDirective],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">ng-template[typedTemplate]</div>
          <h3 class="card-title text-lg">Typed template context</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The directive only exists for type inference, so <code>let-</code> variables stay fully
            typed.
          </p>
        </header>

        <div class="space-y-3">
          @for (person of people; track person.name) {
            <ng-container
              *ngTemplateOutlet="personCard; context: { $implicit: person, index: $index }"
            />
          }
        </div>

        <ng-template #personCard [typedTemplate]="typedContext" let-person let-index="index">
          <article class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-base-content">
                    {{ index + 1 }}. {{ person.name }}
                  </p>
                  <p class="text-sm text-base-content/70">{{ person.role }}</p>
                </div>
                <span class="badge badge-outline">
                  {{ person.active ? 'Active' : 'Idle' }}
                </span>
              </div>
            </div>
          </article>
        </ng-template>
      </div>
    </article>
  `,
})
export class TypedTemplateComponent {
  protected readonly people: Person[] = [
    { name: 'Minh', role: 'Lead Angular engineer', active: true },
    { name: 'Linh', role: 'Frontend reviewer', active: false },
    { name: 'An', role: 'Design system owner', active: true },
  ];

  protected readonly typedContext: PersonTemplateContext = {
    $implicit: this.people[0],
    index: 0,
  };
}
