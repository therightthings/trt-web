import { GridRow } from '@angular/aria/grid';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtGridRow]',
  exportAs: 'trtGridRow, trt-grid-row',
  hostDirectives: [
    {
      directive: GridRow,
      inputs: ['rowIndex'],
    },
  ],
})
export class TrtGridRow {
  readonly row = inject(GridRow);
}
