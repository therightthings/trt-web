import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[actionLock]',
})
export class ActionLockDirective implements OnInit, OnDestroy {
  readonly lockMs = input<number>(1000, {
    alias: 'actionLockMs',
  });

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private unlockTimer?: number;
  private isLocked = false;

  ngOnInit() {
    this.host.addEventListener('click', this.handleClick, true);
  }

  ngOnDestroy() {
    this.host.removeEventListener('click', this.handleClick, true);

    if (this.unlockTimer !== undefined) {
      window.clearTimeout(this.unlockTimer);
    }
  }

  private readonly handleClick = (event: MouseEvent) => {
    if (this.isLocked) {
      this.blockEvent(event);
      return;
    }

    this.startLock();
  };

  private startLock() {
    this.isLocked = true;

    if (this.unlockTimer !== undefined) {
      window.clearTimeout(this.unlockTimer);
    }

    this.unlockTimer = window.setTimeout(
      () => {
        this.isLocked = false;
        this.unlockTimer = undefined;
      },
      Math.max(0, this.lockMs()),
    );
  }

  private blockEvent(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }
}
