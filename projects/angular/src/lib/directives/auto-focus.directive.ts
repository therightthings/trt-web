import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';

@Directive({
  selector: 'input[autoFocus]',
})
export class AutoFocusDirective {
  private readonly inputEl = inject(ElementRef<HTMLInputElement>).nativeElement;

  readonly autoFocus = input(true, {
    transform: booleanAttribute,
  });
  readonly autoFocusDelay = input<number>(150);

  constructor() {
    afterNextRender({
      write: () => {
        void this.focus();
      },
    });
  }

  private async focus(): Promise<void> {
    if (!this.autoFocus()) {
      return;
    }

    const delay = this.autoFocusDelay();

    if (delay > 0) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, delay);
      });
    }

    this.inputEl.focus();
  }
}
