import { ComboboxPopup } from '@angular/aria/combobox';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: 'ng-template[trtComboboxPopup]',
  exportAs: 'trtComboboxPopup, trt-combobox-popup',
  hostDirectives: [
    {
      directive: ComboboxPopup,
      inputs: ['combobox', 'popupType'],
    },
  ],
})
export class TrtComboboxPopup {
  readonly popup = inject(ComboboxPopup);
}
