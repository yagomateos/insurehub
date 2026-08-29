import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Policy, PolicyStatus, PolicyType } from '../../../core/models/policy.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, FormFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4" novalidate>
      @if (!lockedCustomerId()) {
        <ui-form-field label="Cliente" [required]="true" [errorMessage]="errorFor('customerId')">
          <select formControlName="customerId" class="field-input" [class.field-input--error]="!!errorFor('customerId')">
            <option value="" disabled>Selecciona un cliente</option>
            @for (customer of customers(); track customer.id) {
              <option [value]="customer.id">{{ customer.firstName }} {{ customer.lastName }} · {{ customer.id }}</option>
            }
          </select>
        </ui-form-field>
      } @else {
        <p class="text-sm text-ink-500">Cliente: <span class="font-medium text-ink-800">{{ lockedCustomerName() }}</span></p>
      }

      <ui-form-field label="Tipo de póliza" [required]="true" [errorMessage]="errorFor('type')">
        <select formControlName="type" class="field-input" [class.field-input--error]="!!errorFor('type')">
          <option value="auto">Auto</option>
          <option value="hogar">Hogar</option>
          <option value="salud">Salud</option>
          <option value="vida">Vida</option>
        </select>
      </ui-form-field>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ui-form-field label="Fecha de inicio" [required]="true" [errorMessage]="errorFor('startDate')">
          <input type="date" formControlName="startDate" class="field-input" [class.field-input--error]="!!errorFor('startDate')" />
        </ui-form-field>
        <ui-form-field label="Fecha de renovación" [required]="true" [errorMessage]="errorFor('renewalDate')">
          <input type="date" formControlName="renewalDate" class="field-input" [class.field-input--error]="!!errorFor('renewalDate')" />
        </ui-form-field>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ui-form-field label="Prima (€)" [required]="true" [errorMessage]="errorFor('premium')">
          <input type="number" step="0.01" min="0" formControlName="premium" class="field-input" [class.field-input--error]="!!errorFor('premium')" placeholder="480.00" />
        </ui-form-field>
        <ui-form-field label="Estado" [required]="true" [errorMessage]="errorFor('status')">
          <select formControlName="status" class="field-input" [class.field-input--error]="!!errorFor('status')">
            <option value="activa">Activa</option>
            <option value="proxima-vencer">Próxima a vencer</option>
            <option value="cancelada">Cancelada</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </ui-form-field>
      </div>

      @if (submitError()) {
        <p class="text-sm text-danger-600">{{ submitError() }}</p>
      }

      <div class="flex items-center justify-end gap-2 pt-2">
        <ui-button type="button" variant="secondary" (click)="cancelled.emit()">Cancelar</ui-button>
        <ui-button type="submit" [loading]="saving()" [disabled]="saving()">Crear póliza</ui-button>
      </div>
    </form>
  `,
})
export class PolicyFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(MockDataService);

  readonly lockedCustomerId = input<string | null>(null);
  readonly saved = output<Policy>();
  readonly cancelled = output<void>();

  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly customers = this.data.customers;

  protected readonly lockedCustomerName = computed(() => {
    const id = this.lockedCustomerId();
    if (!id) return '';
    const c = this.data.getCustomerById(id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  });

  protected readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    type: ['auto' as PolicyType, Validators.required],
    startDate: ['', Validators.required],
    renewalDate: ['', Validators.required],
    premium: [0, [Validators.required, Validators.min(1)]],
    status: ['pendiente' as PolicyStatus, Validators.required],
  });

  constructor() {
    const locked = this.lockedCustomerId();
    if (locked) {
      this.form.patchValue({ customerId: locked });
      this.form.controls.customerId.clearValidators();
    }
  }

  errorFor(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];
    if (!control.touched && !control.dirty) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (controlName === 'premium' && control.hasError('min')) return 'Introduce un importe válido.';
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
      const policy: Policy = {
        id: `POL-${Math.floor(6000 + Math.random() * 3000)}`,
        customerId: values.customerId,
        type: values.type,
        startDate: new Date(values.startDate).toISOString(),
        renewalDate: new Date(values.renewalDate).toISOString(),
        premium: values.premium,
        status: values.status,
      };
      this.saved.emit(policy);
    }, 600);
  }
}
