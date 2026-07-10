import { Component, Input } from '@angular/core';
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
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
}
