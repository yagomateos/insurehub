import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
  success: 'bg-success-50 text-success-700 ring-1 ring-inset ring-success-500/20',
  warning: 'bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-500/20',
  info: 'bg-info-50 text-info-600 ring-1 ring-inset ring-info-500/20',
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-400',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
};

@Component({
  selector: 'ui-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" [class]="toneClasses()">
      @if (dot()) {
        <span class="h-1.5 w-1.5 rounded-full" [class]="dotClasses()"></span>
      }
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  readonly dot = input(true);

  protected readonly toneClasses = computed(() => TONE_CLASSES[this.tone()]);
  protected readonly dotClasses = computed(() => DOT_CLASSES[this.tone()]);
}
