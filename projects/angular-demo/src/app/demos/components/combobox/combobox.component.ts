import { OverlayModule } from '@angular/cdk/overlay';
import { afterRenderEffect, Component, computed, signal, viewChild } from '@angular/core';
import {
  TrtCombobox,
  TrtComboboxPopup,
  TrtComboboxWidget,
  TrtListbox,
  TrtOption,
} from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';
import { IconModule } from '../../../shared/icons/font-awesome.module';

const COUNTRIES = [
  'Argentina',
  'Australia',
  'Belgium',
  'Canada',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'India',
  'Japan',
  'Mexico',
  'Netherlands',
  'Norway',
  'Portugal',
  'Spain',
  'United Kingdom',
  'United States of America',
  'Vietnam',
];

@Component({
  selector: 'app-combobox',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    IconModule,
    OverlayModule,
    TrtCombobox,
    TrtComboboxPopup,
    TrtComboboxWidget,
    TrtListbox,
    TrtOption,
  ],
  templateUrl: './combobox.component.html',
})
export class ComboboxComponent {
  protected readonly combobox = viewChild(TrtCombobox);
  protected readonly listbox = viewChild(TrtListbox);

  protected readonly popupExpanded = signal(false);
  protected readonly query = signal('');
  protected readonly selectedOption = signal<string[]>([]);

  protected readonly countries = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) {
      return COUNTRIES;
    }

    return COUNTRIES.filter((country) => country.toLowerCase().startsWith(term));
  });

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'disabled',
      description: 'Disables the combobox and its trigger interactions.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'softDisabled',
      description: 'Keeps disabled combobox states focusable while preventing interaction.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'alwaysExpanded',
      description: 'Keeps the combobox popup expanded instead of toggling it.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'expanded',
      description: 'Two-way bound popup visibility state for the combobox.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'value',
      description: 'The editable text value in the combobox input.',
      optional: true,
      default: '',
      unit: 'string',
    },
    {
      name: 'inlineSuggestion',
      description: 'Optional inline suggestion shown inside the input.',
      optional: true,
      default: undefined,
      unit: 'string | undefined',
    },
    {
      name: 'popupType',
      description: 'Identifies the popup content type attached to the combobox.',
      optional: true,
      default: 'listbox',
      unit: 'listbox | tree | grid | dialog',
    },
    {
      name: 'listbox.value',
      description: 'The selected option values inside the popup listbox.',
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
      description: 'Disables an option while keeping the surrounding listbox active.',
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
      code: `<div #origin class="relative">
  <input trtCombobox #combobox="trtCombobox" [(value)]="query" [(expanded)]="popupExpanded" />

  <button type="button">
    <fa-icon [icon]="clearIcon" size="xs"></fa-icon>
  </button>

  <ng-template
    [cdkConnectedOverlay]="{ origin, usePopover: 'inline', matchWidth: true }"
    [cdkConnectedOverlayOpen]="popupExpanded()"
  >
    <ng-template trtComboboxPopup [combobox]="combobox.combobox">
      <div
        trtComboboxWidget
        trtListbox
        #listbox="trtListbox"
        focusMode="activedescendant"
        [tabindex]="-1"
        [activeDescendant]="listbox.activeDescendant()"
        [(value)]="selectedOption"
      >
        @for (country of countries(); track country) {
          <div trtOption [value]="country" [label]="country">{{ country }}</div>
        }
      </div>
    </ng-template>
  </ng-template>
</div>`,
    },
  ];

  constructor() {
    afterRenderEffect(() => {
      if (this.combobox()?.combobox.expanded()) {
        this.listbox()?.listbox.scrollActiveItemIntoView();
      }
    });
  }

  protected clear(): void {
    this.query.set('');
    this.selectedOption.set([]);
    this.popupExpanded.set(false);
    this.combobox()?.combobox.element.focus();
  }

  protected onBlur(): void {
    this.commitSelection();
  }

  protected onCommit(): void {
    this.commitSelection();
    this.popupExpanded.set(false);
    this.combobox()?.combobox.element.focus();
  }

  private commitSelection(): void {
    const selected = this.selectedOption()[0];
    if (selected) {
      this.query.set(selected);
      return;
    }

    this.query.set('');
  }
}
