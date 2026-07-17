import { OverlayModule } from '@angular/cdk/overlay';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { TrtMenu, TrtMenuBar, TrtMenuContent, TrtMenuItem, TrtMenuTrigger } from '@trt-web/angular';

import {
  ApiPreference,
  ApiPreferencesComponent,
} from '../../../shared/components/api-preferences.component';
import { CodeSampleComponent } from '../../../shared/components/code-sample.component';
import { IconModule } from '../../../shared/icons/font-awesome.module';

@Component({
  selector: 'app-menubar',
  imports: [
    ApiPreferencesComponent,
    CodeSampleComponent,
    IconModule,
    OverlayModule,
    TrtMenu,
    TrtMenuBar,
    TrtMenuContent,
    TrtMenuItem,
    TrtMenuTrigger,
  ],
  templateUrl: './menubar.component.html',
})
export class MenubarComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly fileMenuRef = viewChild<TrtMenu<string>>('fileMenu');
  protected readonly editMenuRef = viewChild<TrtMenu<string>>('editMenu');
  protected readonly viewMenuRef = viewChild<TrtMenu<string>>('viewMenu');
  protected readonly shareMenuRef = viewChild<TrtMenu<string>>('shareMenu');

  protected readonly selectedMenu = signal('None');
  protected readonly selectedAction = signal('Choose a menu item');

  protected readonly summary = computed(() => {
    if (this.selectedMenu() === 'None') {
      return this.selectedAction();
    }

    return `${this.selectedMenu()} · ${this.selectedAction()}`;
  });

  protected readonly preferences: ApiPreference[] = [
    {
      name: 'disabled',
      description: 'Disables the entire menubar.',
      optional: true,
      default: false,
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
      name: 'wrap',
      description: 'Wraps keyboard navigation across the menubar.',
      optional: true,
      default: true,
      unit: 'boolean',
    },
    {
      name: 'trigger.menu',
      description: 'Menu instance opened by a trigger.',
      optional: false,
      default: 'required',
      unit: 'Menu<T>',
    },
    {
      name: 'item.value',
      description: 'Value emitted when a menu item is selected.',
      optional: false,
      default: 'required',
      unit: 'string',
    },
    {
      name: 'item.disabled',
      description: 'Disables a menu item.',
      optional: true,
      default: false,
      unit: 'boolean',
    },
    {
      name: 'menu.expansionDelay',
      description: 'Delay before a hovered submenu opens.',
      optional: true,
      default: 200,
      unit: 'number',
    },
  ];

  protected readonly codeExample = [
    {
      fileExt: 'html',
      code: `<section>
  <header class="space-y-2">
    <div class="badge badge-outline badge-sm">trt-menu-bar</div>
    <h3 class="card-title text-lg">Menubar built on Angular Aria</h3>
    <p class="text-sm leading-6 text-base-content/70">
      This demo keeps the top-level menu strip persistent so you can test left and right arrow
      navigation plus submenu opening behavior.
    </p>
  </header>

  <div trtMenuBar tabindex="0" (keydown)="onMenubarKeydown($event)">
    <button
      trtMenuTrigger
      #fileTrigger="trtMenuTrigger"
      #fileOrigin
      [menu]="fileMenuRef()?.menu"
      type="button"
    >
      File
    </button>
    <button
      trtMenuTrigger
      #editTrigger="trtMenuTrigger"
      #editOrigin
      [menu]="editMenuRef()?.menu"
      type="button"
    >
      Edit
    </button>
    <button
      trtMenuTrigger
      #viewTrigger="trtMenuTrigger"
      #viewOrigin
      [menu]="viewMenuRef()?.menu"
      type="button"
    >
      View
    </button>
  </div>

  <ng-template
    [cdkConnectedOverlay]="{ origin: fileOrigin, usePopover: 'inline' }"
    [cdkConnectedOverlayOpen]="fileTrigger.expanded()"
  >
    <div trtMenu #fileMenu="trtMenu" (itemSelected)="selectAction('File', $event)">
      <ng-template trtMenuContent>
        <button trtMenuItem value="New">New</button>
        <button trtMenuItem value="Open">Open</button>
        <button trtMenuItem value="Save">Save</button>
        <button trtMenuItem value="Share" [submenu]="shareMenuRef()?.menu">
          <span>Share</span>
          <fa-icon icon="chevron-right" size="xs"></fa-icon>
        </button>

        <div trtMenu #shareMenu="trtMenu" (itemSelected)="selectAction('File / Share', $event)">
          <ng-template trtMenuContent>
            <button trtMenuItem value="Copy link">Copy link</button>
            <button trtMenuItem value="Email">Email</button>
            <button trtMenuItem value="Slack">Slack</button>
          </ng-template>
        </div>
      </ng-template>
    </div>
  </ng-template>

  <ng-template
    [cdkConnectedOverlay]="{ origin: editOrigin, usePopover: 'inline' }"
    [cdkConnectedOverlayOpen]="editTrigger.expanded()"
  >
    <div trtMenu #editMenu="trtMenu" (itemSelected)="selectAction('Edit', $event)">
      <ng-template trtMenuContent>
        <button trtMenuItem value="Undo">Undo</button>
        <button trtMenuItem value="Redo">Redo</button>
        <button trtMenuItem value="Cut">Cut</button>
        <button trtMenuItem value="Copy">Copy</button>
        <button trtMenuItem value="Paste">Paste</button>
      </ng-template>
    </div>
  </ng-template>

  <ng-template
    [cdkConnectedOverlay]="{ origin: viewOrigin, usePopover: 'inline' }"
    [cdkConnectedOverlayOpen]="viewTrigger.expanded()"
  >
    <div trtMenu #viewMenu="trtMenu" (itemSelected)="selectAction('View', $event)">
      <ng-template trtMenuContent>
        <button trtMenuItem value="Zoom in">Zoom in</button>
        <button trtMenuItem value="Zoom out">Zoom out</button>
        <button trtMenuItem value="Reset zoom">Reset zoom</button>
        <button trtMenuItem value="Full screen">Full screen</button>
      </ng-template>
    </div>
  </ng-template>

  <p>Last action: {{ summary() }}</p>
</section>`,
    },
  ];

  protected selectAction(menu: string, action: string): void {
    this.selectedMenu.set(menu);
    this.selectedAction.set(action);
  }

  protected onMenubarKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    const triggers = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('[trtMenuBar] > [trtMenuTrigger]'),
    );
    const currentIndex = triggers.findIndex((trigger) => trigger === event.target);

    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();

    const direction = getComputedStyle(this.host.nativeElement).direction;
    const nextIndex =
      event.key === 'ArrowRight'
        ? direction === 'rtl'
          ? currentIndex - 1
          : currentIndex + 1
        : direction === 'rtl'
          ? currentIndex + 1
          : currentIndex - 1;

    const wrappedIndex = (nextIndex + triggers.length) % triggers.length;
    triggers[wrappedIndex]?.focus();
  }
}
