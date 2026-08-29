import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-pulse rounded-md bg-ink-200" [style.width]="width()" [style.height]="height()"></div>
  `,
})
export class SkeletonComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
}
