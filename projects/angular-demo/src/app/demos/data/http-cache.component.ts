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
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">http-cache</div>
          <h3 class="card-title text-lg">Cache HTTP responses by context</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The demo uses a mock backend interceptor and the library cache interceptor together.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="space-y-3">
            <label class="form-control gap-2 text-sm">
              <span>Topic</span>
              <select class="select select-bordered w-full" [(ngModel)]="topic">
                <option value="utils">utils</option>
                <option value="forms">forms</option>
                <option value="data">data</option>
              </select>
            </label>

            <label class="form-control gap-2 text-sm">
              <span>TTL: {{ ttlMs }}ms</span>
              <input
                class="range range-primary"
                type="range"
                min="1000"
                max="20000"
                step="500"
                [(ngModel)]="ttlMs"
              />
            </label>

            <div class="flex flex-wrap gap-2">
              <button class="btn btn-primary btn-sm" type="button" (click)="load()">
                Load cached quote
              </button>
              <button class="btn btn-outline btn-sm" type="button" (click)="load(true)">
                Force overwrite
              </button>
              <button class="btn btn-outline btn-sm" type="button" (click)="clear()">
                Clear cache
              </button>
            </div>

            @if (loading()) {
              <div class="alert alert-info">
                <span>Loading...</span>
              </div>
            }

            @if (error()) {
              <div class="alert alert-error">
                <span>{{ error() }}</span>
              </div>
            }

            @if (response()) {
              <pre
                class="overflow-auto rounded-box border border-base-300 bg-base-200 p-3 text-xs text-base-content"
                >{{ response() | json }}</pre
              >
            }
          </div>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p class="font-medium text-base-content">Cache signals</p>
              <p>
                Backend hits:
                <span class="font-medium text-base-content">{{ demo.backendHitCount() }}</span>
              </p>
              <p>
                Current topic: <span class="font-medium text-base-content">{{ topic }}</span>
              </p>
              <p>
                The first request reaches the mock backend. Repeating the same request hits the
                cache until the TTL expires.
              </p>
              <button class="btn btn-outline btn-sm" type="button" (click)="demo.reset()">
                Reset backend counter
              </button>
            </div>
          </section>
        </div>
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
