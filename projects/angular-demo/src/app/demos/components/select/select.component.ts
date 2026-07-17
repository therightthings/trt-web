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

const OPTIONS = ['Inbox', 'In Progress', 'Review', 'Blocked', 'Done'];

@Component({
  selector: 'app-select',
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
  templateUrl: './select.component.html',
})
export class SelectComponent {
  protected readonly combobox = viewChild(TrtCombobox);
  protected readonly listbox = viewChild(TrtListbox);
  protected readonly popupExpanded = signal(false);
  protected readonly selectedOption = signal<string[]>(['Inbox']);
  protected readonly options = OPTIONS;
  protected readonly selectedLabel = computed(() => this.selectedOption()[0] ?? 'Choose status');
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
      name: 'multi',
      description: 'Allows more than one option to stay selected.',
      optional: true,
      default: false,
      unit: 'boolean',
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
  <header>
    <div>trt-combobox + trt-listbox</div>
    <h3>Select built on Angular Aria</h3>
  </header>

  <div>
    <label for="status">Status</label>

    <div class="flex relative">
      <input
        id="status"
        trtCombobox
        #combobox="trtCombobox"
        readonly
        [value]="selectedLabel()"
        [(expanded)]="popupExpanded"
        (click)="popupExpanded.set(true)"
      />

      <button
        class="btn btn-ghost btn-square btn-xs rounded-full absolute right-2 top-1/2 -translate-y-1/2"
        type="button"
        (mousedown)="$event.preventDefault()"
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
          <div class="w-full">
            <div
              trtComboboxWidget
              trtListbox
              class="w-full"
              #listbox="trtListbox"
              focusMode="activedescendant"
              selectionMode="explicit"
              [tabindex]="-1"
              [activeDescendant]="listbox.activeDescendant()"
              [(value)]="selectedOption"
              (click)="closePopup()"
              (keydown.enter)="closePopup()"
              (keydown.space)="closePopup()"
            >
              @for (option of options; track option) {
                <div trtOption class="w-full" [value]="option" [label]="option">{{ option }}</div>
              }
            </div>
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
