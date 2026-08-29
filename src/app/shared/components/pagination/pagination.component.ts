import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-between gap-3 border-t border-ink-200 px-4 py-3 sm:flex-row">
      <p class="text-xs text-ink-500">
        Mostrando <span class="font-medium text-ink-700">{{ rangeStart() }}–{{ rangeEnd() }}</span>
        de <span class="font-medium text-ink-700">{{ total() }}</span> resultados
      </p>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="focus-ring rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-600 ring-1 ring-inset ring-ink-300 hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-white"
          [disabled]="page() === 1"
          (click)="pageChange.emit(page() - 1)"
        >
          Anterior
        </button>
        @for (p of pageNumbers(); track p) {
          @if (p === -1) {
            <span class="px-2 text-xs text-ink-400">…</span>
          } @else {
            <button
              type="button"
              class="focus-ring h-7 w-7 rounded-md text-xs font-medium"
              [class]="p === page() ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-100'"
              (click)="pageChange.emit(p)"
            >
              {{ p }}
            </button>
          }
        }
        <button
          type="button"
          class="focus-ring rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-600 ring-1 ring-inset ring-ink-300 hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-white"
          [disabled]="page() === totalPages()"
          (click)="pageChange.emit(page() + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  protected readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  protected readonly pageNumbers = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

    const result: number[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev && p - prev > 1) result.push(-1);
      result.push(p);
      prev = p;
    }
    return result;
  });
}
