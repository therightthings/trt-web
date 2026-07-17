import { OverlayModule } from '@angular/cdk/overlay';
import { afterRenderEffect, Component, computed, signal, viewChild } from '@angular/core';
import {
  TrtCombobox,
  TrtComboboxPopup,
  TrtComboboxWidget,
  TrtListbox,
  TrtOption,
} from '@trt-web/angular';

import { IconModule } from '../../../shared/icons/font-awesome.module';

const OPTIONS = ['Inbox', 'In Progress', 'Review', 'Blocked', 'Done'];

@Component({
  selector: 'app-select',
  imports: [
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
