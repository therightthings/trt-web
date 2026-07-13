import { Component, signal } from '@angular/core';
import { FreeDraggingDirective } from '@trt-web/angular';

import { CodeSampleComponent } from '../../shared/components/code-sample.component';

@Component({
  selector: 'app-free-dragging',
  imports: [FreeDraggingDirective, CodeSampleComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">[freeDragging]</div>
          <h3 class="card-title text-lg">Drag a card freely</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The directive tracks pointer movement and updates the element transform in place.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
          <div
            class="relative min-h-[20rem] overflow-hidden rounded-box border border-base-300 bg-base-200 p-4"
          >
            <div
              freeDragging
              class="absolute left-6 top-6 w-72 select-none rounded-box border border-base-300 bg-base-100 p-4 shadow-sm"
              (onDragEnd)="dragEnd.set($event)"
            >
              <p class="badge badge-outline badge-sm">Drag me</p>
              <p class="mt-2 text-sm leading-6 text-base-content/70">
                Move this panel around the canvas. It keeps its offset when you release it.
              </p>
            </div>
          </div>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p class="font-medium text-base-content">Last drag offset</p>
              <p>
                X: <span class="font-medium text-base-content">{{ dragEnd().offsetX }}</span>
              </p>
              <p>
                Y: <span class="font-medium text-base-content">{{ dragEnd().offsetY }}</span>
              </p>
              <p>
                The card uses a plain transform, so it stays lightweight and easy to compose inside
                layouts.
              </p>
            </div>
          </section>
        </div>

        <app-code-sample title="Code example" badge="Basic usage" [code]="codeExample" />
      </div>
    </article>
  `,
})
export class FreeDraggingComponent {
  protected readonly dragEnd = signal({ offsetX: 0, offsetY: 0 });
  protected readonly codeExample = [
    {
      fileExt: 'ts',
      code: `import { Component } from '@angular/core';
import { FreeDraggingDirective } from '@trt-web/angular';

@Component({
  selector: 'app-free-dragging',
  imports: [FreeDraggingDirective],
  template: \`<div freeDragging>Drag me</div>\`,
})
export class FreeDraggingComponent {}`,
    },
  ];
}
