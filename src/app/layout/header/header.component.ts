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
          <div class="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-ink-200 bg-white py-1.5 shadow-[var(--shadow-popover)]">
            <div class="px-3.5 py-2">
              <p class="text-sm font-semibold text-ink-900">{{ auth.currentUser()?.name }}</p>
              <p class="text-sm text-ink-500">{{ auth.currentUser()?.email }}</p>
            </div>
            <div class="my-1 border-t border-ink-200"></div>
            <a routerLink="/profile" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-50" (click)="menuOpen.set(false)">
              <svg class="h-4 w-4 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Mi perfil
            </a>
            <a routerLink="/settings" class="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-50" (click)="menuOpen.set(false)">
              <svg class="h-4 w-4 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </a>
            <div class="my-1 border-t border-ink-200"></div>
            <button type="button" class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-danger-600 hover:bg-danger-50" (click)="auth.logout()">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Cerrar sesión
            </button>
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
