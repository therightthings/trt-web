import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-feature-shell',
  imports: [RouterOutlet],
  template: `
    <section class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-5">
        <router-outlet />
      </div>
    </section>
  `,
})
export class FeatureShellComponent {
  readonly eyebrow = input('');
  readonly title = input('');
  readonly description = input('');
}
