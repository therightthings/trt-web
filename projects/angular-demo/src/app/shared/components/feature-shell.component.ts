import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-feature-shell',
  imports: [RouterOutlet],
  template: `
    <section class="space-y-5">
      <router-outlet />
    </section>
  `,
})
export class FeatureShellComponent {
  readonly eyebrow = input('');
  readonly title = input('');
  readonly description = input('');
}
