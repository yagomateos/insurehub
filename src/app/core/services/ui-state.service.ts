import { Injectable, signal } from '@angular/core';

/**
 * Pure UI/interface state — nothing here originates from the server, so it lives
 * in signals rather than RxJS streams (reserved for async/server data).
 */
@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly sidebarCollapsed = signal(false);
  readonly mobileDrawerOpen = signal(false);
  readonly globalLoading = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  openMobileDrawer(): void {
    this.mobileDrawerOpen.set(true);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }
}
