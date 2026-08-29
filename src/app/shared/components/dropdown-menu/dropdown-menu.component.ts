import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

export type DropdownMenuIcon = 'view' | 'edit' | 'delete' | 'export' | 'approve' | 'reject';

export interface DropdownMenuItem {
  label: string;
  action: string;
  danger?: boolean;
  icon?: DropdownMenuIcon;
}

const ICON_PATHS: Record<DropdownMenuIcon, string[]> = {
  view: [
    'M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    'M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z',
  ],
  edit: [
    'M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z',
    'M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z',
  ],
  delete: [
    'M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z',
  ],
  export: [
    'M10 12.75a.75.75 0 01-.75-.75V3.75a.75.75 0 011.5 0v8.25a.75.75 0 01-.75.75z',
    'M5.72 8.47a.75.75 0 011.06 0L10 11.69l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L5.72 9.53a.75.75 0 010-1.06z',
    'M3 13.75a.75.75 0 01.75.75v1.5c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25v-1.5a.75.75 0 011.5 0v1.5A2.75 2.75 0 0115 18.5H5a2.75 2.75 0 01-2.75-2.75v-1.5a.75.75 0 01.75-.75z',
  ],
  approve: [
    'M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z',
  ],
  reject: [
    'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z',
  ],
};

@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  imports: [ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block text-left" uiClickOutside (uiClickOutside)="open.set(false)">
      <button
        type="button"
        class="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100"
        (click)="open.set(!open())"
        aria-label="Abrir menú de acciones"
      >
        <svg class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4.5" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="15.5" cy="10" r="1.5" />
        </svg>
      </button>
      @if (open()) {
        <div class="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-lg border border-ink-200 bg-white py-1 shadow-[var(--shadow-popover)]">
          @for (item of items(); track item.action) {
            <button
              type="button"
              class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm hover:bg-ink-50"
              [class]="item.danger ? 'text-danger-600' : 'text-ink-700'"
              (click)="select(item.action)"
            >
              @if (item.icon) {
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  @for (path of iconPaths(item.icon); track path) {
                    <path [attr.d]="path" />
                  }
                </svg>
              }
              {{ item.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class DropdownMenuComponent {
  readonly items = input.required<DropdownMenuItem[]>();
  readonly actionSelected = output<string>();
  protected readonly open = signal(false);

  select(action: string): void {
    this.open.set(false);
    this.actionSelected.emit(action);
  }

  iconPaths(icon: DropdownMenuIcon): string[] {
    return ICON_PATHS[icon];
  }
}
