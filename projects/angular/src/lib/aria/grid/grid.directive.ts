import { Grid } from '@angular/aria/grid';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtGrid]',
  exportAs: 'trtGrid, trt-grid',
  hostDirectives: [
    {
      directive: Grid,
      inputs: [
        'enableSelection',
        'disabled',
        'softDisabled',
        'focusMode',
        'rowWrap',
        'colWrap',
        'multi',
        'selectionMode',
        'tabindex',
      ],
    },
  ],
})
export class TrtGrid {
  readonly grid = inject(Grid);
  readonly activeDescendant = this.grid.activeDescendant;

  scrollActiveCellIntoView(options?: ScrollIntoViewOptions): void {
    this.grid.scrollActiveCellIntoView(options);
  }
}
