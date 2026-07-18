import { Component, computed, signal } from '@angular/core';
import { TrtToolbar, TrtToolbarWidget, TrtToolbarWidgetGroup } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';

@Component({
  selector: 'app-toolbar',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    TrtToolbar,
    TrtToolbarWidget,
    TrtToolbarWidgetGroup,
  ],
  templateUrl: './toolbar.component.html',
})
export class ToolbarComponent {
  protected readonly selectedValues = signal<string[]>(['bold', 'align-left']);

  protected readonly selectionSummary = computed(() => {
    const values = this.selectedValues();
    return values.length > 0 ? values.join(' · ') : 'None';
  });

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'orientation',
      description: 'Controls whether the toolbar lays out horizontally or vertically.',
      optional: true,
      default: 'horizontal',
      unit: 'horizontal | vertical',
    },
    {
      name: 'wrap',
      description: 'Wraps keyboard navigation when focus reaches the edge.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'softDisabled',
      description: 'Keeps disabled widgets focusable while preventing interaction.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'disabled',
      description: 'Disables the toolbar and all of its widgets.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'value',
      description: 'Selected widget values managed by the toolbar.',
      optional: true,
      default: '[]',
      unit: 'string[]',
    },
    {
      name: 'widget.value',
      description: 'The value associated with each toolbar widget.',
      optional: false,
      default: 'required',
      unit: 'string',
    },
    {
      name: 'widget.disabled',
      description: 'Disables an individual widget.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'group.disabled',
      description: 'Disables a nested widget group.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'group.multi',
      description: 'Allows multiple widgets in the group to remain selected.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<div trtToolbar aria-label="Text formatting tools" [(value)]="selectedValues">
  <button trtToolbarWidget value="undo" type="button" aria-label="Undo">Undo</button>
  <button trtToolbarWidget value="redo" type="button" aria-label="Redo">Redo</button>

  <div role="separator" aria-orientation="vertical"></div>

  <button
    trtToolbarWidget
    #bold="trtToolbarWidget"
    value="bold"
    type="button"
    aria-label="Bold"
    [aria-pressed]="bold.selected()"
  >
    Bold
  </button>
  <button
    trtToolbarWidget
    #italic="trtToolbarWidget"
    value="italic"
    type="button"
    aria-label="Italic"
    [aria-pressed]="italic.selected()"
  >
    Italic
  </button>
  <button
    trtToolbarWidget
    #underlined="trtToolbarWidget"
    value="underlined"
    type="button"
    aria-label="Underline"
    [aria-pressed]="underlined.selected()"
  >
    Underline
  </button>

  <div role="separator" aria-orientation="vertical"></div>

  <div trtToolbarWidgetGroup role="radiogroup" aria-label="Text alignment">
    <button
      trtToolbarWidget
      role="radio"
      #leftAlign="trtToolbarWidget"
      value="align-left"
      type="button"
      aria-label="Align left"
      [aria-checked]="leftAlign.selected()"
    >
      Left
    </button>
    <button
      trtToolbarWidget
      role="radio"
      #centerAlign="trtToolbarWidget"
      value="align-center"
      type="button"
      aria-label="Align center"
      [aria-checked]="centerAlign.selected()"
    >
      Center
    </button>
    <button
      trtToolbarWidget
      role="radio"
      #rightAlign="trtToolbarWidget"
      value="align-right"
      type="button"
      aria-label="Align right"
      [aria-checked]="rightAlign.selected()"
    >
      Right
    </button>
  </div>
</div>`,
    },
  ];
}
