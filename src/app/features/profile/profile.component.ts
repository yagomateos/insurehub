import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, AvatarComponent, BadgeComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl space-y-6">
      <p class="-mt-2 text-sm text-ink-500">Información de tu cuenta.</p>

      <ui-card>
        <div class="flex items-center gap-4">
          <ui-avatar [name]="auth.currentUser()?.name ?? ''" size="lg" />
          <div>
            <h2 class="text-lg font-semibold text-ink-900">{{ auth.currentUser()?.name }}</h2>
            <p class="text-sm text-ink-500">{{ auth.currentUser()?.email }}</p>
            <div class="mt-1.5">
              <ui-badge tone="brand">{{ auth.currentUser()?.role }}</ui-badge>
            </div>
          </div>
        </div>
      </ui-card>

      <ui-card title="Datos personales">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ui-form-field label="Nombre completo" [required]="true" [errorMessage]="errorFor('fullName')">
              <input formControlName="fullName" class="field-input" [class.field-input--error]="!!errorFor('fullName')" />
            </ui-form-field>
            <ui-form-field label="Correo electrónico" [required]="true" [errorMessage]="errorFor('email')">
              <input type="email" formControlName="email" class="field-input" [class.field-input--error]="!!errorFor('email')" />
            </ui-form-field>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ui-form-field label="Teléfono" [required]="true" [errorMessage]="errorFor('phone')">
              <input formControlName="phone" class="field-input" [class.field-input--error]="!!errorFor('phone')" />
            </ui-form-field>
            <ui-form-field label="Departamento" [required]="true" [errorMessage]="errorFor('department')">
              <input formControlName="department" class="field-input" [class.field-input--error]="!!errorFor('department')" />
            </ui-form-field>
          </div>
          <ui-button type="submit" [loading]="saving()" [disabled]="saving()">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v9A2.5 2.5 0 005.5 17h9a2.5 2.5 0 002.5-2.5V7.621a2.5 2.5 0 00-.732-1.767l-2.622-2.622A2.5 2.5 0 0011.879 2.5H5.5zM10 12.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM6 4h4v2H6V4z" clip-rule="evenodd" />
            </svg>
            Guardar cambios
          </ui-button>
        </form>
      </ui-card>
    </div>
  `,
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: [this.auth.currentUser()?.name ?? '', Validators.required],
    email: [this.auth.currentUser()?.email ?? '', [Validators.required, Validators.email]],
    phone: ['+34 612 345 678', Validators.required],
    department: ['Siniestros', Validators.required],
  });

  errorFor(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Introduce un correo electrónico válido.';
    return '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.toast.success('Perfil actualizado correctamente');
    }, 600);
  }
}
