import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { TrtTree, TrtTreeItem, TrtTreeItemGroup } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';
import { IconModule } from '../../../shared/icons/font-awesome.module';

interface TreeNode {
  label: string;
  value: string;
  expanded?: boolean;
  disabled?: boolean;
  children?: TreeNode[];
}

const PROJECT_TREE: TreeNode[] = [
  {
    label: 'src',
    value: 'src',
    expanded: true,
    children: [
      {
        label: 'app',
        value: 'src/app',
        expanded: true,
        children: [
          {
            label: 'components',
            value: 'src/app/components',
            expanded: true,
            children: [
              { label: 'tree', value: 'src/app/components/tree' },
              { label: 'menu', value: 'src/app/components/menu' },
              { label: 'toolbar', value: 'src/app/components/toolbar' },
            ],
          },
          { label: 'shared', value: 'src/app/shared' },
        ],
      },
      {
        label: 'assets',
        value: 'src/assets',
        children: [{ label: 'icons', value: 'src/assets/icons' }],
      },
    ],
  },
  {
    label: 'public',
    value: 'public',
    children: [{ label: 'favicon.ico', value: 'public/favicon.ico' }],
  },
  {
    label: 'docs',
    value: 'docs',
    children: [
      { label: 'architecture.md', value: 'docs/architecture.md' },
      { label: 'legacy-notes.md', value: 'docs/legacy-notes.md', disabled: true },
    ],
  },
];

@Component({
  selector: 'app-tree',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    IconModule,
    NgTemplateOutlet,
    TrtTree,
    TrtTreeItem,
    TrtTreeItemGroup,
  ],
  templateUrl: './tree.component.html',
})
export class TreeComponent {
  protected readonly nodes = PROJECT_TREE;
  protected readonly selectedValues = signal<string[]>(['src/app/components/tree']);

  protected readonly selectedSummary = computed(() => {
    const values = this.selectedValues();

    if (values.length === 0) {
      return 'None';
    }

    if (values.length === 1) {
      return values[0];
    }

    return `${values[0]} + ${values.length - 1} more`;
  });

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'orientation',
      description: 'Sets whether the tree lays out vertically or horizontally.',
      optional: true,
      default: 'vertical',
      unit: 'vertical | horizontal',
    },
    {
      name: 'multi',
      description: 'Allows multiple tree items to stay selected at the same time.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'selectionMode',
      description: 'Controls whether selection follows focus or is committed explicitly.',
      optional: true,
      default: 'follow',
      unit: 'follow | explicit',
    },
    {
      name: 'focusMode',
      description: 'Switches between roving tab index and aria-activedescendant focus handling.',
      optional: true,
      default: 'roving',
      unit: 'roving | activedescendant',
    },
    {
      name: 'wrap',
      description: 'Wraps keyboard navigation when the active item reaches an edge.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'softDisabled',
      description: 'Keeps disabled items focusable while preventing interaction.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'nav',
      description: 'Marks the tree as a navigation tree instead of a selection tree.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'currentType',
      description: 'Maps the active navigation item to aria-current.',
      optional: true,
      default: undefined,
      unit: 'page | step | location | date | time | true | false',
    },
    {
      name: 'value',
      description: 'Selected values managed by the tree.',
      optional: true,
      default: '[]',
      unit: 'string[]',
    },
    {
      name: 'item.value',
      description: 'The value represented by each tree item.',
      optional: false,
      default: 'required',
      unit: 'string',
    },
    {
      name: 'item.parent',
      description: 'The parent tree or tree item group for each node.',
      optional: false,
      default: 'required',
      unit: 'Tree<T> | TreeItemGroup<T>',
    },
    {
      name: 'item.expanded',
      description: 'Controls whether a branch is expanded.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'item.selectable',
      description: 'Marks an item as selectable or read-only.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'item.disabled',
      description: 'Disables a tree item while keeping its shape in the hierarchy.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'item.label',
      description: 'Accessible label used for typeahead and announcements.',
      optional: true,
      default: undefined,
      unit: 'string | undefined',
    },
    {
      name: 'group.ownedBy',
      description: 'Links a tree item group back to the owning tree item.',
      optional: false,
      default: 'required',
      unit: 'TreeItem<T>',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<article class="card bg-base-100 border border-base-300 shadow-sm">
  <div class="card-body gap-6">
    <header class="space-y-2">
      <div class="badge badge-outline badge-sm">trt-tree</div>
      <h3 class="card-title text-lg">Tree built on Angular Aria</h3>
      <p class="text-sm leading-6 text-base-content/70">
        This demo renders a small file explorer so the tree wrapper, nested groups, and selection
        state stay easy to inspect with the library base styles only.
      </p>
    </header>

    <section class="space-y-4">
      <div>
        <h4>Project files</h4>

        <ul
          trtTree
          #tree="trtTree"
          aria-label="Project files"
          focusMode="roving"
          selectionMode="explicit"
          [multi]="true"
          [(value)]="selectedValues"
        >
          <ng-template
            [ngTemplateOutlet]="treeNodes"
            [ngTemplateOutletContext]="{ nodes: nodes, parent: tree.tree }"
          />
        </ul>

        <p>Selected: {{ selectedSummary() }}</p>
      </div>
    </section>

    <ng-template #treeNodes let-nodes="nodes" let-parent="parent">
      @for (node of nodes; track node.value) {
        <li
          trtTreeItem
          #treeItem="trtTreeItem"
          [parent]="parent"
          [value]="node.value"
          [label]="node.label"
          [disabled]="node.disabled"
          [(expanded)]="node.expanded"
        >
          <div class="trt-tree-row">
            <span class="trt-tree-toggle" aria-hidden="true">
              @if (node.children?.length) {
                <fa-icon
                  [icon]="treeItem.expanded() ? 'chevron-down' : 'chevron-right'"
                  size="2xs"
                ></fa-icon>
              } @else {
                <fa-icon icon="circle" size="2xs"></fa-icon>
              }
            </span>

            <span class="trt-tree-label">{{ node.label }}</span>
          </div>

          @if (node.children?.length) {
            <ul role="group">
              <ng-template trtTreeItemGroup [ownedBy]="treeItem.treeItem" #group="trtTreeItemGroup">
                <ng-template
                  [ngTemplateOutlet]="treeNodes"
                  [ngTemplateOutletContext]="{ nodes: node.children, parent: group.treeItemGroup }"
                />
              </ng-template>
            </ul>
          }
        </li>
      }
    </ng-template>
  </div>
</article>`,
    },
  ];
}
