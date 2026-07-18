import { MenuBar } from '@angular/aria/menu';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtMenuBar]',
  exportAs: 'trtMenuBar, trt-menu-bar',
  hostDirectives: [
    {
      directive: MenuBar,
      inputs: ['disabled', 'softDisabled', 'value', 'wrap', 'typeaheadDelay'],
      outputs: ['valueChange', 'itemSelected'],
    },
  ],
})
export class TrtMenuBar<V = unknown> {
  readonly menuBar = inject(MenuBar<V>);

  close(): void {
    this.menuBar.close();
  }
}
