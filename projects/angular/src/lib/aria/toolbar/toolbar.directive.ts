import { Toolbar } from '@angular/aria/toolbar';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[trtToolbar]',
  exportAs: 'trtToolbar, trt-toolbar',
  hostDirectives: [
    {
      directive: Toolbar,
      inputs: ['orientation', 'softDisabled', 'disabled', 'wrap', 'value'],
      outputs: ['valueChange'],
    },
  ],
})
export class TrtToolbar<V = unknown> {
  readonly toolbar = inject(Toolbar<V>);
}
