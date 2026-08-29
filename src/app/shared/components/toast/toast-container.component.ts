import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastVariant } from '../../../core/services/toast.service';

const VARIANT_STYLES: Record<ToastVariant, { icon: string; classes: string }> = {
  success: { icon: 'M4.5 12.75l6 6 9-13.5', classes: 'border-success-200 bg-success-50 text-success-700' },
  error: { icon: 'M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z', classes: 'border-danger-200 bg-danger-50 text-danger-700' },
  warning: { icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z', classes: 'border-warning-200 bg-warning-50 text-warning-700' },
  info: { icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z', classes: 'border-info-200 bg-info-50 text-info-600' },
};

@Component({
  selector: 'ui-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-[var(--shadow-popover)]" [class]="styleFor(toast.variant).classes">
          <svg class="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="styleFor(toast.variant).icon" />
          </svg>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold">{{ toast.title }}</p>
            @if (toast.description) {
              <p class="mt-0.5 text-xs opacity-90">{{ toast.description }}</p>
            }
          </div>
          <button type="button" class="focus-ring shrink-0 rounded p-0.5 opacity-60 hover:opacity-100" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar notificación">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected styleFor(variant: ToastVariant) {
    return VARIANT_STYLES[variant];
  }
}
