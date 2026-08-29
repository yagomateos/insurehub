import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

interface ToggleSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, ModalComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl space-y-6">
      <p class="-mt-2 text-sm text-ink-500">Preferencias de la plataforma.</p>

      <ui-card>
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <h2 class="text-base font-semibold text-ink-900">Notificaciones</h2>
        </div>
        <ul class="mt-4 divide-y divide-ink-100">
          @for (setting of notifications(); track setting.key) {
            <li class="flex items-center justify-between py-3">
              <div>
                <p class="text-sm font-medium text-ink-800">{{ setting.label }}</p>
                <p class="text-sm text-ink-500">{{ setting.description }}</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="setting.enabled"
                (click)="toggle(notifications, setting.key)"
                class="focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors"
                [class]="setting.enabled ? 'bg-brand-600' : 'bg-ink-200'"
              >
                <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" [class]="setting.enabled ? 'translate-x-5' : 'translate-x-0.5'"></span>
              </button>
            </li>
          }
        </ul>
      </ui-card>

      <ui-card>
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-base font-semibold text-ink-900">Seguridad</h2>
        </div>
        <ul class="mt-4 divide-y divide-ink-100">
          @for (setting of security(); track setting.key) {
            <li class="flex items-center justify-between py-3">
              <div>
                <p class="text-sm font-medium text-ink-800">{{ setting.label }}</p>
                <p class="text-sm text-ink-500">{{ setting.description }}</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="setting.enabled"
                (click)="toggle(security, setting.key)"
                class="focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors"
                [class]="setting.enabled ? 'bg-brand-600' : 'bg-ink-200'"
              >
                <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" [class]="setting.enabled ? 'translate-x-5' : 'translate-x-0.5'"></span>
              </button>
            </li>
          }
        </ul>
        <div class="mt-4 border-t border-ink-100 pt-4">
          <ui-button variant="secondary" size="sm" (click)="passwordModalOpen.set(true)">Cambiar contraseña</ui-button>
        </div>
      </ui-card>

      <ui-card>
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <h2 class="text-base font-semibold text-ink-900">Preferencias</h2>
        </div>
        <ul class="mt-4 divide-y divide-ink-100">
          @for (setting of preferences(); track setting.key) {
            <li class="flex items-center justify-between py-3">
              <div>
                <p class="text-sm font-medium text-ink-800">{{ setting.label }}</p>
                <p class="text-sm text-ink-500">{{ setting.description }}</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="setting.enabled"
                (click)="toggle(preferences, setting.key)"
                class="focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors"
                [class]="setting.enabled ? 'bg-brand-600' : 'bg-ink-200'"
              >
                <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" [class]="setting.enabled ? 'translate-x-5' : 'translate-x-0.5'"></span>
              </button>
            </li>
          }
        </ul>
      </ui-card>

      <div class="flex justify-end">
        <ui-button [loading]="saving()" [disabled]="saving()" (click)="save()">Guardar configuración</ui-button>
      </div>
    </div>

    <ui-modal [open]="passwordModalOpen()" title="Cambiar contraseña" [hasFooter]="false" (close)="passwordModalOpen.set(false)">
      <form [formGroup]="passwordForm" (ngSubmit)="submitPassword()" class="space-y-4" novalidate>
        <ui-form-field label="Contraseña actual" [required]="true" [errorMessage]="passwordErrorFor('currentPassword')">
          <input type="password" formControlName="currentPassword" class="field-input" [class.field-input--error]="!!passwordErrorFor('currentPassword')" />
        </ui-form-field>
        <ui-form-field label="Nueva contraseña" [required]="true" [errorMessage]="passwordErrorFor('newPassword')" hint="Mínimo 8 caracteres.">
          <input type="password" formControlName="newPassword" class="field-input" [class.field-input--error]="!!passwordErrorFor('newPassword')" />
        </ui-form-field>
        <div class="flex justify-end gap-2 pt-2">
          <ui-button type="button" variant="secondary" (click)="passwordModalOpen.set(false)">Cancelar</ui-button>
          <ui-button type="submit" [loading]="changingPassword()" [disabled]="changingPassword()">Guardar contraseña</ui-button>
        </div>
      </form>
    </ui-modal>
  `,
})
export class SettingsComponent {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly saving = signal(false);
  protected readonly passwordModalOpen = signal(false);
  protected readonly changingPassword = signal(false);

  protected readonly notifications = signal<ToggleSetting[]>([
    { key: 'emailNotifications', label: 'Notificaciones por email', description: 'Recibe alertas de nuevos siniestros por correo', enabled: true },
    { key: 'dailySummary', label: 'Resumen diario', description: 'Resumen de actividad al inicio de la jornada', enabled: true },
    { key: 'renewals', label: 'Pólizas próximas a vencer', description: 'Aviso cuando una póliza está a punto de vencer', enabled: true },
  ]);

  protected readonly security = signal<ToggleSetting[]>([
    { key: 'twoFactor', label: 'Doble factor de autenticación', description: 'Refuerza la seguridad de tu cuenta', enabled: false },
    { key: 'loginAlerts', label: 'Alertas de nuevo inicio de sesión', description: 'Notifica accesos desde dispositivos desconocidos', enabled: true },
  ]);

  protected readonly preferences = signal<ToggleSetting[]>([
    { key: 'compactTables', label: 'Modo compacto de tablas', description: 'Muestra más registros por pantalla', enabled: false },
    { key: 'confirmDeletes', label: 'Confirmaciones antes de eliminar', description: 'Solicita confirmación en acciones destructivas', enabled: true },
  ]);

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  toggle(list: WritableSignal<ToggleSetting[]>, key: string): void {
    list.update((items) => items.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));
  }

  save(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.toast.success('Configuración guardada correctamente');
    }, 600);
  }

  passwordErrorFor(controlName: keyof typeof this.passwordForm.controls): string {
    const control = this.passwordForm.controls[controlName];
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) return 'La contraseña debe tener al menos 8 caracteres.';
    return '';
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.changingPassword.set(true);
    setTimeout(() => {
      this.changingPassword.set(false);
      this.passwordForm.reset({ currentPassword: '', newPassword: '' });
      this.passwordModalOpen.set(false);
      this.toast.success('Contraseña actualizada correctamente');
    }, 600);
  }
}
