import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[preventWhitespace]',
})
export class PreventWhitespaceDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (this.shouldBlockWhitespaceOnlyInput(target?.value, event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    const pastedText = event.clipboardData?.getData('text/plain') ?? '';

    if (this.shouldBlockWhitespaceOnlyInput(target?.value, pastedText)) {
      event.preventDefault();
    }
  }

  private shouldBlockWhitespaceOnlyInput(currentValue: string | undefined, nextValue: string) {
    return (currentValue ?? '').trim() === '' && nextValue.trim() === '';
  }
}
