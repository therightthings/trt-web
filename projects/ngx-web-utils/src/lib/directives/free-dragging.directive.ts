import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  output,
  Renderer2,
  signal,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[freeDragging]',
})
export class FreeDraggingDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly subscription = new Subscription();

  readonly onDragEnd = output<{ offsetX: number; offsetY: number }>();

  private readonly element = this.elementRef.nativeElement as HTMLElement;

  private readonly offsetX = signal<number>(0);
  private readonly offsetY = signal<number>(0);

  ngOnInit() {
    const dragStart$ = fromEvent<MouseEvent>(this.element, 'mousedown');
    const dragMove$ = fromEvent<MouseEvent>(this.document, 'mousemove');
    const dragEnd$ = fromEvent<MouseEvent>(this.document, 'mouseup');

    const drag$ = dragStart$.pipe(
      switchMap((startEvent) => {
        startEvent.preventDefault();
        const startX = startEvent.clientX - this.offsetX();
        const startY = startEvent.clientY - this.offsetY();

        return dragMove$.pipe(
          takeUntil(dragEnd$),
          tap((moveEvent) => {
            moveEvent.preventDefault();
            this.offsetX.set(moveEvent.clientX - startX);
            this.offsetY.set(moveEvent.clientY - startY);
            this.renderer.setStyle(
              this.element,
              'transform',
              `translate3d(${this.offsetX()}px, ${this.offsetY()}px, 0)`,
            );
          }),
        );
      }),
    );

    const endClick$ = dragEnd$.pipe(
      tap(() => {
        this.onDragEnd.emit({
          offsetX: this.offsetX(),
          offsetY: this.offsetY(),
        });
      }),
    );

    this.subscription.add(drag$.subscribe());
    this.subscription.add(endClick$.subscribe());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
