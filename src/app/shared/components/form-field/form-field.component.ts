import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Presentational wrapper around a projected native <input>/<select>/<textarea>.
 * Keeps label/hint/error markup consistent everywhere reactive forms are used,
 * without hiding formControlName binding behind a custom ControlValueAccessor.
 */
@Component({
  selector: 'ui-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label class="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-700">
        {{ label() }}
        @if (required()) {
          <span class="text-danger-600">*</span>
        }
      </label>
      <ng-content />
      @if (errorMessage()) {
        <p class="mt-1.5 flex items-center gap-1 text-xs text-danger-600">
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" clip-rule="evenodd" />
          </svg>
          {{ errorMessage() }}
        </p>
      } @else if (hint()) {
        <p class="mt-1.5 text-xs text-ink-500">{{ hint() }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
}
