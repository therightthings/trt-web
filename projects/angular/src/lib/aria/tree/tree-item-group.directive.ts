import { TreeItemGroup } from '@angular/aria/tree';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: 'ng-template[trtTreeItemGroup]',
  exportAs: 'trtTreeItemGroup, trt-tree-item-group',
  hostDirectives: [
    {
      directive: TreeItemGroup,
      inputs: ['ownedBy'],
    },
  ],
})
export class TrtTreeItemGroup<V = unknown> {
  readonly treeItemGroup = inject(TreeItemGroup<V>);
}
