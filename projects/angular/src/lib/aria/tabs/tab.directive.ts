import { Tab } from '@angular/aria/tabs';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtTab]',
  exportAs: 'trtTab, trt-tab',
  hostDirectives: [
    {
      directive: Tab,
      inputs: ['id', 'disabled', 'value'],
    },
  ],
})
export class TrtTab {
  readonly tab = inject(Tab);
  readonly active = this.tab.active;
  readonly selected = this.tab.selected;

  open(): void {
    this.tab.open();
  }
}
