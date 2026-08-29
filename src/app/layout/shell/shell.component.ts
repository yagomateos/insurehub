import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { UiStateService } from '../../core/services/ui-state.service';
import { ToastContainerComponent } from '../../shared/components/toast/toast-container.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen overflow-hidden bg-ink-50">
      <div class="hidden lg:block">
        <app-sidebar />
      </div>

      @if (ui.mobileDrawerOpen()) {
        <div class="fixed inset-0 z-40 lg:hidden">
          <div class="absolute inset-0 bg-ink-900/40" (click)="ui.closeMobileDrawer()"></div>
          <div class="absolute inset-y-0 left-0" (click)="ui.closeMobileDrawer()">
            <app-sidebar />
          </div>
        </div>
      }

      <div class="flex min-w-0 flex-1 flex-col">
        <app-header />
        <main class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <router-outlet />
        </main>
      </div>
    </div>

    <ui-toast-container />
  `,
})
export class ShellComponent {
  protected readonly ui = inject(UiStateService);
}
