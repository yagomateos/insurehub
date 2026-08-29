import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Customer } from '../../../core/models/customer.model';
import { Policy } from '../../../core/models/policy.model';
import { Claim } from '../../../core/models/claim.model';
import { POLICY_TYPE_LABEL } from '../../../core/models/policy.model';
import { CLAIM_TYPE_LABEL } from '../../../core/models/claim.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { TabsComponent, TabItem } from '../../../shared/components/tabs/tabs.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { customerStatusMeta, policyStatusMeta, claimStatusMeta } from '../../../shared/utils/status-styles';
import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { PolicyFormComponent } from '../../policies/policy-form/policy-form.component';
import { ClaimFormComponent } from '../../claims/claim-form/claim-form.component';

type TabId = 'info' | 'policies' | 'claims' | 'activity';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    AvatarComponent,
    TabsComponent,
    EmptyStateComponent,
    ModalComponent,
    CustomerFormComponent,
    PolicyFormComponent,
    ClaimFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (customer(); as customer) {
      <div class="space-y-6">
        <a routerLink="/customers" class="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
          </svg>
          Volver a clientes
        </a>

        <ui-card>
          <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div class="flex items-center gap-4">
              <ui-avatar [name]="customer.firstName + ' ' + customer.lastName" tone="soft" size="lg" />
              <div>
                <div class="flex items-center gap-2.5">
                  <h2 class="text-lg font-semibold text-ink-900">{{ customer.firstName }} {{ customer.lastName }}</h2>
                  <ui-badge [tone]="statusMeta(customer.status).tone">{{ statusMeta(customer.status).label }}</ui-badge>
                </div>
                <p class="mt-0.5 text-sm text-ink-400">ID: {{ customer.id }}</p>
                <div class="mt-1.5 flex flex-col gap-1 text-sm text-ink-500 sm:flex-row sm:items-center sm:gap-4">
                  <span class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 4a2 2 0 00-2 2v.01L10 12l9-5.99V6a2 2 0 00-2-2H3z" />
                      <path d="M18 8.24l-7.386 4.924a1.25 1.25 0 01-1.228 0L2 8.24V14a2 2 0 002 2h12a2 2 0 002-2V8.24z" />
                    </svg>
                    {{ customer.email }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clip-rule="evenodd" />
                    </svg>
                    {{ customer.phone }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 003 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
                    </svg>
                    {{ customer.address }}, {{ customer.city }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <ui-button variant="secondary" size="sm" (click)="editModalOpen.set(true)">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
                  <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar cliente
              </ui-button>
              <ui-button variant="secondary" size="sm" (click)="policyModalOpen.set(true)">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" clip-rule="evenodd" />
                </svg>
                Nueva póliza
              </ui-button>
              <ui-button size="sm" (click)="claimModalOpen.set(true)">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" clip-rule="evenodd" />
                </svg>
                Nuevo siniestro
              </ui-button>
            </div>
          </div>
        </ui-card>

        <ui-tabs [tabs]="tabs()" [activeId]="activeTab()" (tabChange)="onTabChange($event)" />

        @switch (activeTab()) {
          @case ('info') {
            <ui-card title="Información del cliente">
              <dl class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Nombre completo</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ customer.firstName }} {{ customer.lastName }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Correo electrónico</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ customer.email }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Teléfono</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ customer.phone }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Cliente desde</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ customer.createdAt | date: 'dd/MM/yyyy' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Dirección</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ customer.address }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Ciudad</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ customer.city }}, {{ customer.postalCode }}</dd>
                </div>
              </dl>
            </ui-card>
          }
          @case ('policies') {
            @if (policies().length === 0) {
              <ui-empty-state title="Sin pólizas" description="Este cliente todavía no tiene pólizas contratadas.">
                <ui-button size="sm" (click)="policyModalOpen.set(true)">Nueva póliza</ui-button>
              </ui-empty-state>
            } @else {
              <ui-card [padded]="false">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="border-b border-ink-200 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                      <tr>
                        <th class="px-5 py-3 font-medium">ID</th>
                        <th class="px-5 py-3 font-medium">Tipo</th>
                        <th class="px-5 py-3 font-medium">Inicio</th>
                        <th class="px-5 py-3 font-medium">Renovación</th>
                        <th class="px-5 py-3 font-medium">Prima</th>
                        <th class="px-5 py-3 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-ink-100">
                      @for (policy of policies(); track policy.id) {
                        <tr class="hover:bg-ink-50/60">
                          <td class="px-5 py-3 font-medium text-ink-800">{{ policy.id }}</td>
                          <td class="px-5 py-3 text-ink-600">{{ policyTypeLabel[policy.type] }}</td>
                          <td class="px-5 py-3 text-ink-500">{{ policy.startDate | date: 'dd/MM/yyyy' }}</td>
                          <td class="px-5 py-3 text-ink-500">{{ policy.renewalDate | date: 'dd/MM/yyyy' }}</td>
                          <td class="px-5 py-3 font-medium text-ink-800">{{ policy.premium | currency: 'EUR' }}</td>
                          <td class="px-5 py-3">
                            <ui-badge [tone]="policyMeta(policy.status).tone">{{ policyMeta(policy.status).label }}</ui-badge>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </ui-card>
            }
          }
          @case ('claims') {
            @if (claims().length === 0) {
              <ui-empty-state title="Sin siniestros" description="Este cliente todavía no tiene siniestros registrados.">
                <ui-button size="sm" (click)="claimModalOpen.set(true)">Nuevo siniestro</ui-button>
              </ui-empty-state>
            } @else {
              <ui-card [padded]="false">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="border-b border-ink-200 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                      <tr>
                        <th class="px-5 py-3 font-medium">ID</th>
                        <th class="px-5 py-3 font-medium">Póliza</th>
                        <th class="px-5 py-3 font-medium">Tipo</th>
                        <th class="px-5 py-3 font-medium">Fecha</th>
                        <th class="px-5 py-3 font-medium">Importe</th>
                        <th class="px-5 py-3 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-ink-100">
                      @for (claim of claims(); track claim.id) {
                        <tr class="hover:bg-ink-50/60">
                          <td class="px-5 py-3">
                            <a [routerLink]="['/claims', claim.id]" class="font-medium text-brand-600 hover:text-brand-700">{{ claim.id }}</a>
                          </td>
                          <td class="px-5 py-3 text-ink-500">{{ claim.policyId }}</td>
                          <td class="px-5 py-3 text-ink-600">{{ claimTypeLabel[claim.type] }}</td>
                          <td class="px-5 py-3 text-ink-500">{{ claim.date | date: 'dd/MM/yyyy' }}</td>
                          <td class="px-5 py-3 font-medium text-ink-800">{{ claim.amount | currency: 'EUR' }}</td>
                          <td class="px-5 py-3">
                            <ui-badge [tone]="claimMeta(claim.status).tone">{{ claimMeta(claim.status).label }}</ui-badge>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </ui-card>
            }
          }
          @case ('activity') {
            <ui-card title="Historial de actividad">
              @if (activity().length === 0) {
                <ui-empty-state title="Sin actividad" description="Todavía no hay eventos registrados para este cliente." />
              } @else {
                <ol class="space-y-5">
                  @for (entry of activity(); track entry.id) {
                    <li class="flex gap-3">
                      <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500"></span>
                      <div>
                        <p class="text-sm font-medium text-ink-800">{{ entry.title }}</p>
                        <p class="text-sm text-ink-500">{{ entry.description }}</p>
                        <p class="mt-0.5 text-xs text-ink-400">{{ entry.date | date: 'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                    </li>
                  }
                </ol>
              }
            </ui-card>
          }
        }
      </div>

      <ui-modal [open]="editModalOpen()" title="Editar cliente" [hasFooter]="false" (close)="editModalOpen.set(false)">
        <app-customer-form [customer]="customer" (saved)="onCustomerSaved($event)" (cancelled)="editModalOpen.set(false)" />
      </ui-modal>

      <ui-modal [open]="policyModalOpen()" title="Nueva póliza" [hasFooter]="false" (close)="policyModalOpen.set(false)">
        <app-policy-form [lockedCustomerId]="customer.id" (saved)="onPolicySaved($event)" (cancelled)="policyModalOpen.set(false)" />
      </ui-modal>

      <ui-modal [open]="claimModalOpen()" title="Nuevo siniestro" [hasFooter]="false" (close)="claimModalOpen.set(false)">
        <app-claim-form [lockedCustomerId]="customer.id" (saved)="onClaimSaved($event)" (cancelled)="claimModalOpen.set(false)" />
      </ui-modal>
    } @else {
      <ui-empty-state title="Cliente no encontrado" description="El cliente solicitado no existe o ha sido eliminado." />
    }
  `,
})
export class CustomerDetailComponent {
  readonly id = input.required<string>();

  private readonly data = inject(MockDataService);
  private readonly toast = inject(ToastService);

  protected readonly activeTab = signal<TabId>('info');
  protected readonly editModalOpen = signal(false);
  protected readonly policyModalOpen = signal(false);
  protected readonly claimModalOpen = signal(false);

  protected readonly statusMeta = customerStatusMeta;
  protected readonly policyMeta = policyStatusMeta;
  protected readonly claimMeta = claimStatusMeta;
  protected readonly policyTypeLabel = POLICY_TYPE_LABEL;
  protected readonly claimTypeLabel = CLAIM_TYPE_LABEL;

  protected readonly customer = computed(() => this.data.getCustomerById(this.id()));
  protected readonly policies = computed(() => this.data.getPoliciesForCustomer(this.id()));
  protected readonly claims = computed(() => this.data.getClaimsForCustomer(this.id()));
  protected readonly activity = computed(() => this.data.getActivityForCustomer(this.id()));

  protected readonly tabs = computed<TabItem[]>(() => [
    { id: 'info', label: 'Información' },
    { id: 'policies', label: 'Pólizas', badge: this.policies().length },
    { id: 'claims', label: 'Siniestros', badge: this.claims().length },
    { id: 'activity', label: 'Actividad' },
  ]);

  onTabChange(id: string): void {
    this.activeTab.set(id as TabId);
  }

  onCustomerSaved(customer: Customer): void {
    this.data.updateCustomer(customer);
    this.editModalOpen.set(false);
    this.toast.success('Cliente actualizado correctamente');
  }

  onPolicySaved(policy: Policy): void {
    this.data.addPolicy(policy);
    this.policyModalOpen.set(false);
    this.toast.success('Póliza creada correctamente');
  }

  onClaimSaved(claim: Claim): void {
    this.data.addClaim(claim);
    this.claimModalOpen.set(false);
    this.toast.success('Siniestro creado correctamente');
  }
}
