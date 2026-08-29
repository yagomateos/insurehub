import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, AvatarComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl space-y-6">
      <ui-card>
        <div class="flex items-center gap-4">
          <ui-avatar [name]="auth.currentUser()?.name ?? ''" size="lg" />
          <div>
            <h2 class="text-lg font-semibold text-ink-900">{{ auth.currentUser()?.name }}</h2>
            <p class="text-sm text-ink-500">{{ auth.currentUser()?.role }} · {{ auth.currentUser()?.email }}</p>
          </div>
        </div>
      </ui-card>

      <ui-card title="Cambiar contraseña" subtitle="Actualiza tu contraseña de acceso a InsureHub">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
          <ui-form-field label="Contraseña actual" [required]="true" [errorMessage]="errorFor('currentPassword')">
            <input type="password" formControlName="currentPassword" class="field-input" [class.field-input--error]="!!errorFor('currentPassword')" />
          </ui-form-field>
          <ui-form-field label="Nueva contraseña" [required]="true" [errorMessage]="errorFor('newPassword')" hint="Mínimo 8 caracteres.">
            <input type="password" formControlName="newPassword" class="field-input" [class.field-input--error]="!!errorFor('newPassword')" />
          </ui-form-field>
          <div class="flex justify-end">
            <ui-button type="submit" [loading]="saving()" [disabled]="saving()">Guardar cambios</ui-button>
          </div>
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
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  errorFor(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength')) return 'La contraseña debe tener al menos 8 caracteres.';
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
      this.form.reset({ currentPassword: '', newPassword: '' });
      this.toast.success('Contraseña actualizada correctamente');
    }, 600);
  }
}
