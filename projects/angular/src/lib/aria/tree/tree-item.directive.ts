import { TreeItem } from '@angular/aria/tree';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtTreeItem]',
  exportAs: 'trtTreeItem, trt-tree-item',
  hostDirectives: [
    {
      directive: TreeItem,
      inputs: ['id', 'value', 'parent', 'disabled', 'selectable', 'expanded', 'label'],
      outputs: ['expandedChange'],
    },
  ],
})
export class TrtTreeItem<V = unknown> {
  readonly treeItem = inject(TreeItem<V>);
  readonly active = this.treeItem.active;
  readonly expanded = this.treeItem.expanded;
  readonly level = this.treeItem.level;
  readonly selected = this.treeItem.selected;
  readonly visible = this.treeItem.visible;
}
