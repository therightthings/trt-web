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

const OPTIONS = ['Design', 'Frontend', 'Backend', 'QA', 'DevOps', 'Product'];

@Component({
  selector: 'app-multiselect',
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
  templateUrl: './multiselect.component.html',
})
export class MultiselectComponent {
  protected readonly combobox = viewChild(TrtCombobox);
  protected readonly listbox = viewChild(TrtListbox);
  protected readonly popupExpanded = signal(false);
  protected readonly selectedValues = signal<string[]>(['Design', 'Frontend']);
  protected readonly options = OPTIONS;

  protected readonly displayValue = computed(() => {
    const values = this.selectedValues();
    if (!values.length) {
      return 'Choose labels';
    }

    if (values.length === 1) {
      return values[0];
    }

    return `${values[0]} + ${values.length - 1} more`;
  });
  protected readonly preferences: ApiPreference[] = [
    {
      name: 'expanded',
      description: 'Controls whether the popup is open.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'value',
      description: 'The selected option values in the popup listbox.',
      optional: true,
      default: '[]',
      unit: 'string[]',
    },
    {
      name: 'multi',
      description: 'Allows more than one option to stay selected.',
      optional: true,
      default: false,
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
      code: `<section>
  <header class="space-y-2">
    <div class="badge badge-outline badge-sm">trt-combobox</div>
    <h3 class="card-title text-lg">Multiselect built on Angular Aria</h3>
    <p class="text-sm leading-6 text-base-content/70">
      This demo mirrors the select pattern, but keeps multiple selections visible in the popup so
      the shared base styles are easy to inspect.
    </p>
  </header>

  <div>
    <label for="roles">Roles</label>

    <div class="flex relative">
      <input
        id="roles"
        trtCombobox
        #combobox="trtCombobox"
        readonly
        [value]="displayValue()"
        [(expanded)]="popupExpanded"
        (click)="popupExpanded.set(true)"
      />

      <button
        class="btn btn-ghost btn-square btn-xs rounded-full absolute right-2 top-1/2 -translate-y-1/2"
        type="button"
        (mousedown)="$event.preventDefault()"
        (click)="popupExpanded.set(true)"
      >
        <div [class.rotate-90]="popupExpanded()">
          <fa-icon icon="chevron-right" size="xs"></fa-icon>
        </div>
      </button>

      <ng-template
        [cdkConnectedOverlay]="{
          origin: combobox.combobox.element,
          usePopover: 'inline',
          matchWidth: true,
        }"
        [cdkConnectedOverlayOpen]="popupExpanded()"
      >
        <ng-template trtComboboxPopup [combobox]="combobox.combobox">
          <div
            trtComboboxWidget
            trtListbox
            #listbox="trtListbox"
            [multi]="true"
            focusMode="activedescendant"
            selectionMode="explicit"
            [tabindex]="-1"
            [activeDescendant]="listbox.activeDescendant()"
            [(value)]="selectedValues"
          >
            @for (option of options; track option) {
              <div trtOption [value]="option" [label]="option">
                <span>{{ option }}</span>
                @if (selectedValues().includes(option)) {
                  <fa-icon icon="check" size="2xs"></fa-icon>
                }
              </div>
            }
          </div>
        </ng-template>
      </ng-template>
    </div>
  </div>
</section>`,
    },
  ];

  constructor() {
    afterRenderEffect(() => {
      if (this.popupExpanded()) {
        this.listbox()?.listbox.scrollActiveItemIntoView();
      }
    });
  }

  protected closePopup(): void {
    this.popupExpanded.set(false);
    this.combobox()?.combobox.element.focus();
  }
}
