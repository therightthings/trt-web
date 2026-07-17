import { Option } from '@angular/aria/listbox';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtOption]',
  exportAs: 'trtOption, trt-option',
  hostDirectives: [
    {
      directive: Option,
      inputs: ['id', 'value', 'disabled', 'label'],
    },
  ],
})
export class TrtOption<V = unknown> {
  readonly option = inject(Option) as Option<V>;
}
