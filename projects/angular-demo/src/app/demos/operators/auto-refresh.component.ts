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
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">autoRefresh</p>
        <h3 class="text-lg font-medium text-slate-950">Poll with a bounded refresh loop</h3>
        <p class="text-sm leading-6 text-slate-600">
          The operator re-sources the observable after a delay and exposes the refresh context.
        </p>
      </header>

      <div class="flex flex-wrap gap-2">
        <button
          class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
          type="button"
          (click)="start()"
        >
          Start polling
        </button>
        <button
          class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
          type="button"
          (click)="stop()"
        >
          Stop polling
        </button>
      </div>

      <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
        <p>
          State:
          <span class="font-medium text-slate-950">{{ running ? 'running' : 'idle' }}</span>
        </p>
        <p>
          Emissions:
          <span class="font-medium text-slate-950">{{ events.length }}</span>
        </p>

        <div class="space-y-2">
          @for (event of events; track event.timestamp) {
            <div class="rounded border border-slate-200 px-3 py-2 text-slate-700">
              {{ event.timestamp }} | refreshCount={{ event.refreshCount }} | auto={{
                event.isAutoRefresh
              }}
            </div>
          }
        </div>
      </section>
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
