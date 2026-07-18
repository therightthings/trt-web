import { OverlayModule } from '@angular/cdk/overlay';
import { Component, computed, signal, viewChild } from '@angular/core';
import { TrtMenu, TrtMenuContent, TrtMenuItem, TrtMenuTrigger } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';

@Component({
  selector: 'app-menu',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    OverlayModule,
    TrtMenu,
    TrtMenuContent,
    TrtMenuItem,
    TrtMenuTrigger,
  ],
  templateUrl: './menu.component.html',
})
export class MenuComponent {
  protected readonly actionsMenuRef = viewChild<TrtMenu<string>>('actionsMenu');
  protected readonly shareMenuRef = viewChild<TrtMenu<string>>('shareMenu');

  protected readonly selectedAction = signal('None');
  protected readonly submenuAction = signal('None');

  protected readonly summary = computed(() => {
    const current = this.selectedAction();
    const sub = this.submenuAction();

    if (sub !== 'None') {
      return `${current} · ${sub}`;
    }

    return current;
  });

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'disabled',
      description: 'Disables the entire menu.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'wrap',
      description: 'Wraps keyboard navigation at the menu edges.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'softDisabled',
      description: 'Keeps disabled items focusable while preventing activation.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'expansionDelay',
      description: 'Delay in milliseconds before submenu hover expands.',
      optional: true,
      default: 200,
      unit: 'number',
    },
    {
      name: 'trigger.menu',
      description: 'Menu instance opened by the trigger button.',
      optional: false,
      default: 'required',
      unit: 'Menu<T>',
    },
    {
      name: 'item.value',
      description: 'The value emitted when an item is selected.',
      optional: false,
      default: 'required',
      unit: 'string',
    },
    {
      name: 'item.role',
      description: 'The ARIA role for a menu item.',
      optional: true,
      default: 'menuitem',
      unit: 'menuitem | menuitemradio | menuitemcheckbox',
    },
    {
      name: 'item.disabled',
      description: 'Disables a menu item.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'item.submenu',
      description: 'Associates an item with a submenu.',
      optional: true,
      default: undefined,
      unit: 'Menu<T> | undefined',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<section>
  <header class="space-y-2">
    <div class="badge badge-outline badge-sm">trt-menu</div>
    <h3 class="card-title text-lg">Menu built on Angular Aria</h3>
    <p class="text-sm leading-6 text-base-content/70">
      This demo shows a standalone dropdown menu with a nested submenu, using only the library
      base styles so the interaction model stays easy to see.
    </p>
  </header>

  <div>
    <button
      trtMenuTrigger
      #trigger="trtMenuTrigger"
      #origin
      [menu]="actionsMenuRef()?.menu"
      type="button"
    >
      Actions
    </button>

    <ng-template
      [cdkConnectedOverlay]="{ origin, usePopover: 'inline' }"
      [cdkConnectedOverlayOpen]="trigger.expanded()"
    >
      <div trtMenu #actionsMenu="trtMenu" (itemSelected)="selectedAction.set($event)">
        <ng-template trtMenuContent>
          <button trtMenuItem value="Open">Open</button>
          <button trtMenuItem value="Rename">Rename</button>
          <button trtMenuItem value="Duplicate">Duplicate</button>
          <button trtMenuItem value="Delete" [disabled]="true">Delete</button>
          <button trtMenuItem value="Share" [submenu]="shareMenuRef()?.menu">
            <span>Share</span>
            <span aria-hidden="true">›</span>
          </button>

          <div trtMenu #shareMenu="trtMenu" (itemSelected)="submenuAction.set($event)">
            <ng-template trtMenuContent>
              <button trtMenuItem value="Copy link">Copy link</button>
              <button trtMenuItem value="Email">Email</button>
              <button trtMenuItem value="Slack">Slack</button>
            </ng-template>
          </div>
        </ng-template>
      </div>
    </ng-template>
  </div>
</section>`,
    },
  ];
}
