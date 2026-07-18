import { ComboboxWidget } from '@angular/aria/combobox';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtComboboxWidget]',
  exportAs: 'trtComboboxWidget, trt-combobox-widget',
  hostDirectives: [
    {
      directive: ComboboxWidget,
      inputs: ['activeDescendant'],
    },
  ],
})
export class TrtComboboxWidget {
  readonly widget = inject(ComboboxWidget);
}
