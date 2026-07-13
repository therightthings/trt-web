import { Menu, MenuBar, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { DEMO_GROUPS } from './shared/contants/app-nav';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Menu,
    MenuBar,
    MenuContent,
    MenuItem,
    MenuTrigger,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  protected readonly groups = DEMO_GROUPS;

  protected navigateToGroup(groupPath: string, linkPath: string): void {
    void this.router.navigateByUrl(`${groupPath}/${linkPath}`);
  }
}
