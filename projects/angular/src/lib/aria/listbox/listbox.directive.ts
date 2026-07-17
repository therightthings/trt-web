import { Listbox } from '@angular/aria/listbox';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtListbox]',
  exportAs: 'trtListbox, trt-listbox',
  hostDirectives: [
    {
      directive: Listbox,
      inputs: [
        'id',
        'orientation',
        'multi',
        'wrap',
        'softDisabled',
        'focusMode',
        'selectionMode',
        'typeaheadDelay',
        'disabled',
        'readonly',
        'value',
      ],
      outputs: ['valueChange'],
    },
  ],
})
export class TrtListbox {
  readonly listbox = inject(Listbox);
  readonly activeDescendant = this.listbox.activeDescendant;
}
