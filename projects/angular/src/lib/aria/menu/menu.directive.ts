import { Menu } from '@angular/aria/menu';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtMenu]',
  exportAs: 'trtMenu, trt-menu',
  hostDirectives: [
    {
      directive: Menu,
      inputs: ['id', 'wrap', 'typeaheadDelay', 'disabled', 'softDisabled', 'expansionDelay'],
      outputs: ['itemSelected'],
    },
  ],
})
export class TrtMenu<V = unknown> {
  readonly menu = inject(Menu<V>);

  close(): void {
    this.menu.close();
  }
}
