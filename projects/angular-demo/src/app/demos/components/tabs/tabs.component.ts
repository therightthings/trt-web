import { Component, computed, signal } from '@angular/core';
import { TrtTab, TrtTabContent, TrtTabList, TrtTabPanel, TrtTabs } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';

const TAB_LABELS = {
  overview: 'Overview',
  cast: 'Cast',
  reviews: 'Reviews',
  extras: 'Extras',
} as const;

type TabKey = keyof typeof TAB_LABELS;

@Component({
  selector: 'app-tabs',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    TrtTab,
    TrtTabContent,
    TrtTabList,
    TrtTabPanel,
    TrtTabs,
  ],
  templateUrl: './tabs.component.html',
})
export class TabsComponent {
  protected readonly selectedTab = signal<TabKey>('overview');

  protected readonly selectedLabel = computed(() => TAB_LABELS[this.selectedTab()] ?? 'Overview');

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'selectedTab',
      description: 'The currently selected tab value.',
      optional: true,
      default: 'overview',
      unit: 'string',
    },
    {
      name: 'orientation',
      description: 'Controls whether tabs flow horizontally or vertically.',
      optional: true,
      default: 'horizontal',
      unit: 'horizontal | vertical',
    },
    {
      name: 'selectionMode',
      description: 'Controls whether focus follows selection or selection is explicit.',
      optional: true,
      default: 'follow',
      unit: 'follow | explicit',
    },
    {
      name: 'focusMode',
      description: 'Controls whether focus moves with roving tabindex or activedescendant.',
      optional: true,
      default: 'roving',
      unit: 'roving | activedescendant',
    },
    {
      name: 'wrap',
      description: 'Wraps keyboard navigation from the last tab back to the first.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'softDisabled',
      description: 'Keeps disabled tabs focusable while preventing activation.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'tab.value',
      description: 'The unique value that connects a tab to its panel.',
      optional: false,
      default: 'required',
      unit: 'string',
    },
    {
      name: 'tab.disabled',
      description: 'Disables a tab while keeping the rest of the list interactive.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'panel.value',
      description: 'The tab value associated with the panel.',
      optional: false,
      default: 'required',
      unit: 'string',
    },
    {
      name: 'panel.preserveContent',
      description: 'Keeps panel content in the DOM after it is hidden.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<section>
  <header class="space-y-2">
    <div class="badge badge-outline badge-sm">trt-tabs</div>
    <h3 class="card-title text-lg">Tabs built on Angular Aria</h3>
    <p class="text-sm leading-6 text-base-content/70">
      This demo shows the base tabs wrapper with lazy panel content, keyboard-friendly navigation,
      and one disabled tab so you can see the full interaction model.
    </p>
  </header>

  <div trtTabs>
    <div trtTabList [(selectedTab)]="selectedTab" selectionMode="follow">
      <button type="button" trtTab value="overview">Overview</button>
      <button type="button" trtTab value="cast">Cast</button>
      <button type="button" trtTab value="reviews">Reviews</button>
      <button type="button" trtTab value="extras" [disabled]="true">Extras</button>
    </div>

    <div trtTabPanel [preserveContent]="true" value="overview">
      <ng-template trtTabContent>
        <p>Lazy content for the overview tab.</p>
      </ng-template>
    </div>

    <div trtTabPanel [preserveContent]="true" value="cast">
      <ng-template trtTabContent>
        <p>Lazy content for the cast tab.</p>
      </ng-template>
    </div>

    <div trtTabPanel [preserveContent]="true" value="reviews">
      <ng-template trtTabContent>
        <p>Lazy content for the reviews tab.</p>
      </ng-template>
    </div>

    <div trtTabPanel [preserveContent]="true" value="extras">
      <ng-template trtTabContent>
        <p>Disabled tabs can still have associated panels.</p>
      </ng-template>
    </div>
  </div>
</section>`,
    },
  ];
}
