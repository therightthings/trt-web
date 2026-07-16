import { AccordionContent } from '@angular/aria/accordion';
import { Directive } from '@angular/core';

@Directive({
  selector: 'ng-template[trtAccordionContent]',
  exportAs: 'trtAccordionContent, trt-accordion-content',
  hostDirectives: [AccordionContent],
})
export class TrtAccordionContent {}
