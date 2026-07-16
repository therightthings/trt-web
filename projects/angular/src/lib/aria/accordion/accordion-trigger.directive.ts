import { AccordionTrigger } from '@angular/aria/accordion';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtAccordionTrigger]',
  exportAs: 'trtAccordionTrigger, trt-accordion-trigger',
  hostDirectives: [
    {
      directive: AccordionTrigger,
      inputs: ['panel', 'id', 'disabled', 'expanded'],
      outputs: ['expandedChange'],
    },
  ],
})
export class TrtAccordionTrigger {
  private readonly trigger = inject(AccordionTrigger);

  protected expand() {
    this.trigger.expand();
  }

  protected collapse() {
    this.trigger.collapse();
  }

  protected toggle() {
    this.trigger.toggle();
  }
}
