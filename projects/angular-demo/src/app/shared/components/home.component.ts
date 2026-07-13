import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <section class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-4">
        <div class="badge badge-outline badge-sm">Overview</div>
        <p class="max-w-3xl text-sm leading-6 text-base-content/70">
          This app walks through the current <code>@trt-web/angular</code> exports with a small,
          route-driven demo for each utility group.
        </p>
      </div>
    </section>
  `,
})
export class HomeComponent {}
