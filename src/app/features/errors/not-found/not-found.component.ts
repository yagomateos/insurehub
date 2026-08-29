import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-6 text-center">
      <p class="text-sm font-semibold text-brand-600">Error 404</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Página no encontrada</h1>
      <p class="mt-2 max-w-sm text-sm text-ink-500">
        La página que buscas no existe o ha sido movida a otra ubicación.
      </p>
      <a routerLink="/dashboard" class="mt-6">
        <ui-button variant="primary">Volver al Dashboard</ui-button>
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
