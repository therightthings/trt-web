import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <section class="space-y-6">
      <header class="space-y-3 border-b border-slate-200 pb-5">
        <div class="space-y-2">
          <p class="max-w-3xl text-sm leading-6 text-slate-600">
            This app walks through the current <code>@trt-web/angular</code> exports and the
            directive families from <code>@angular/aria</code> with a small, route-driven demo for
            each utility group.
          </p>
        </div>
      </header>
    </section>
  `,
})
export class HomeComponent {}
