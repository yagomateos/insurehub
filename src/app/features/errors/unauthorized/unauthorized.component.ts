import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center">
      <p class="text-sm font-semibold text-danger-600">Error 401</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-ink-900">No autorizado</h1>
      <p class="mt-2 max-w-sm text-sm text-ink-500">
        Tu sesión ha expirado o no tienes permisos para acceder a esta sección. Inicia sesión de nuevo para continuar.
      </p>
      <a routerLink="/login" class="mt-6">
        <ui-button variant="primary">Ir a inicio de sesión</ui-button>
      </a>
    </div>
  `,
})
export class UnauthorizedComponent {}
