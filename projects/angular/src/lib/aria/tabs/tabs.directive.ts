import { Tabs } from '@angular/aria/tabs';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtTabs]',
  exportAs: 'trtTabs, trt-tabs',
  hostDirectives: [Tabs],
})
export class TrtTabs {
  readonly tabs = inject(Tabs);
}
