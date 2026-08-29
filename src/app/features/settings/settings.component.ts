import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl space-y-6">
      <ui-card title="Notificaciones" subtitle="Elige qué notificaciones quieres recibir por correo electrónico">
        <ul class="divide-y divide-ink-100">
          @for (setting of settings(); track setting.key) {
            <li class="flex items-center justify-between py-3">
              <div>
                <p class="text-sm font-medium text-ink-800">{{ setting.label }}</p>
                <p class="text-sm text-ink-500">{{ setting.description }}</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="setting.enabled"
                (click)="toggle(setting.key)"
                class="focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors"
                [class]="setting.enabled ? 'bg-brand-600' : 'bg-ink-200'"
              >
                <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" [class]="setting.enabled ? 'translate-x-5' : 'translate-x-0.5'"></span>
              </button>
            </li>
          }
        </ul>
      </ui-card>
    </div>
  `,
})
export class SettingsComponent {
  protected readonly settings = signal<NotificationSetting[]>([
    { key: 'newClaims', label: 'Nuevos siniestros', description: 'Recibe un aviso cuando se registre un siniestro nuevo.', enabled: true },
    { key: 'renewals', label: 'Renovaciones próximas', description: 'Recibe un aviso cuando una póliza esté próxima a vencer.', enabled: true },
    { key: 'weeklySummary', label: 'Resumen semanal', description: 'Recibe un resumen semanal de actividad de tu cartera.', enabled: false },
  ]);

  toggle(key: string): void {
    this.settings.update((list) => list.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));
  }
}
