import { ToolbarWidgetGroup } from '@angular/aria/toolbar';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtToolbarWidgetGroup]',
  exportAs: 'trtToolbarWidgetGroup, trt-toolbar-widget-group',
  hostDirectives: [
    {
      directive: ToolbarWidgetGroup,
      inputs: ['disabled', 'multi'],
    },
  ],
})
export class TrtToolbarWidgetGroup<V = unknown> {
  readonly toolbarWidgetGroup = inject(ToolbarWidgetGroup<V>);
}
