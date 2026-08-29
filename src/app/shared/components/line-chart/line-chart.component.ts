import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export interface LineChartPoint {
  label: string;
  count: number;
}

interface Point {
  x: number;
  y: number;
  label: string;
}

const WIDTH = 640;
const HEIGHT = 220;
const PADDING_X = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

function smoothLinePath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

@Component({
  selector: 'ui-line-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="w-full" [style.height.px]="height" preserveAspectRatio="none" role="img" [attr.aria-label]="ariaLabel()">
      @for (y of gridLines(); track y) {
        <line [attr.x1]="paddingX" [attr.x2]="width - paddingX" [attr.y1]="y" [attr.y2]="y" stroke="var(--color-ink-100)" stroke-width="1" stroke-dasharray="4 4" />
      }

      <path [attr.d]="areaPath()" fill="url(#lineChartGradient)" stroke="none" />
      <path [attr.d]="linePath()" fill="none" stroke="var(--color-brand-500)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

      @for (p of points(); track p.x; let i = $index) {
        <g
          (mouseenter)="hoverIndex.set(i)"
          (mouseleave)="hoverIndex.set(null)"
          class="cursor-pointer"
        >
          <circle [attr.cx]="p.x" [attr.cy]="p.y" r="10" fill="transparent" />
          @if (hoverIndex() === i) {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" fill="var(--color-brand-600)" stroke="white" stroke-width="1.5" />
          }
        </g>
      }

      @for (p of points(); track p.x; let i = $index) {
        @if (i % tickEvery() === 0) {
          <text [attr.x]="p.x" [attr.y]="height - 6" text-anchor="middle" class="fill-ink-400" style="font-size: 10px;">{{ p.label }}</text>
        }
      }

      @if (hoverIndex() !== null) {
        <g>
          <line [attr.x1]="points()[hoverIndex()!].x" [attr.x2]="points()[hoverIndex()!].x" [attr.y1]="paddingTop" [attr.y2]="height - paddingBottom" stroke="var(--color-ink-300)" stroke-dasharray="3 3" />
        </g>
      }

      <defs>
        <linearGradient id="lineChartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--color-brand-500)" stop-opacity="0.22" />
          <stop offset="100%" stop-color="var(--color-brand-500)" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>

    @if (hoverIndex() !== null) {
      <div class="mt-1 text-center text-xs text-ink-600">
        <span class="font-semibold text-ink-800">{{ data()[hoverIndex()!].label }}</span>
        · {{ data()[hoverIndex()!].count }} siniestros
      </div>
    }
  `,
})
export class LineChartComponent {
  readonly data = input.required<LineChartPoint[]>();
  readonly ariaLabel = input('Evolución mensual de siniestros');

  protected readonly hoverIndex = signal<number | null>(null);
  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly paddingX = PADDING_X;
  protected readonly paddingTop = PADDING_TOP;
  protected readonly paddingBottom = PADDING_BOTTOM;

  protected readonly tickEvery = computed(() => (this.data().length > 8 ? 2 : 1));

  protected readonly maxValue = computed(() => Math.max(...this.data().map((d) => d.count), 1));

  protected readonly points = computed<Point[]>(() => {
    const data = this.data();
    const max = this.maxValue();
    const usableWidth = WIDTH - PADDING_X * 2;
    const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    return data.map((d, i) => ({
      x: PADDING_X + (data.length === 1 ? usableWidth / 2 : (usableWidth * i) / (data.length - 1)),
      y: PADDING_TOP + usableHeight - (d.count / max) * usableHeight,
      label: d.label,
    }));
  });

  protected readonly gridLines = computed(() => {
    const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    return [0, 0.25, 0.5, 0.75, 1].map((f) => PADDING_TOP + usableHeight * f);
  });

  protected readonly linePath = computed(() => smoothLinePath(this.points()));

  protected readonly areaPath = computed(() => {
    const pts = this.points();
    if (!pts.length) return '';
    const baseline = HEIGHT - PADDING_BOTTOM;
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${smoothLinePath(pts)} L ${last.x},${baseline} L ${first.x},${baseline} Z`;
  });
}
