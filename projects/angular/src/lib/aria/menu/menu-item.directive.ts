import { MenuItem } from '@angular/aria/menu';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtMenuItem]',
  exportAs: 'trtMenuItem, trt-menu-item',
  hostDirectives: [
    {
      directive: MenuItem,
      inputs: ['id', 'value', 'disabled', 'searchTerm', 'role', 'submenu'],
      outputs: ['searchTermChange'],
    },
  ],
})
export class TrtMenuItem<V = unknown> {
  readonly menuItem = inject(MenuItem<V>);
  readonly active = this.menuItem.active;
  readonly expanded = this.menuItem.expanded;
  readonly hasPopup = this.menuItem.hasPopup;

  open(): void {
    this.menuItem.open();
  }

  close(): void {
    this.menuItem.close();
  }
}
