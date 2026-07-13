import { Component, ElementRef,HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { DEMO_GROUPS } from './shared/contants/app-nav';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  protected readonly groups = DEMO_GROUPS;
  protected openGroupPath: string | null = null;

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Node)) {
      this.openGroupPath = null;
      return;
    }

    const dropdowns = this.host.nativeElement.querySelectorAll('.dropdown');
    const isInsideDropdown = Array.from(dropdowns).some((element) => element.contains(target));

    if (!isInsideDropdown) {
      this.openGroupPath = null;
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.openGroupPath = null;
  }

  protected toggleGroup(groupPath: string): void {
    this.openGroupPath = this.openGroupPath === groupPath ? null : groupPath;
  }

  protected navigateToGroup(groupPath: string, linkPath: string): void {
    this.openGroupPath = null;
    void this.router.navigateByUrl(`${groupPath}/${linkPath}`);
  }
}
