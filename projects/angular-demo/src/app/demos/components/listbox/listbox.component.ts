import { Component, computed, signal } from '@angular/core';
import { TrtListbox, TrtOption } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';

const OPTIONS = ['Angular', 'React', 'Solid', 'Svelte', 'Vue', 'Lit', 'Qwik'];

@Component({
  selector: 'app-listbox',
  imports: [ApiPreferencesComponent, CodeSampleComponent, TrtListbox, TrtOption],
  templateUrl: './listbox.component.html',
})
export class ListboxComponent {
  protected readonly selectedValues = signal<string[]>(['Angular']);
  protected readonly options = OPTIONS;

  protected readonly selectedLabel = computed(() => this.selectedValues()[0] ?? 'None');

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'disabled',
      description: 'Disables the listbox and its option interactions.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'readonly',
      description: 'Prevents the selection from changing while keeping the list focusable.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'multi',
      description: 'Allows more than one option to stay selected.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'wrap',
      description: 'Wraps keyboard navigation from the end back to the start.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'softDisabled',
      description: 'Keeps disabled options focusable while preventing interaction.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'focusMode',
      description: 'Controls whether focus stays on the listbox or moves onto items.',
      optional: true,
      default: 'roving',
      unit: 'roving | activedescendant',
    },
    {
      name: 'selectionMode',
      description: 'Controls whether selection follows focus or is committed explicitly.',
      optional: true,
      default: 'follow',
      unit: 'follow | explicit',
    },
    {
      name: 'value',
      description: 'The selected option values in the listbox.',
      optional: true,
      default: '[]',
      unit: 'string[]',
    },
    {
      name: 'option.value',
      description: 'The value represented by each option item.',
      optional: false,
      default: 'required',
      unit: 'string',
    },
    {
      name: 'option.disabled',
      description: 'Disables an option while keeping the rest of the list interactive.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'option.label',
      description: 'Accessible search label used by typeahead and filtering.',
      optional: true,
      default: undefined,
      unit: 'string | undefined',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<div trtListbox focusMode="activedescendant" [tabindex]="0" [(value)]="selectedValues">
  @for (option of options; track option) {
    <div trtOption [value]="option" [label]="option">{{ option }}</div>
  }
</div>`,
    },
  ];
}
