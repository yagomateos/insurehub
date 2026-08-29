import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-sort-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M10.53 3.47a.75.75 0 00-1.06 0L6.22 6.72a.75.75 0 001.06 1.06L10 5.06l2.72 2.72a.75.75 0 101.06-1.06l-3.25-3.25zm-4.31 9.81a.75.75 0 001.06 0L10 10.56l2.72 2.72a.75.75 0 101.06-1.06l-3.25-3.25a.75.75 0 00-1.06 0l-3.25 3.25a.75.75 0 000 1.06z"
        clip-rule="evenodd"
      />
    </svg>
  `,
})
export class SortIconComponent {}
