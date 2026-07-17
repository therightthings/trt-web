import { GridCellWidget } from '@angular/aria/grid';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtGridCellWidget]',
  exportAs: 'trtGridCellWidget, trt-grid-cell-widget',
  hostDirectives: [
    {
      directive: GridCellWidget,
      inputs: ['id', 'widgetType', 'disabled', 'focusTarget', 'tabindex'],
      outputs: ['activated', 'deactivated'],
    },
  ],
})
export class TrtGridCellWidget {
  readonly widget = inject(GridCellWidget);

  activate(): void {
    this.widget.activate();
  }

  deactivate(): void {
    this.widget.deactivate();
  }
}
