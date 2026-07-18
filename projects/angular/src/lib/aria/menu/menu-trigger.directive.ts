import { MenuTrigger } from '@angular/aria/menu';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtMenuTrigger]',
  exportAs: 'trtMenuTrigger, trt-menu-trigger',
  hostDirectives: [
    {
      directive: MenuTrigger,
      inputs: ['menu', 'disabled', 'softDisabled'],
    },
  ],
})
export class TrtMenuTrigger<V = unknown> {
  readonly trigger = inject(MenuTrigger<V>);
  readonly expanded = this.trigger.expanded;
  readonly hasPopup = this.trigger.hasPopup;

  open(): void {
    this.trigger.open();
  }

  close(): void {
    this.trigger.close();
  }

  toggle(): void {
    if (this.trigger.expanded()) {
      this.trigger.close();
      return;
    }

    this.trigger.open();
  }
}
