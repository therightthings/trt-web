import { AccordionGroup } from '@angular/aria/accordion';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtAccordionGroup]',
  exportAs: 'trtAccordionGroup, trt-accordion-group',
  hostDirectives: [
    {
      directive: AccordionGroup,
      inputs: ['disabled', 'multiExpandable', 'softDisabled', 'wrap'],
    },
  ],
})
export class TrtAccordionGroup {
  private readonly group = inject(AccordionGroup);

  expandAll() {
    this.group.expandAll();
  }

  collapseAll() {
    this.group.collapseAll();
  }
}
