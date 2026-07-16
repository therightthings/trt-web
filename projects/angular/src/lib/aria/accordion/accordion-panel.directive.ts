import { AccordionPanel, ɵɵDeferredContentAware } from '@angular/aria/accordion';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtAccordionPanel]',
  exportAs: 'trtAccordionPanel, trt-accordion-panel',
  hostDirectives: [
    {
      directive: AccordionPanel,
      inputs: ['id'],
    },
    {
      directive: ɵɵDeferredContentAware,
      inputs: ['preserveContent'],
      outputs: ['preserveContentChange'],
    },
  ],
})
export class TrtAccordionPanel {
  readonly panel = inject(AccordionPanel);

  expand() {
    this.panel.expand();
  }

  collapse() {
    this.panel.collapse();
  }

  toggle() {
    this.panel.toggle();
  }
}
