import { Component, computed, DOCUMENT, effect, inject, OnDestroy, signal } from '@angular/core';
import { LocalStorage } from '@trt-web/core';

import { STORAGE_KEY } from '../constants/storage-key';
import { IconModule } from '../icons/font-awesome.module';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <button class="btn btn-ghost btn-square rounded-full" type="button" (click)="toggleTheme()">
      <fa-icon [icon]="themeIcon()"></fa-icon>
    </button>
  `,
  imports: [IconModule],
})
export class ThemeSwitcherComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  protected readonly theme = signal<Theme>(this.getInitialTheme());
  protected readonly themeIcon = computed(() => {
    return this.theme() === 'light' ? 'moon' : 'sun';
  });
  private readonly changeThemeEffect = effect(() => {
    const theme = this.theme();
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    LocalStorage.set(STORAGE_KEY.THEME, theme);
  });

  ngOnDestroy() {
    this.changeThemeEffect.destroy();
  }

  protected toggleTheme() {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  private getInitialTheme() {
    const stored = LocalStorage.get<Theme>(STORAGE_KEY.THEME);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
