import { TabContent } from '@angular/aria/tabs';
import { Directive } from '@angular/core';

@Directive({
  selector: 'ng-template[trtTabContent]',
  exportAs: 'trtTabContent, trt-tab-content',
  hostDirectives: [TabContent],
})
export class TrtTabContent {}
