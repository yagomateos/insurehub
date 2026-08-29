import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <!-- Brand panel -->
      <div class="relative hidden flex-col justify-between bg-brand-900 p-12 text-white lg:flex">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-sm font-bold">IH</div>
          <span class="text-lg font-semibold tracking-tight">InsureHub</span>
        </div>

        <div class="max-w-md">
          <p class="text-2xl font-medium leading-snug text-white/95">
            La plataforma interna para gestionar clientes, pólizas y siniestros en un mismo lugar.
          </p>
          <div class="mt-8 grid grid-cols-3 gap-6 border-t border-white/15 pt-6 text-sm">
            <div>
              <p class="text-xl font-semibold">1.248</p>
              <p class="text-white/60">Pólizas activas</p>
            </div>
            <div>
              <p class="text-xl font-semibold">3.842</p>
              <p class="text-white/60">Clientes</p>
            </div>
            <div>
              <p class="text-xl font-semibold">98,4%</p>
              <p class="text-white/60">Satisfacción</p>
            </div>
          </div>
        </div>

        <p class="text-xs text-white/40">© 2026 InsureHub. Uso interno exclusivo.</p>
      </div>

      <!-- Form panel -->
      <div class="flex items-center justify-center px-6 py-12 sm:px-10">
        <div class="w-full max-w-sm">
          <div class="mb-8 flex items-center gap-2.5 lg:hidden">
            <div class="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">IH</div>
            <span class="text-lg font-semibold tracking-tight text-ink-900">InsureHub</span>
          </div>

          <h1 class="text-2xl font-semibold tracking-tight text-ink-900">Bienvenido a InsureHub</h1>
          <p class="mt-1.5 text-sm text-ink-500">Accede a tu plataforma de gestión de seguros</p>

          @if (sessionExpired()) {
            <div class="mt-5 rounded-md border border-warning-200 bg-warning-50 px-3.5 py-2.5 text-sm text-warning-700">
              Tu sesión ha expirado. Vuelve a iniciar sesión para continuar.
            </div>
          }

          <div class="mt-5 rounded-md border border-info-200 bg-info-50 px-3.5 py-2.5 text-xs text-info-600">
            <span class="font-semibold">Acceso de demostración:</span>
            yago.mateos&#64;insurehub.com · Insurehub2026
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-5" novalidate>
            @if (authError()) {
              <div class="flex items-start gap-2 rounded-md border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">
                <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 8a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" clip-rule="evenodd" />
                </svg>
                {{ authError() }}
              </div>
            }

            <ui-form-field label="Correo electrónico" [required]="true" [errorMessage]="emailError()">
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="nombre@insurehub.com"
                class="field-input"
                [class.field-input--error]="!!emailError()"
              />
            </ui-form-field>

            <ui-form-field label="Contraseña" [required]="true" [errorMessage]="passwordError()">
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="field-input pr-10"
                  [class.field-input--error]="!!passwordError()"
                />
                <button
                  type="button"
                  class="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  @if (showPassword()) {
                    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  } @else {
                    <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                </button>
              </div>
            </ui-form-field>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-ink-600">
                <input type="checkbox" formControlName="rememberMe" class="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                Recordarme
              </label>
              <a routerLink="/forgot-password" class="font-medium text-brand-600 hover:text-brand-700">¿Has olvidado tu contraseña?</a>
            </div>

            <ui-button type="submit" [loading]="loading()" [disabled]="loading()" [fullWidth]="true">
              {{ loading() ? 'Accediendo…' : 'Iniciar sesión' }}
            </ui-button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly authError = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly sessionExpired = signal(this.route.snapshot.queryParamMap.get('sessionExpired') === 'true');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
  });

  protected readonly emailError = computed(() => {
    const control = this.form.controls.email;
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'El correo electrónico es obligatorio.';
    if (control.hasError('email')) return 'Introduce un correo electrónico válido.';
    return '';
  });

  protected readonly passwordError = computed(() => {
    const control = this.form.controls.password;
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'La contraseña es obligatoria.';
    if (control.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  });

  submit(): void {
    this.authError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password, rememberMe } = this.form.getRawValue();

    this.auth.login({ email, password, rememberMe }).subscribe({
      next: () => {
        this.loading.set(false);
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(redirectTo ?? '/dashboard');
      },
      error: (err: { message: string }) => {
        this.loading.set(false);
        this.authError.set(err.message);
      },
    });
  }
}
