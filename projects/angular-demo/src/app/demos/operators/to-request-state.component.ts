import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RequestState, toRequestState } from '@trt-web/angular';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

type RequestPayload = { title: string; at: string };

@Component({
  selector: 'app-to-request-state',
  imports: [AsyncPipe, JsonPipe],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">toRequestState</p>
        <h3 class="text-lg font-medium text-slate-950">Map loading / success / error states</h3>
        <p class="text-sm leading-6 text-slate-600">
          The operator wraps a source observable and emits a state object that templates can render
          directly.
        </p>
      </header>

      <div class="flex flex-wrap gap-2">
        <button
          class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
          type="button"
          (click)="request('success')"
        >
          Load success
        </button>
        <button
          class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
          type="button"
          (click)="request('error')"
        >
          Load error
        </button>
      </div>

      @if (requestState$ | async; as requestState) {
        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p>
            Current state:
            <span class="font-medium text-slate-950">{{ requestState.state }}</span>
          </p>

          @if (requestState.state === 'done') {
            <pre class="overflow-auto rounded border border-slate-200 p-3 text-xs text-slate-700">{{
              requestState.data | json
            }}</pre>
          }

          @if (requestState.state === 'error') {
            <p class="rounded border border-slate-200 px-3 py-2 text-slate-700">
              {{ requestState.error }}
            </p>
          }
        </section>
      }
    </article>
  `,
})
export class ToRequestStateComponent {
  private readonly action$ = new BehaviorSubject<'success' | 'error'>('success');

  readonly requestState$: Observable<RequestState<RequestPayload>> = this.action$.pipe(
    switchMap((mode) => this.fetchDemo(mode).pipe(toRequestState())),
  );

  request(mode: 'success' | 'error'): void {
    this.action$.next(mode);
  }

  private fetchDemo(mode: 'success' | 'error') {
    return new Observable<{ title: string; at: string }>((observer) => {
      const timerId = window.setTimeout(() => {
        if (mode === 'error') {
          observer.error(new Error('Demo request failed on purpose.'));
          return;
        }

        observer.next({
          title: 'Request completed successfully',
          at: new Date().toLocaleTimeString(),
        });
        observer.complete();
      }, 550);

      return () => window.clearTimeout(timerId);
    });
  }
}
