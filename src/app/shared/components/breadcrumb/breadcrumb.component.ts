import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string[];
}

@Component({
  selector: 'ui-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex items-center gap-1.5 text-xs text-ink-500" aria-label="Breadcrumb">
      @for (item of items(); track item.label; let last = $last) {
        @if (item.link && !last) {
          <a [routerLink]="item.link" class="hover:text-brand-600">{{ item.label }}</a>
        } @else {
          <span [class]="last ? 'font-medium text-ink-700' : ''">{{ item.label }}</span>
        }
        @if (!last) {
          <svg class="h-3 w-3 text-ink-300" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
