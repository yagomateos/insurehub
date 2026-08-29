import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Customer } from '../../../core/models/customer.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ui-form-field label="Nombre" [required]="true" [errorMessage]="errorFor('firstName')">
          <input formControlName="firstName" class="field-input" [class.field-input--error]="!!errorFor('firstName')" placeholder="María" />
        </ui-form-field>
        <ui-form-field label="Apellidos" [required]="true" [errorMessage]="errorFor('lastName')">
          <input formControlName="lastName" class="field-input" [class.field-input--error]="!!errorFor('lastName')" placeholder="García López" />
        </ui-form-field>
      </div>

      <ui-form-field label="Correo electrónico" [required]="true" [errorMessage]="errorFor('email')">
        <input type="email" formControlName="email" class="field-input" [class.field-input--error]="!!errorFor('email')" placeholder="maria.garcia@ejemplo.com" />
      </ui-form-field>

      <ui-form-field label="Teléfono" [required]="true" [errorMessage]="errorFor('phone')">
        <input type="tel" formControlName="phone" class="field-input" [class.field-input--error]="!!errorFor('phone')" placeholder="612345678" />
      </ui-form-field>

      <ui-form-field label="Dirección" [required]="true" [errorMessage]="errorFor('address')">
        <input formControlName="address" class="field-input" [class.field-input--error]="!!errorFor('address')" placeholder="Calle Mayor, 12" />
      </ui-form-field>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ui-form-field label="Ciudad" [required]="true" [errorMessage]="errorFor('city')">
          <input formControlName="city" class="field-input" [class.field-input--error]="!!errorFor('city')" placeholder="Madrid" />
        </ui-form-field>
        <ui-form-field label="Código postal" [required]="true" [errorMessage]="errorFor('postalCode')">
          <input formControlName="postalCode" class="field-input" [class.field-input--error]="!!errorFor('postalCode')" placeholder="28001" />
        </ui-form-field>
      </div>

      @if (submitError()) {
        <p class="text-sm text-danger-600">{{ submitError() }}</p>
      }

      <div class="flex items-center justify-end gap-2 pt-2">
        <ui-button type="button" variant="secondary" (click)="cancelled.emit()">Cancelar</ui-button>
        <ui-button type="submit" [loading]="saving()" [disabled]="saving()">{{ editMode() ? 'Guardar cambios' : 'Crear cliente' }}</ui-button>
      </div>
    </form>
  `,
})
export class CustomerFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly customer = input<Customer | null>(null);
  readonly saved = output<Customer>();
  readonly cancelled = output<void>();

  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly editMode = computed(() => this.customer() !== null);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
  });

  constructor() {
    effect(() => {
      const c = this.customer();
      if (c) {
        this.form.patchValue({
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          address: c.address,
          city: c.city,
          postalCode: c.postalCode,
        });
      } else {
        this.form.reset({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: '' });
      }
    });
  }

  errorFor(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Introduce un correo electrónico válido.';
    if (controlName === 'phone' && control.hasError('pattern')) return 'Introduce un teléfono de 9 dígitos.';
    if (controlName === 'postalCode' && control.hasError('pattern')) return 'Introduce un código postal de 5 dígitos.';
    return '';
  }

  submit(): void {
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const values = this.form.getRawValue();

    setTimeout(() => {
      this.saving.set(false);
      const existing = this.customer();
      const result: Customer = existing
        ? { ...existing, ...values }
        : {
            id: `CUS-${Math.floor(2000 + Math.random() * 8000)}`,
            ...values,
            status: 'pendiente',
            policyIds: [],
            lastActivity: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
      this.saved.emit(result);
    }, 600);
  }
}
