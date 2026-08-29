import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'ui-error-state',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center rounded-lg border border-danger-200 bg-danger-50/60 px-6 py-14 text-center">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-600">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-ink-800">{{ title() }}</h3>
      <p class="mt-1 max-w-sm text-sm text-ink-500">{{ description() }}</p>
      @if (showRetry()) {
        <div class="mt-4">
          <ui-button variant="secondary" size="sm" (click)="retry.emit()">Reintentar</ui-button>
        </div>
      }
    </div>
  `,
})
export class ErrorStateComponent {
  readonly title = input('No se ha podido cargar la información');
  readonly description = input('Se ha producido un error al comunicar con el servidor. Inténtalo de nuevo.');
  readonly showRetry = input(true);
  readonly retry = output<void>();
}
