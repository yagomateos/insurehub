import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiStateService } from '../../core/services/ui-state.service';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  link: string;
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'M3 13.5h4.5v6.75H3V13.5zm6.75-9h4.5v15.75h-4.5V4.5zm6.75 4.5H21v11.25h-4.5V9z', link: '/dashboard' },
  { label: 'Clientes', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.649M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z', link: '/customers' },
  { label: 'Pólizas', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', link: '/policies' },
  { label: 'Siniestros', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', link: '/claims' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="flex h-full flex-col bg-sidebar-bg transition-[width] duration-200"
      [class]="ui.sidebarCollapsed() ? 'w-[76px]' : 'w-64'"
    >
      <div class="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/40">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3.75l6.75 2.813v4.687c0 4.42-2.87 8.223-6.75 9.5-3.88-1.277-6.75-5.08-6.75-9.5V6.563L12 3.75z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 12.25l1.75 1.75 3-3.25" />
          </svg>
        </div>
        @if (!ui.sidebarCollapsed()) {
          <span class="flex-1 text-lg font-bold tracking-tight text-white">InsureHub</span>
          <button
            type="button"
            class="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-sidebar-text hover:bg-sidebar-hover hover:text-white"
            (click)="ui.toggleSidebar()"
            aria-label="Contraer menú"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>
        }
      </div>

      @if (ui.sidebarCollapsed()) {
        <button
          type="button"
          class="focus-ring mx-auto mt-3 flex h-7 w-7 items-center justify-center rounded-md text-sidebar-text hover:bg-sidebar-hover hover:text-white"
          (click)="ui.toggleSidebar()"
          aria-label="Expandir menú"
        >
          <svg class="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
        </button>
      }

      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        @if (!ui.sidebarCollapsed()) {
          <p class="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-section">Principal</p>
        }
        @for (item of mainNav; track item.link) {
          <a
            [routerLink]="item.link"
            routerLinkActive="bg-brand-600 text-white shadow-md shadow-brand-900/30 hover:bg-brand-600"
            [routerLinkActiveOptions]="{ exact: false }"
            class="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-white"
            [class.justify-center]="ui.sidebarCollapsed()"
            [title]="ui.sidebarCollapsed() ? item.label : ''"
          >
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon" />
            </svg>
            @if (!ui.sidebarCollapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <div class="space-y-1 border-t border-sidebar-border px-3 py-4">
        <a
          routerLink="/settings"
          class="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-white"
          [class.justify-center]="ui.sidebarCollapsed()"
          [title]="ui.sidebarCollapsed() ? 'Configuración' : ''"
        >
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          @if (!ui.sidebarCollapsed()) {
            <span>Configuración</span>
          }
        </a>
        <a
          routerLink="/profile"
          class="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-white"
          [class.justify-center]="ui.sidebarCollapsed()"
          [title]="ui.sidebarCollapsed() ? 'Mi perfil' : ''"
        >
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          @if (!ui.sidebarCollapsed()) {
            <span>Mi perfil</span>
          }
        </a>
        <button
          type="button"
          (click)="auth.logout()"
          class="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-500 hover:bg-danger-500/10"
          [class.justify-center]="ui.sidebarCollapsed()"
          [title]="ui.sidebarCollapsed() ? 'Cerrar sesión' : ''"
        >
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          @if (!ui.sidebarCollapsed()) {
            <span>Cerrar sesión</span>
          }
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  protected readonly ui = inject(UiStateService);
  protected readonly auth = inject(AuthService);
  protected readonly mainNav = MAIN_NAV;
}
