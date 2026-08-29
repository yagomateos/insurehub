import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink-50 px-6">
      <div class="w-full max-w-sm rounded-lg border border-ink-200 bg-white p-8 shadow-[var(--shadow-card)]">
        @if (!sent()) {
          <h1 class="text-xl font-semibold text-ink-900">Recuperar contraseña</h1>
          <p class="mt-1.5 text-sm text-ink-500">Introduce tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4" novalidate>
            <ui-form-field label="Correo electrónico" [required]="true" [errorMessage]="emailError()">
              <input type="email" formControlName="email" class="field-input" [class.field-input--error]="!!emailError()" placeholder="nombre@insurehub.com" />
            </ui-form-field>
            <ui-button type="submit" [loading]="loading()" [disabled]="loading()" [fullWidth]="true">Enviar instrucciones</ui-button>
          </form>
        } @else {
          <div class="text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600">
              <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" clip-rule="evenodd" /></svg>
            </div>
            <h1 class="mt-3 text-lg font-semibold text-ink-900">Revisa tu correo</h1>
            <p class="mt-1.5 text-sm text-ink-500">Te hemos enviado instrucciones para restablecer tu contraseña.</p>
          </div>
        }

        <a routerLink="/login" class="mt-6 block text-center text-sm font-medium text-brand-600 hover:text-brand-700">Volver al inicio de sesión</a>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly sent = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly emailError = signal('');

  submit(): void {
    const control = this.form.controls.email;
    if (control.invalid) {
      control.markAsTouched();
      this.emailError.set(control.hasError('required') ? 'El correo electrónico es obligatorio.' : 'Introduce un correo electrónico válido.');
      return;
    }
    this.emailError.set('');
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.sent.set(true);
    }, 700);
  }
}
