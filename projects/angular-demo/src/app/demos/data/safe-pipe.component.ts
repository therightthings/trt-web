import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '@trt-web/angular';

@Component({
  selector: 'app-safe-pipe',
  imports: [FormsModule, SafePipe],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">safe pipe</p>
        <h3 class="text-lg font-medium text-slate-950">
          Bypass Angular sanitization intentionally
        </h3>
        <p class="text-sm leading-6 text-slate-600">
          Use this carefully. The demo shows HTML, style, and URL bindings with a controlled
          preview.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="space-y-3">
          <label class="space-y-2 block text-sm text-slate-700">
            <span>Mode</span>
            <select class="w-full rounded border border-slate-300 px-3 py-2" [(ngModel)]="mode">
              <option value="html">html</option>
              <option value="style">style</option>
              <option value="url">url</option>
              <option value="resourceUrl">resourceUrl</option>
            </select>
          </label>

          <label class="space-y-2 block text-sm text-slate-700">
            <span>Content</span>
            <textarea
              class="min-h-32 w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
              [(ngModel)]="content"
            ></textarea>
          </label>

          @switch (mode) {
            @case ('html') {
              <section class="rounded border border-slate-200 p-4 text-sm text-slate-700">
                <div [innerHTML]="content | safe: 'html'"></div>
              </section>
            }
            @case ('style') {
              <section class="rounded border border-slate-200 p-4 text-sm text-slate-700">
                <div
                  class="inline-block rounded border border-slate-200 px-4 py-3"
                  [style]="content | safe: 'style'"
                >
                  Styled preview
                </div>
              </section>
            }
            @case ('url') {
              <section class="rounded border border-slate-200 p-4 text-sm text-slate-700">
                <a
                  class="underline underline-offset-4"
                  [href]="content | safe: 'url'"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open safe URL
                </a>
              </section>
            }
            @case ('resourceUrl') {
              <section class="rounded border border-slate-200 p-4 text-sm text-slate-700">
                <p class="mb-2">
                  resourceUrl is supported, but the demo keeps it as text to avoid loading remote
                  resources.
                </p>
                <pre
                  class="overflow-auto rounded border border-slate-200 p-3 text-xs text-slate-700"
                  >{{ content }}</pre
                >
              </section>
            }
          }
        </div>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-900">Safe pipe notes</p>
          <p>
            The pipe supports <code>html</code>, <code>style</code>, <code>script</code>,
            <code>url</code>, and <code>resourceUrl</code>.
          </p>
          <p>This demo only renders the safer preview paths directly in the page.</p>
        </section>
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
