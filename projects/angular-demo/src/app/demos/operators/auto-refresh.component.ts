import { Component, OnDestroy } from '@angular/core';
import { autoRefresh } from '@trt-web/angular';
import { Observable, of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

type RefreshEvent = {
  refreshCount: number;
  isAutoRefresh: boolean;
  timestamp: string;
};

@Component({
  selector: 'app-auto-refresh',
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
              <span class="font-medium text-base-content">{{ running ? 'running' : 'idle' }}</span>
            </p>
            <p>
              Emissions:
              <span class="font-medium text-base-content">{{ events.length }}</span>
            </p>

            <div class="space-y-2">
              @for (event of events; track event.timestamp) {
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
      </div>
    </article>
  `,
})
export class AutoRefreshComponent implements OnDestroy {
  protected running = false;
  protected events: RefreshEvent[] = [];

  private subscription = Subscription.EMPTY;

  start(): void {
    this.stop();
    this.running = true;
    this.events = [];

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
      this.events = [...this.events, event];
    });
  }

  stop(): void {
    this.subscription.unsubscribe();
    this.subscription = Subscription.EMPTY;
    this.running = false;
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
