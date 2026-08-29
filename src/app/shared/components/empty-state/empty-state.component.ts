import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-300 bg-ink-50/60 px-6 py-14 text-center">
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 13.5h6m-9 4.5h12a2 2 0 002-2V8.121a2 2 0 00-.586-1.414l-3.121-3.121A2 2 0 0014.879 3H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-ink-800">{{ title() }}</h3>
      <p class="mt-1 max-w-sm text-sm text-ink-500">{{ description() }}</p>
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('Sin resultados');
  readonly description = input('No se han encontrado registros que coincidan con tu búsqueda.');
}
