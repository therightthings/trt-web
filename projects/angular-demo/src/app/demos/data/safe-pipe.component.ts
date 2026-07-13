import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '@trt-web/angular';

@Component({
  selector: 'app-safe-pipe',
  imports: [FormsModule, SafePipe],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">safe pipe</div>
          <h3 class="card-title text-lg">Bypass Angular sanitization intentionally</h3>
          <p class="text-sm leading-6 text-base-content/70">
            Use this carefully. The demo shows HTML, style, and URL bindings with a controlled
            preview.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="space-y-3">
            <label class="form-control gap-2 text-sm">
              <span>Mode</span>
              <select class="select select-bordered w-full" [(ngModel)]="mode">
                <option value="html">html</option>
                <option value="style">style</option>
                <option value="url">url</option>
                <option value="resourceUrl">resourceUrl</option>
              </select>
            </label>

            <label class="form-control gap-2 text-sm">
              <span>Content</span>
              <textarea
                class="textarea textarea-bordered min-h-32 w-full font-mono text-xs"
                [(ngModel)]="content"
              ></textarea>
            </label>

            @switch (mode) {
              @case ('html') {
                <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
                  <div class="card-body gap-3 text-sm text-base-content/80">
                    <div [innerHTML]="content | safe: 'html'"></div>
                  </div>
                </section>
              }
              @case ('style') {
                <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
                  <div class="card-body gap-3 text-sm text-base-content/80">
                    <div
                      class="inline-block rounded-box border border-base-300 bg-base-100 px-4 py-3"
                      [style]="content | safe: 'style'"
                    >
                      Styled preview
                    </div>
                  </div>
                </section>
              }
              @case ('url') {
                <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
                  <div class="card-body gap-3 text-sm text-base-content/80">
                    <a
                      class="link link-primary"
                      [href]="content | safe: 'url'"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open safe URL
                    </a>
                  </div>
                </section>
              }
              @case ('resourceUrl') {
                <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
                  <div class="card-body gap-3 text-sm text-base-content/80">
                    <p>
                      resourceUrl is supported, but the demo keeps it as text to avoid loading
                      remote resources.
                    </p>
                    <pre
                      class="overflow-auto rounded-box border border-base-300 bg-base-100 p-3 text-xs text-base-content"
                      >{{ content }}</pre
                    >
                  </div>
                </section>
              }
            }
          </div>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p class="font-medium text-base-content">Safe pipe notes</p>
              <p>
                The pipe supports <code>html</code>, <code>style</code>, <code>script</code>,
                <code>url</code>, and <code>resourceUrl</code>.
              </p>
              <p>This demo only renders the safer preview paths directly in the page.</p>
            </div>
          </section>
        </div>
      </div>
    </article>
  `,
})
export class SafePipeComponent {
  protected mode: 'html' | 'style' | 'url' | 'resourceUrl' = 'html';
  protected content = '<strong>Hello from safe pipe</strong>';

  constructor() {
    this.content = '<strong>Hello from safe pipe</strong>';
  }
}
