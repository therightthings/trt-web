import { ɵɵDeferredContentAware,TabPanel } from '@angular/aria/tabs';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtTabPanel]',
  exportAs: 'trtTabPanel, trt-tab-panel',
  hostDirectives: [
    {
      directive: TabPanel,
      inputs: ['id', 'value'],
    },
    {
      directive: ɵɵDeferredContentAware,
      inputs: ['preserveContent'],
      outputs: ['preserveContentChange'],
    },
  ],
})
export class TrtTabPanel {
  readonly panel = inject(TabPanel);
  readonly visible = this.panel.visible;
}
