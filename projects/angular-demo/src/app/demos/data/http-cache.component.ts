import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpCacheService } from '@trt-web/angular';

import { HttpCacheQuote, MockHttpCacheService } from './mock-http-cache.service';

@Component({
  selector: 'app-http-cache',
  imports: [FormsModule, JsonPipe],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">http-cache</p>
        <h3 class="text-lg font-medium text-slate-950">Cache HTTP responses by context</h3>
        <p class="text-sm leading-6 text-slate-600">
          The demo uses a mock backend interceptor and the library cache interceptor together.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="space-y-3">
          <label class="space-y-2 block text-sm text-slate-700">
            <span>Topic</span>
            <select class="w-full rounded border border-slate-300 px-3 py-2" [(ngModel)]="topic">
              <option value="utils">utils</option>
              <option value="forms">forms</option>
              <option value="data">data</option>
            </select>
          </label>

          <label class="space-y-2 block text-sm text-slate-700">
            <span>TTL: {{ ttlMs }}ms</span>
            <input
              class="w-full"
              type="range"
              min="1000"
              max="20000"
              step="500"
              [(ngModel)]="ttlMs"
            />
          </label>

          <div class="flex flex-wrap gap-2">
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="button"
              (click)="load()"
            >
              Load cached quote
            </button>
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="button"
              (click)="load(true)"
            >
              Force overwrite
            </button>
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="button"
              (click)="clear()"
            >
              Clear cache
            </button>
          </div>

          @if (loading()) {
            <p class="text-sm text-slate-600">Loading...</p>
          }

          @if (error()) {
            <p class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700">
              {{ error() }}
            </p>
          }

          @if (response()) {
            <pre class="overflow-auto rounded border border-slate-200 p-3 text-xs text-slate-700">{{
              response() | json
            }}</pre>
          }
        </div>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-900">Cache signals</p>
          <p>
            Backend hits:
            <span class="font-medium text-slate-950">{{ demo.backendHitCount() }}</span>
          </p>
          <p>
            Current topic: <span class="font-medium text-slate-950">{{ topic }}</span>
          </p>
          <p>
            The first request reaches the mock backend. Repeating the same request hits the cache
            until the TTL expires.
          </p>
          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
            type="button"
            (click)="demo.reset()"
          >
            Reset backend counter
          </button>
        </section>
      </div>
    </article>
  `,
})
export class HttpCacheComponent {
  readonly demo = inject(MockHttpCacheService);
  private readonly http = inject(HttpClient);
  private readonly cache = inject(HttpCacheService);

  protected topic = 'utils';
  protected ttlMs = 10_000;
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected response = signal<HttpCacheQuote | null>(null);

  load(overwrite = false): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<HttpCacheQuote>('/api/demo/quote', {
        params: { topic: this.topic },
        context: HttpCacheService.createContext({
          ttl: this.ttlMs,
          tag: [this.topic],
          group: 'quote-demo',
          id: `quote-${this.topic}`,
          overwrite,
        }),
      })
      .subscribe({
        next: (value) => this.response.set(value),
        error: (err: unknown) => {
          this.error.set(err instanceof Error ? err.message : 'Unknown error');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }

  clear(): void {
    this.cache.clearAll();
    this.response.set(null);
  }
}
