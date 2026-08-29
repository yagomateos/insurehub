import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Claim, ClaimType } from '../../../core/models/claim.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-claim-form',
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

      <ui-form-field label="Póliza" [required]="true" [errorMessage]="errorFor('policyId')" [hint]="availablePolicies().length === 0 ? 'Este cliente no tiene pólizas activas.' : ''">
        <select formControlName="policyId" class="field-input" [class.field-input--error]="!!errorFor('policyId')" [disabled]="availablePolicies().length === 0">
          <option value="" disabled>Selecciona una póliza</option>
          @for (policy of availablePolicies(); track policy.id) {
            <option [value]="policy.id">{{ policy.id }} · {{ policyTypeLabel(policy.type) }}</option>
          }
        </select>
      </ui-form-field>

      <ui-form-field label="Tipo de siniestro" [required]="true" [errorMessage]="errorFor('type')">
        <select formControlName="type" class="field-input" [class.field-input--error]="!!errorFor('type')">
          @for (type of claimTypesForSelectedPolicy(); track type) {
            <option [value]="type">{{ claimTypeLabel(type) }}</option>
          }
        </select>
      </ui-form-field>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ui-form-field label="Fecha" [required]="true" [errorMessage]="errorFor('date')">
          <input type="date" formControlName="date" class="field-input" [class.field-input--error]="!!errorFor('date')" />
        </ui-form-field>
        <ui-form-field label="Importe (€)" [required]="true" [errorMessage]="errorFor('amount')">
          <input type="number" step="0.01" min="0" formControlName="amount" class="field-input" [class.field-input--error]="!!errorFor('amount')" placeholder="1800.00" />
        </ui-form-field>
      </div>

      <ui-form-field label="Descripción" [required]="true" [errorMessage]="errorFor('description')">
        <textarea formControlName="description" rows="3" class="field-input" [class.field-input--error]="!!errorFor('description')" placeholder="Describe brevemente lo ocurrido…"></textarea>
      </ui-form-field>

      <ui-form-field label="Documentación" hint="Adjunta el parte, fotografías u otra documentación relevante (opcional).">
        <input type="file" multiple class="field-input pt-1.5" />
      </ui-form-field>

      @if (submitError()) {
        <p class="text-sm text-danger-600">{{ submitError() }}</p>
      }

      <div class="flex items-center justify-end gap-2 pt-2">
        <ui-button type="button" variant="secondary" (click)="cancelled.emit()">Cancelar</ui-button>
        <ui-button type="submit" [loading]="saving()" [disabled]="saving()">Crear siniestro</ui-button>
      </div>
    </form>
  `,
})
export class ClaimFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(MockDataService);

  readonly lockedCustomerId = input<string | null>(null);
  readonly saved = output<Claim>();
  readonly cancelled = output<void>();

  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly customers = this.data.customers;

  protected readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    policyId: ['', Validators.required],
    type: ['colision' as ClaimType, Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  private readonly selectedCustomerId = toSignal(this.form.controls.customerId.valueChanges, {
    initialValue: this.form.controls.customerId.value,
  });

  protected readonly lockedCustomerName = computed(() => {
    const id = this.lockedCustomerId();
    if (!id) return '';
    const c = this.data.getCustomerById(id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  });

  protected readonly availablePolicies = computed(() => {
    const customerId = this.lockedCustomerId() ?? this.selectedCustomerId();
    if (!customerId) return [];
    return this.data.getPoliciesForCustomer(customerId);
  });

  protected readonly claimTypesForSelectedPolicy = computed<ClaimType[]>(() => {
    const byPolicy: Record<string, ClaimType[]> = {
      auto: ['colision', 'robo', 'responsabilidad-civil'],
      hogar: ['incendio', 'agua', 'robo'],
      salud: ['asistencia-medica'],
      vida: ['fallecimiento'],
    };
    const policyId = this.form.controls.policyId.value;
    const policy = this.data.getPolicyById(policyId);
    return policy ? byPolicy[policy.type] : ['colision', 'robo', 'incendio', 'agua', 'responsabilidad-civil', 'asistencia-medica', 'fallecimiento'];
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
    if (controlName === 'amount' && control.hasError('min')) return 'Introduce un importe válido.';
    if (controlName === 'description' && control.hasError('minlength')) return 'Añade una descripción de al menos 10 caracteres.';
    return '';
  }

  claimTypeLabel(type: ClaimType): string {
    const map: Record<ClaimType, string> = {
      colision: 'Colisión',
      robo: 'Robo',
      incendio: 'Incendio',
      agua: 'Daños por agua',
      'responsabilidad-civil': 'Responsabilidad civil',
      'asistencia-medica': 'Asistencia médica',
      fallecimiento: 'Fallecimiento',
    };
    return map[type];
  }

  policyTypeLabel(type: string): string {
    const map: Record<string, string> = { auto: 'Auto', hogar: 'Hogar', salud: 'Salud', vida: 'Vida' };
    return map[type] ?? type;
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
      const now = new Date().toISOString();
      const claim: Claim = {
        id: `CLM-${Math.floor(20000 + Math.random() * 9000)}`,
        customerId: values.customerId,
        policyId: values.policyId,
        type: values.type,
        date: new Date(values.date).toISOString(),
        amount: values.amount,
        manager: 'Yago Mateos',
        status: 'abierto',
        description: values.description,
        history: [{ status: 'abierto', date: now, actor: 'Cliente', note: 'Siniestro presentado por el cliente.' }],
        notes: [],
        documents: [],
      };
      this.saved.emit(claim);
    }, 600);
  }
}
