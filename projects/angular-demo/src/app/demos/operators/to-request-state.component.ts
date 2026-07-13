import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RequestState, toRequestState } from '@trt-web/angular';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

type RequestPayload = { title: string; at: string };

@Component({
  selector: 'app-to-request-state',
  imports: [AsyncPipe, JsonPipe],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">toRequestState</div>
          <h3 class="card-title text-lg">Map loading / success / error states</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The operator wraps a source observable and emits a state object that templates can
            render directly.
          </p>
        </header>

        <div class="flex flex-wrap gap-2">
          <button class="btn btn-primary btn-sm" type="button" (click)="request('success')">
            Load success
          </button>
          <button class="btn btn-outline btn-sm" type="button" (click)="request('error')">
            Load error
          </button>
        </div>

        @if (requestState$ | async; as requestState) {
          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p>
                Current state:
                <span class="font-medium text-base-content">{{ requestState.state }}</span>
              </p>

              @if (requestState.state === 'done') {
                <pre
                  class="overflow-auto rounded-box border border-base-300 bg-base-100 p-3 text-xs text-base-content"
                  >{{ requestState.data | json }}</pre
                >
              }

              @if (requestState.state === 'error') {
                <div class="alert alert-error">
                  <span>{{ requestState.error }}</span>
                </div>
              }
            </div>
          </section>
        }
      </div>
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
