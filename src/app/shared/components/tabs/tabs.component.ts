import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  badge?: number;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="inline-flex w-full gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1 sm:w-auto">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          class="focus-ring flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
          [class]="
            tab.id === activeId()
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-500 hover:text-ink-800'
          "
          (click)="tabChange.emit(tab.id)"
        >
          {{ tab.label }}
          @if (tab.badge !== undefined) {
            <span
              class="rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              [class]="tab.id === activeId() ? 'bg-brand-100 text-brand-700' : 'bg-ink-200 text-ink-500'"
            >
              {{ tab.badge }}
            </span>
          }
        </button>
      }
    </nav>
  `,
})
export class TabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly activeId = input.required<string>();
  readonly tabChange = output<string>();
}
