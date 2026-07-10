import { Component } from '@angular/core';
import { FreeDraggingDirective } from '@trt-web/angular';

@Component({
  selector: 'app-free-dragging',
  imports: [FreeDraggingDirective],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">[freeDragging]</p>
        <h3 class="text-lg font-medium text-slate-950">Drag a card freely</h3>
        <p class="text-sm leading-6 text-slate-600">
          The directive tracks pointer movement and updates the element transform in place.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div class="relative min-h-[20rem] overflow-hidden rounded border border-slate-200 p-4">
          <div
            freeDragging
            class="absolute left-6 top-6 w-72 cursor-grab select-none rounded border border-slate-300 p-4 shadow-sm"
            (onDragEnd)="dragEnd = $event"
          >
            <p class="text-xs tracking-[0.2em] text-slate-500">Drag me</p>
            <p class="mt-2 text-sm leading-6 text-slate-700">
              Move this panel around the canvas. It keeps its offset when you release it.
            </p>
          </div>
        </div>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-900">Last drag offset</p>
          <p>
            X: <span class="font-medium text-slate-950">{{ dragEnd.offsetX }}</span>
          </p>
          <p>
            Y: <span class="font-medium text-slate-950">{{ dragEnd.offsetY }}</span>
          </p>
          <p>
            The card uses a plain transform, so it stays lightweight and easy to compose inside
            layouts.
          </p>
        </section>
      </div>
    </article>
  `,
})
export class FreeDraggingComponent {
  protected dragEnd = { offsetX: 0, offsetY: 0 };
}
