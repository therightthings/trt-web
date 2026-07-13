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
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">ng-template[typedTemplate]</p>
        <h3 class="text-lg font-medium text-slate-950">Typed template context</h3>
        <p class="text-sm leading-6 text-slate-600">
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
        <article class="rounded border border-slate-200 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-slate-950">{{ index + 1 }}. {{ person.name }}</p>
              <p class="text-sm text-slate-600">{{ person.role }}</p>
            </div>
            <span
              class="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600"
            >
              {{ person.active ? 'Active' : 'Idle' }}
            </span>
          </div>
        </article>
      </ng-template>
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
