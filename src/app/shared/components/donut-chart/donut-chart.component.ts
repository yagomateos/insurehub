import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

const SIZE = 176;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'ui-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
      <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" [style.width.px]="size" [style.height.px]="size" role="img" aria-label="Distribución de pólizas por tipo">
        <g [attr.transform]="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'">
          <circle [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius" fill="none" stroke="var(--color-ink-100)" [attr.stroke-width]="stroke" />
          @for (seg of segments(); track seg.label) {
            <circle
              [attr.cx]="size / 2"
              [attr.cy]="size / 2"
              [attr.r]="radius"
              fill="none"
              [attr.stroke]="seg.color"
              [attr.stroke-width]="stroke"
              [attr.stroke-dasharray]="seg.dash + ' ' + circumference"
              [attr.stroke-dashoffset]="-seg.offset"
              stroke-linecap="butt"
            />
          }
        </g>
        <text [attr.x]="size / 2" [attr.y]="size / 2 - 4" text-anchor="middle" class="fill-ink-900" style="font-size: 22px; font-weight: 600;">{{ total() }}</text>
        <text [attr.x]="size / 2" [attr.y]="size / 2 + 16" text-anchor="middle" class="fill-ink-400" style="font-size: 10px;">pólizas</text>
      </svg>

      <ul class="flex w-full flex-col gap-2.5 sm:w-auto">
        @for (slice of data(); track slice.label) {
          <li class="flex items-center justify-between gap-6 text-sm">
            <span class="flex items-center gap-2 text-ink-600">
              <span class="h-2.5 w-2.5 rounded-full" [style.backgroundColor]="slice.color"></span>
              {{ slice.label }}
            </span>
            <span class="font-medium text-ink-800">{{ slice.value }}</span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class DonutChartComponent {
  readonly data = input.required<DonutSlice[]>();

  protected readonly size = SIZE;
  protected readonly stroke = STROKE;
  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  protected readonly total = computed(() => this.data().reduce((sum, d) => sum + d.value, 0));

  protected readonly segments = computed(() => {
    const total = this.total() || 1;
    let cumulative = 0;
    return this.data().map((d) => {
      const fraction = d.value / total;
      const dash = fraction * CIRCUMFERENCE;
      const offset = cumulative;
      cumulative += dash;
      return { label: d.label, color: d.color, dash, offset };
    });
  });
}
