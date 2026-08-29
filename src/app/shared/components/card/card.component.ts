import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl border border-ink-200 bg-white shadow-[var(--shadow-card)]" [class.p-5]="padded()">
      @if (title()) {
        <div class="mb-4 flex items-center justify-between" [class.px-5]="!padded()" [class.pt-5]="!padded()">
          <div>
            <h3 class="text-sm font-semibold text-ink-900">{{ title() }}</h3>
            @if (subtitle()) {
              <p class="mt-0.5 text-xs text-ink-500">{{ subtitle() }}</p>
            }
          </div>
          <ng-content select="[card-actions]" />
        </div>
      }
      <div [class.px-5]="!padded()" [class.pb-5]="!padded() && title()">
        <ng-content />
      </div>
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly padded = input(true);
}
