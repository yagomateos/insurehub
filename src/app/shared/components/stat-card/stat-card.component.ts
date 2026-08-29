import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatCardIconTone = 'brand' | 'warning';
export type StatCardSentiment = 'positive' | 'negative';

const ICON_TONE_CLASSES: Record<StatCardIconTone, string> = {
  brand: 'bg-brand-100 text-brand-600',
  warning: 'bg-warning-50 text-warning-600',
};

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl border border-ink-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div class="flex items-start justify-between">
        <p class="text-sm font-medium text-ink-500">{{ label() }}</p>
        <div class="flex h-10 w-10 items-center justify-center rounded-xl" [class]="iconToneClasses()">
          <ng-content select="[stat-icon]" />
        </div>
      </div>
      <p class="mt-3 text-2xl font-semibold tracking-tight text-ink-900">{{ value() }}</p>
      <div class="mt-2 flex items-center gap-1.5">
        <span
          class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium"
          [class]="sentiment() === 'positive' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'"
        >
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            @if (direction() === 'up') {
              <path d="M15.22 6.268a.75.75 0 01.968-.432l5.942 2.28a.75.75 0 01.431.97l-2.28 5.941a.75.75 0 11-1.4-.537l1.63-4.251-1.086.483a11.2 11.2 0 00-5.45 5.174.75.75 0 01-1.199.19L9 12.31l-6.22 6.22a.75.75 0 11-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l3.606 3.605a12.694 12.694 0 015.68-4.973l1.086-.484-4.251-1.631a.75.75 0 01-.432-.97z" />
            } @else {
              <path d="M1.72 5.47a.75.75 0 011.06 0L9 11.69l3.756-3.756a.75.75 0 01.985-.066 12.698 12.698 0 014.575 6.832l.308 1.149 2.277-3.943a.75.75 0 111.299.75l-3.182 5.51a.75.75 0 01-1.025.275l-5.511-3.181a.75.75 0 01.75-1.3l3.943 2.277-.308-1.149a11.194 11.194 0 00-3.528-5.617l-3.809 3.81a.75.75 0 01-1.06 0L1.72 6.53a.75.75 0 010-1.06z" />
            }
          </svg>
          {{ deltaLabel() }}
        </span>
        <span class="text-xs text-ink-400">vs. mes anterior</span>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly deltaPct = input.required<number>();
  readonly direction = input.required<'up' | 'down'>();
  readonly sentiment = input<StatCardSentiment>('positive');
  readonly iconTone = input<StatCardIconTone>('brand');

  protected readonly deltaLabel = computed(() => `${this.deltaPct() > 0 ? '+' : ''}${this.deltaPct()}%`);
  protected readonly iconToneClasses = computed(() => ICON_TONE_CLASSES[this.iconTone()]);
}
