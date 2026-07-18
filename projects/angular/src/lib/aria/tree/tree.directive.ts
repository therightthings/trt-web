import { Tree } from '@angular/aria/tree';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtTree]',
  exportAs: 'trtTree, trt-tree',
  hostDirectives: [
    {
      directive: Tree,
      inputs: [
        'id',
        'orientation',
        'multi',
        'disabled',
        'selectionMode',
        'focusMode',
        'wrap',
        'softDisabled',
        'typeaheadDelay',
        'tabindex',
        'value',
        'nav',
        'currentType',
      ],
      outputs: ['valueChange'],
    },
  ],
})
export class TrtTree<V = unknown> {
  readonly tree = inject(Tree<V>);
  readonly activeDescendant = this.tree.activeDescendant;

  scrollActiveItemIntoView(options?: ScrollIntoViewOptions): void {
    this.tree.scrollActiveItemIntoView(options);
  }
}
