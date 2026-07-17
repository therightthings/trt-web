import { GridCell } from '@angular/aria/grid';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtGridCell]',
  exportAs: 'trtGridCell, trt-grid-cell',
  hostDirectives: [
    {
      directive: GridCell,
      inputs: [
        'id',
        'role',
        'rowSpan',
        'colSpan',
        'rowIndex',
        'colIndex',
        'disabled',
        'selected',
        'selectable',
        'tabindex',
      ],
      outputs: ['selectedChange'],
    },
  ],
})
export class TrtGridCell {
  readonly cell = inject(GridCell);
  readonly active = this.cell.active;
}
