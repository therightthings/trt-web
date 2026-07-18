import { MenuContent } from '@angular/aria/menu';
import { Directive } from '@angular/core';

@Directive({
  selector: 'ng-template[trtMenuContent]',
  exportAs: 'trtMenuContent, trt-menu-content',
  hostDirectives: [MenuContent],
})
export class TrtMenuContent {}
