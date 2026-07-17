import { ToolbarWidget } from '@angular/aria/toolbar';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtToolbarWidget]',
  exportAs: 'trtToolbarWidget, trt-toolbar-widget',
  hostDirectives: [
    {
      directive: ToolbarWidget,
      inputs: ['id', 'disabled', 'value'],
    },
  ],
})
export class TrtToolbarWidget<V = unknown> {
  readonly toolbarWidget = inject(ToolbarWidget<V>);
  readonly active = this.toolbarWidget.active;
  readonly selected = this.toolbarWidget.selected;
}
