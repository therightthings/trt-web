import { DOCUMENT } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LocalStorage } from '@trt-web/core';

type Theme = 'light' | 'dark';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly themeStorageKey = 'trt-web-demo-theme';

  protected readonly theme = signal<Theme>(this.getInitialTheme());
  protected readonly themeIcon = computed(() => (this.theme() === 'light' ? 'moon' : 'sun'));
  protected readonly themeAriaLabel = computed(
    () => `Switch to ${this.theme() === 'light' ? 'dark' : 'light'} theme`,
  );

  protected readonly groups = signal([
    {
      label: 'Components',
      path: '/components',
      links: [
        { label: 'Autocomplete', path: 'autocomplete' },
        { label: 'Accordion', path: 'accordion' },
        { label: 'Combobox', path: 'combobox' },
        { label: 'Listbox', path: 'listbox' },
      ],
    },
    {
      label: 'Directives',
      path: '/directives',
      links: [
        { label: 'Auto focus', path: 'auto-focus' },
        { label: 'Action lock', path: 'action-lock' },
        { label: 'Free dragging', path: 'free-dragging' },
        { label: 'Prevent whitespace', path: 'prevent-whitespace' },
        { label: 'Typed template', path: 'typed-template' },
        { label: 'Hook tracking', path: 'hook-tracking' },
      ],
    },
    {
      label: 'Operators',
      path: '/operators',
      links: [
        { label: 'Auto refresh', path: 'auto-refresh' },
        { label: 'Request state', path: 'to-request-state' },
        { label: 'Inject destroy', path: 'inject-destroy' },
      ],
    },
    {
      label: 'Forms',
      path: '/forms',
      links: [
        { label: 'Field has errors', path: 'field-has-errors' },
        { label: 'Field has error type', path: 'field-has-error-type' },
        { label: 'Log form errors', path: 'log-form-errors' },
        { label: 'VN phone validator', path: 'vn-phone-number-validator' },
      ],
    },
    {
      label: 'Data & UI',
      path: '/data',
      links: [
        { label: 'HTTP cache', path: 'http-cache' },
        { label: 'Signal store', path: 'signal-store' },
        { label: 'Safe pipe', path: 'safe-pipe' },
      ],
    },
  ]);
  protected readonly openGroupPath = signal<string | null>(null);

  constructor() {
    effect(() => {
      const theme = this.theme();
      const root = this.document.documentElement;
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;

      LocalStorage.set(this.themeStorageKey, theme);
    });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Node)) {
      this.openGroupPath.set(null);
      return;
    }

    const dropdowns = this.host.nativeElement.querySelectorAll('.dropdown');
    const isInsideDropdown = Array.from(dropdowns).some((element) => element.contains(target));

    if (!isInsideDropdown) {
      this.openGroupPath.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.openGroupPath.set(null);
  }

  protected toggleGroup(groupPath: string): void {
    this.openGroupPath.set(this.openGroupPath() === groupPath ? null : groupPath);
  }

  protected navigateToGroup(groupPath: string, linkPath: string): void {
    this.openGroupPath.set(null);
    void this.router.navigateByUrl(`${groupPath}/${linkPath}`);
  }

  protected toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  private getInitialTheme(): Theme {
    const stored = LocalStorage.get<Theme>(this.themeStorageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
