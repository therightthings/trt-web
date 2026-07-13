import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SignalStore } from '@trt-web/angular';

import { ApiPreferencesComponent } from '../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../shared/components/code-sample.component';

type TodoItem = {
  id: number;
  title: string;
  done: boolean;
};

@Component({
  selector: 'app-signal-store',
  imports: [ApiPreferencesComponent, JsonPipe, CodeSampleComponent],
  template: `
    <article class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body gap-6">
        <header class="space-y-2">
          <div class="badge badge-outline badge-sm">SignalStore</div>
          <h3 class="card-title text-lg">Persist a small todo list with signals</h3>
          <p class="text-sm leading-6 text-base-content/70">
            The store handles list CRUD, expiry, and local/session storage sync.
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <div class="space-y-3">
            <form class="flex flex-wrap gap-2" (submit)="add($event)">
              <input
                class="input input-bordered min-w-0 flex-1 text-sm"
                [value]="title()"
                (input)="title.set($any($event.target).value)"
                placeholder="Add a todo item"
              />
              <button class="btn btn-primary btn-sm" type="submit">Add</button>
            </form>

            <div class="space-y-2">
              @for (item of store.state().data; track item.id) {
                <div class="card card-compact bg-base-200 border border-base-300 shadow-sm">
                  <div class="card-body flex-row items-center justify-between gap-3 py-3">
                    <button class="text-left" type="button" (click)="toggle(item.id)">
                      <span class="font-medium text-base-content">{{ item.title }}</span>
                      <span class="badge badge-outline badge-sm ml-2">
                        {{ item.done ? 'done' : 'open' }}
                      </span>
                    </button>
                    <button class="btn btn-outline btn-xs" type="button" (click)="remove(item.id)">
                      Remove
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <section class="card card-compact bg-base-200 border border-base-300 shadow-sm">
            <div class="card-body gap-3 text-sm text-base-content/70">
              <p class="font-medium text-base-content">Store controls</p>
              <label class="form-control gap-2">
                <span>Storage type</span>
                <select
                  class="select select-bordered w-full"
                  [value]="storageType()"
                  (change)="storageType.set($any($event.target).value)"
                >
                  <option value="local">local</option>
                  <option value="session">session</option>
                </select>
              </label>
              <label class="form-control gap-2">
                <span>Expiry: {{ expiredMinutes() }} minute(s)</span>
                <input
                  class="range range-primary"
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  [value]="expiredMinutes()"
                  (input)="expiredMinutes.set($any($event.target).valueAsNumber)"
                />
              </label>
              <button class="btn btn-outline btn-sm" type="button" (click)="applyConfig()">
                Apply config
              </button>
              <button class="btn btn-outline btn-sm" type="button" (click)="reset()">
                Reset store
              </button>

              <div class="space-y-2">
                <p>
                  Total count:
                  <span class="font-medium text-base-content">{{ store.state().totalCount }}</span>
                </p>
                <p>
                  Expired:
                  <span class="font-medium text-base-content">{{ store.isExpired() }}</span>
                </p>
                <pre
                  class="overflow-auto rounded-box border border-base-300 bg-base-100 p-3 text-xs text-base-content"
                  >{{ store.state() | json }}</pre
                >
              </div>
            </div>
          </section>
        </div>

        <app-code-sample title="Code example" badge="Basic usage" [code]="codeExample" />

        <app-api-preferences [preferences]="preferences" />
      </div>
    </article>
  `,
})
export class SignalStoreComponent {
  readonly store = inject(SignalStore) as SignalStore<TodoItem>;
  protected readonly preferences = [
    {
      name: 'storage.type',
      description: 'Chooses whether persistence uses local storage or session storage.',
      optional: true,
      default: 'local',
      unit: 'storage',
    },
    {
      name: 'expiredIn',
      description: 'How long the cached store state remains valid before refresh.',
      optional: true,
      default: 10,
      unit: 'minute',
    },
  ];
  protected readonly codeExample = [
    {
      fileExt: 'ts',
      code: `import { SignalStore } from '@trt-web/angular';

const store = inject(SignalStore);

store.configure({
  storage: {
    storageSync: true,
    type: 'local',
    key: 'angular-demo.todos',
  },
});

store.addNewData({ id: 1, title: 'Learn SignalStore', done: false });`,
    },
  ];
  protected title = signal('');
  protected storageType = signal<'local' | 'session'>('local');
  protected expiredMinutes = signal(10);

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
    const title = this.title().trim();
    if (!title) return;

    this.store.addNewData({
      id: this.nextId++,
      title,
      done: false,
    });
    this.title.set('');
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
      expiredIn: this.expiredMinutes(),
      storage: {
        storageSync: true,
        type: this.storageType(),
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
