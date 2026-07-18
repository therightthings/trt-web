import { TabList } from '@angular/aria/tabs';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtTabList]',
  exportAs: 'trtTabList, trt-tab-list',
  hostDirectives: [
    {
      directive: TabList,
      inputs: [
        'orientation',
        'wrap',
        'softDisabled',
        'focusMode',
        'selectionMode',
        'selectedTab',
        'disabled',
      ],
      outputs: ['selectedTabChange'],
    },
  ],
})
export class TrtTabList {
  readonly tabList = inject(TabList);

  open(value: string): boolean {
    return this.tabList.open(value);
  }

  findTab(value?: string) {
    return this.tabList.findTab(value);
  }
}
