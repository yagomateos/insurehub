import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';

interface RouteMeta {
  title: string;
  breadcrumb: BreadcrumbItem[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AvatarComponent, BreadcrumbComponent, ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex h-16 shrink-0 items-center gap-4 border-b border-ink-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        class="focus-ring flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 lg:hidden"
        (click)="ui.openMobileDrawer()"
        aria-label="Abrir menú"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      <div class="min-w-0 flex-1">
        <ui-breadcrumb [items]="meta().breadcrumb" />
        <h1 class="truncate text-lg font-semibold text-ink-900">{{ meta().title }}</h1>
      </div>

      <div class="relative hidden max-w-sm flex-1 md:block">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
        <input
          type="search"
          placeholder="Buscar clientes, pólizas, siniestros…"
          class="field-input pl-9"
        />
      </div>

      <button type="button" class="focus-ring relative flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100" aria-label="Notificaciones">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span class="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-danger-500"></span>
      </button>

      <div class="relative" uiClickOutside (uiClickOutside)="menuOpen.set(false)">
        <button type="button" class="focus-ring flex items-center gap-2.5 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-ink-100" (click)="menuOpen.set(!menuOpen())">
          <ui-avatar [name]="auth.currentUser()?.name ?? ''" size="sm" />
          <span class="hidden text-left sm:block">
            <span class="block text-sm font-medium leading-tight text-ink-800">{{ auth.currentUser()?.name }}</span>
            <span class="block text-xs leading-tight text-ink-500">{{ auth.currentUser()?.role }}</span>
          </span>
          <svg class="hidden h-4 w-4 text-ink-400 sm:block" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </button>

        @if (menuOpen()) {
          <div class="absolute right-0 z-20 mt-1 w-52 rounded-md border border-ink-200 bg-white py-1 shadow-[var(--shadow-popover)]">
            <a routerLink="/profile" class="block px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-50" (click)="menuOpen.set(false)">Mi perfil</a>
            <a routerLink="/settings" class="block px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-50" (click)="menuOpen.set(false)">Configuración</a>
            <div class="my-1 border-t border-ink-200"></div>
            <button type="button" class="block w-full px-3.5 py-2 text-left text-sm text-danger-600 hover:bg-danger-50" (click)="auth.logout()">Cerrar sesión</button>
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly ui = inject(UiStateService);
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);

  private readonly router = inject(Router);

  private readonly meta$ = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    startWith(null),
    map((): RouteMeta => {
      let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
      let title = 'InsureHub';
      let breadcrumb: BreadcrumbItem[] = [];
      while (route) {
        const data = route.data as Partial<RouteMeta>;
        if (data.title) title = data.title;
        if (data.breadcrumb) breadcrumb = data.breadcrumb;
        route = route.firstChild;
      }
      return { title, breadcrumb };
    }),
  );

  protected readonly meta = toSignal(this.meta$, { initialValue: { title: 'InsureHub', breadcrumb: [] } });
}
