import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarTone = 'solid' | 'soft';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      [class]="sizeClasses()"
      [class.bg-brand-100]="tone() === 'soft'"
      [class.text-brand-700]="tone() === 'soft'"
      [class.text-white]="tone() === 'solid'"
      [style.backgroundColor]="tone() === 'solid' ? color() : null"
    >
      {{ initials() }}
    </span>
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly color = input<string>('#4f46e5');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly tone = input<AvatarTone>('solid');

  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
  );

  protected readonly sizeClasses = computed(() => {
    const map = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-sm', lg: 'h-14 w-14 text-lg' };
    return map[this.size()];
  });
}
