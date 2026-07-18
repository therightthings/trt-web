import { Component } from '@angular/core';
import {
  TrtAccordionContent,
  TrtAccordionGroup,
  TrtAccordionPanel,
  TrtAccordionTrigger,
} from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';
import { IconModule } from '../../../shared/icons/font-awesome.module';

@Component({
  selector: 'app-accordion',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    TrtAccordionContent,
    TrtAccordionGroup,
    TrtAccordionPanel,
    TrtAccordionTrigger,
    IconModule,
  ],
  templateUrl: './accordion.component.html',
})
export class AccordionComponent {
  protected readonly expanded = {
    shipping: true,
    billing: false,
  };

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'disabled',
      description: 'Disables the whole accordion group and its trigger interactions.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'multiExpandable',
      description: 'Allows more than one panel to remain open at the same time.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'softDisabled',
      description: 'Keeps disabled items focusable while preventing interaction.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'wrap',
      description: 'Wraps keyboard navigation from the end back to the start.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'panel.preserveContent',
      description: 'Keeps panel content mounted after collapse instead of destroying it.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'trigger.expanded',
      description: 'Two-way bound expansion state for a single accordion item.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<div trtAccordionGroup>
  <article>
    <h4 class="m-0">
      <button trtAccordionTrigger [panel]="shippingPanel.panel" [(expanded)]="expanded.shipping">
        <span>Shipping</span>
        <span>{{ expanded.shipping ? '-' : '+' }}</span>
      </button>
    </h4>

    <section trtAccordionPanel #shippingPanel="trtAccordionPanel">
      <ng-template trtAccordionContent>
        <p>Lazy content</p>
      </ng-template>
    </section>
  </article>
</div>`,
    },
  ];
}
