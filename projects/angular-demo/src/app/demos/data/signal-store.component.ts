import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignalStore } from '@trt-web/angular';

type TodoItem = {
  id: number;
  title: string;
  done: boolean;
};

@Component({
  selector: 'app-signal-store',
  imports: [FormsModule, JsonPipe],
  template: `
    <article class="">
      <header class="space-y-2">
        <p class="text-xs tracking-[0.2em] text-slate-500">SignalStore</p>
        <h3 class="text-lg font-medium text-slate-950">Persist a small todo list with signals</h3>
        <p class="text-sm leading-6 text-slate-600">
          The store handles list CRUD, expiry, and local/session storage sync.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="space-y-3">
          <form class="flex flex-wrap gap-2" (submit)="add($event)">
            <input
              class="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
              [(ngModel)]="title"
              name="title"
              placeholder="Add a todo item"
            />
            <button
              class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
              type="submit"
            >
              Add
            </button>
          </form>

          <div class="space-y-2">
            @for (item of store.state().data; track item.id) {
              <div
                class="flex items-center justify-between gap-3 rounded border border-slate-200 px-3 py-2 text-sm"
              >
                <button class="text-left text-slate-700" type="button" (click)="toggle(item.id)">
                  <span class="font-medium text-slate-950">{{ item.title }}</span>
                  <span class="ml-2 text-xs tracking-[0.2em] text-slate-500">
                    {{ item.done ? 'done' : 'open' }}
                  </span>
                </button>
                <button
                  class="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700"
                  type="button"
                  (click)="remove(item.id)"
                >
                  Remove
                </button>
              </div>
            }
          </div>
        </div>

        <section class="space-y-3 rounded border border-slate-200 p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-900">Store controls</p>
          <label class="space-y-2 block">
            <span>Storage type</span>
            <select
              class="w-full rounded border border-slate-300 px-3 py-2"
              [(ngModel)]="storageType"
              name="storageType"
            >
              <option value="local">local</option>
              <option value="session">session</option>
            </select>
          </label>
          <label class="space-y-2 block">
            <span>Expiry: {{ expiredMinutes }} minute(s)</span>
            <input
              class="w-full"
              type="range"
              min="1"
              max="30"
              step="1"
              [(ngModel)]="expiredMinutes"
              name="expiredMinutes"
            />
          </label>
          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
            type="button"
            (click)="applyConfig()"
          >
            Apply config
          </button>
          <button
            class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-700"
            type="button"
            (click)="reset()"
          >
            Reset store
          </button>

          <div class="space-y-2">
            <p>
              Total count:
              <span class="font-medium text-slate-950">{{ store.state().totalCount }}</span>
            </p>
            <p>
              Expired: <span class="font-medium text-slate-950">{{ store.isExpired() }}</span>
            </p>
            <pre class="overflow-auto rounded border border-slate-200 p-3 text-xs text-slate-700">{{
              store.state() | json
            }}</pre>
          </div>
        </section>
      </div>
    </article>
  `,
})
export class SignalStoreComponent {
  readonly store = inject(SignalStore) as SignalStore<TodoItem>;
  protected title = '';
  protected storageType: 'local' | 'session' = 'local';
  protected expiredMinutes = 10;

  private nextId = 1;

  constructor() {
    this.applyConfig();

    if (!this.store.state().data.length) {
      this.store.setData([
        { id: this.nextId++, title: 'Read local storage into the store', done: true },
        { id: this.nextId++, title: 'Toggle a todo item', done: false },
      ]);
    }

    this.nextId = Math.max(this.nextId, ...this.store.state().data.map((item) => item.id + 1));
  }

  add(event: SubmitEvent): void {
    event.preventDefault();
    const title = this.title.trim();
    if (!title) return;

    this.store.addNewData({
      id: this.nextId++,
      title,
      done: false,
    });
    this.title = '';
  }

  toggle(id: number): void {
    const item = this.store.getDataById(id);
    if (!item) return;
    this.store.updateDataById(id, { done: !item.done });
  }

  remove(id: number): void {
    this.store.deleteDataById(id);
  }

  applyConfig(): void {
    this.store.configure({
      expiredIn: this.expiredMinutes,
      storage: {
        storageSync: true,
        type: this.storageType,
        key: 'angular-demo.todos',
        loadFromStorage: true,
        syncDelay: { value: 300, unit: 'millisecond' },
      },
    });
  }

  reset(): void {
    this.store.reset();
  }
}
