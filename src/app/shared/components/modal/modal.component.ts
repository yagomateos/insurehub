import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink-900/40" (click)="dismissible() && close.emit()"></div>
        <div class="relative z-10 w-full rounded-xl bg-white shadow-[var(--shadow-popover)]" [class]="widthClass()">
          <div class="flex items-center justify-between px-6 pt-5">
            <h2 class="text-lg font-semibold text-ink-900">{{ title() }}</h2>
            <button
              class="focus-ring rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
              (click)="close.emit()"
              aria-label="Cerrar"
              type="button"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <div class="max-h-[70vh] overflow-y-auto px-6 py-5">
            <ng-content />
          </div>
          @if (hasFooter()) {
            <div class="flex items-center justify-end gap-2 px-6 pb-5">
              <ng-content select="[modal-footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly dismissible = input(true);
  readonly hasFooter = input(true);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly close = output<void>();

  protected widthClass(): string {
    return { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[this.size()];
  }
}
