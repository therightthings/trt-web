import { Component, computed, signal } from '@angular/core';
import { TrtGrid, TrtGridCell, TrtGridCellWidget, TrtGridRow } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';

type Task = {
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
};

const TASKS: Task[] = [
  { title: 'Ship menu demo', owner: 'Nam', priority: 'High' },
  { title: 'Polish grid styles', owner: 'Mai', priority: 'Medium' },
  { title: 'Review tabs', owner: 'Khanh', priority: 'Low' },
];

@Component({
  selector: 'app-grid',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    TrtGrid,
    TrtGridCell,
    TrtGridCellWidget,
    TrtGridRow,
  ],
  templateUrl: './grid.component.html',
})
export class GridComponent {
  protected readonly tasks = TASKS;
  protected readonly selectedTask = signal('Ship menu demo');
  protected readonly lastAction = signal('None');

  protected readonly summary = computed(() => `${this.selectedTask()} · ${this.lastAction()}`);

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'enableSelection',
      description: 'Enables grid cell selection.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'focusMode',
      description: 'Controls whether focus moves with roving tabindex or activedescendant.',
      optional: true,
      default: 'roving',
      unit: 'roving | activedescendant',
    },
    {
      name: 'rowWrap',
      description: 'Wrapping behavior for row navigation.',
      optional: true,
      default: 'loop',
      unit: 'continuous | loop | nowrap',
    },
    {
      name: 'colWrap',
      description: 'Wrapping behavior for column navigation.',
      optional: true,
      default: 'loop',
      unit: 'continuous | loop | nowrap',
    },
    {
      name: 'multi',
      description: 'Allows multiple cells to be selected.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'selectionMode',
      description: 'Controls whether selection follows focus or requires explicit action.',
      optional: true,
      default: 'follow',
      unit: 'follow | explicit',
    },
    {
      name: 'cell.role',
      description: 'ARIA role for a grid cell.',
      optional: true,
      default: 'gridcell',
      unit: 'gridcell | columnheader | rowheader',
    },
    {
      name: 'cell.selected',
      description: 'Whether a cell is selected.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'widgetType',
      description: 'Describes the kind of interactive widget inside a cell.',
      optional: true,
      default: 'simple',
      unit: 'simple | complex | editable',
    },
    {
      name: 'widget.disabled',
      description: 'Disables an interactive widget inside a cell.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<table trtGrid [enableSelection]="true" selectionMode="explicit" focusMode="roving">
  <thead>
    <tr trtGridRow>
      <th trtGridCell role="columnheader">Task</th>
      <th trtGridCell role="columnheader">Owner</th>
      <th trtGridCell role="columnheader">Priority</th>
      <th trtGridCell role="columnheader">Action</th>
    </tr>
  </thead>

  <tbody>
    @for (task of tasks; track task.title) {
      <tr trtGridRow>
        <th
          trtGridCell
          role="rowheader"
          [selected]="selectedTask() === task.title"
          (selectedChange)="selectedTask.set(task.title)"
        >
          <div>{{ task.title }}</div>
        </th>

        <td trtGridCell>
          <div>{{ task.owner }}</div>
        </td>

        <td trtGridCell>
          <div>{{ task.priority }}</div>
        </td>

        <td trtGridCell>
          <button trtGridCellWidget type="button" (click)="lastAction.set('Opened ' + task.title)">
            Open
          </button>
        </td>
      </tr>
    }
  </tbody>
</table>`,
    },
  ];
}
