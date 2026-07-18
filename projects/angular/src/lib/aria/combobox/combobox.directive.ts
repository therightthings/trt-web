import { Combobox } from '@angular/aria/combobox';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtCombobox]',
  exportAs: 'trtCombobox, trt-combobox',
  hostDirectives: [
    {
      directive: Combobox,
      inputs: [
        'disabled',
        'softDisabled',
        'alwaysExpanded',
        'expanded',
        'value',
        'inlineSuggestion',
      ],
      outputs: ['expandedChange', 'valueChange'],
    },
  ],
})
export class TrtCombobox {
  readonly combobox = inject(Combobox);
}
