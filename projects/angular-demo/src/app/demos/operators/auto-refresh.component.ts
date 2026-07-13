import { Component, OnDestroy, signal } from '@angular/core';
import { autoRefresh } from '@trt-web/angular';
import { Observable, of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import { ApiPreferencesComponent } from '../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../shared/components/code-sample.component';

type RefreshEvent = {
  refreshCount: number;
  isAutoRefresh: boolean;
  timestamp: string;
};

@Component({
  selector: 'app-auto-refresh',
  imports: [ApiPreferencesComponent, CodeSampleComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">autoRefresh</div>
          <h3 class="card-title text-lg">Poll with a bounded refresh loop</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The operator re-sources the observable after a delay and exposes the refresh context.
          </p>
        </header>

        <div class="flex flex-wrap gap-2">
          <button class="btn btn-primary btn-sm" type="button" (click)="start()">
            Start polling
          </button>
          <button class="btn btn-outline btn-sm" type="button" (click)="stop()">
            Stop polling
          </button>
        </div>

        <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
          <div class="card-body gap-3 text-sm text-base-content/70">
            <p>
              State:
              <span class="font-medium text-base-content">{{
                running() ? 'running' : 'idle'
              }}</span>
            </p>
            <p>
              Emissions:
              <span class="font-medium text-base-content">{{ events().length }}</span>
            </p>

            <div class="space-y-2">
              @for (event of events(); track event.timestamp) {
                <div
                  class="rounded-box border border-base-300 bg-base-100 px-3 py-2 text-base-content/80"
                >
                  {{ event.timestamp }} | refreshCount={{ event.refreshCount }} | auto={{
                    event.isAutoRefresh
                  }}
                </div>
              }
            </div>
          </div>
        </section>

        <app-code-sample title="Code example" badge="Basic usage" [code]="codeExample" />

        <app-api-preferences [preferences]="preferences" />
      </div>
    </article>
  `,
})
export class AutoRefreshComponent implements OnDestroy {
  protected readonly running = signal(false);
  protected readonly events = signal<RefreshEvent[]>([]);
  protected readonly preferences = [
    {
      name: 'delay',
      description: 'How long the operator waits before asking for the next refresh.',
      optional: true,
      default: { value: 1, unit: 'second' },
      unit: 'time',
    },
    {
      name: 'maxRefreshCount',
      description: 'Stops the refresh loop after this many automatic reruns.',
      optional: true,
      default: 4,
      unit: 'count',
    },
  ];
  protected readonly codeExample = [
    {
      fileExt: 'ts',
      code: `import { autoRefresh } from '@trt-web/angular';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

autoRefresh(() => of('data').pipe(delay(350)), {
  delay: { value: 1, unit: 'second' },
});`,
    },
  ];

  private subscription = Subscription.EMPTY;

  start(): void {
    this.stop();
    this.running.set(true);
    this.events.set([]);

    const source = (context: {
      isAutoRefresh: boolean;
      refreshCount: number;
    }): Observable<RefreshEvent> => {
      return of({
        refreshCount: context.refreshCount,
        isAutoRefresh: context.isAutoRefresh,
        timestamp: new Date().toLocaleTimeString(),
      }).pipe(delay(350));
    };

    this.subscription = autoRefresh(source, {
      delay: { value: 1, unit: 'second' },
      maxRefreshCount: 4,
    }).subscribe((event) => {
      this.events.update((current) => [...current, event]);
    });
  }

  stop(): void {
    this.subscription.unsubscribe();
    this.subscription = Subscription.EMPTY;
    this.running.set(false);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
