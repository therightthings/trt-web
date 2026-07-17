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

const OPTIONS = ['Design', 'Frontend', 'Backend', 'QA', 'DevOps', 'Product'];

@Component({
  selector: 'app-multiselect',
  imports: [
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
