import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { PolicyStatus, PolicyType, POLICY_TYPE_LABEL } from '../../../core/models/policy.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SortIconComponent } from '../../../shared/components/sort-icon/sort-icon.component';
import { FilterIconComponent } from '../../../shared/components/filter-icon/filter-icon.component';
import { policyStatusMeta } from '../../../shared/utils/status-styles';

type SortKey = 'startDate' | 'renewal' | 'premium';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 8;

const POLICY_TYPE_DOT: Record<PolicyType, string> = {
  auto: 'bg-brand-500',
  hogar: 'bg-success-500',
  salud: 'bg-warning-500',
  vida: 'bg-brand-800',
};

@Component({
  selector: 'app-policies-list',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, CardComponent, BadgeComponent, PaginationComponent, EmptyStateComponent, SortIconComponent, FilterIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <p class="-mt-2 text-sm text-ink-500">Consulta y gestiona todas las pólizas contratadas.</p>

      <ui-card [padded]="false">
        <div class="flex flex-col gap-3 border-b border-ink-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative w-full sm:max-w-xs">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
            <input type="search" [value]="search()" (input)="onSearch($event)" placeholder="Buscar por ID de póliza o cliente…" class="field-input pl-9" />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <ui-filter-icon />
            <select class="field-input w-auto" [value]="typeFilter()" (change)="onTypeFilter($event)">
              <option value="all">Todos los tipos</option>
              <option value="auto">Auto</option>
              <option value="hogar">Hogar</option>
              <option value="salud">Salud</option>
              <option value="vida">Vida</option>
            </select>
            <select class="field-input w-auto" [value]="statusFilter()" (change)="onStatusFilter($event)">
              <option value="all">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="proxima-vencer">Próxima a vencer</option>
              <option value="cancelada">Cancelada</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        @if (pagedPolicies().length === 0) {
          <div class="p-5">
            <ui-empty-state title="No se han encontrado pólizas" description="Prueba a cambiar los filtros o el término de búsqueda." />
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-ink-200 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th class="px-5 py-3 font-medium">ID de póliza</th>
                  <th class="px-5 py-3 font-medium">Cliente</th>
                  <th class="px-5 py-3 font-medium">Tipo</th>
                  <th class="px-5 py-3 font-medium">
                    <button type="button" class="focus-ring flex items-center gap-1 hover:text-ink-700" (click)="toggleSort('startDate')">
                      Inicio
                      <ui-sort-icon />
                    </button>
                  </th>
                  <th class="px-5 py-3 font-medium">
                    <button type="button" class="focus-ring flex items-center gap-1 hover:text-ink-700" (click)="toggleSort('renewal')">
                      Renovación
                      <ui-sort-icon />
                    </button>
                  </th>
                  <th class="px-5 py-3 font-medium">
                    <button type="button" class="focus-ring flex items-center gap-1 hover:text-ink-700" (click)="toggleSort('premium')">
                      Prima
                      <ui-sort-icon />
                    </button>
                  </th>
                  <th class="px-5 py-3 font-medium">Estado</th>
                  <th class="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (policy of pagedPolicies(); track policy.id) {
                  <tr class="hover:bg-ink-50/60">
                    <td class="px-5 py-3">
                      <a [routerLink]="['/customers', policy.customerId]" class="font-medium text-brand-600 hover:text-brand-700">{{ policy.id }}</a>
                    </td>
                    <td class="px-5 py-3">
                      <a [routerLink]="['/customers', policy.customerId]" class="text-ink-700 hover:text-brand-600">{{ customerName(policy.customerId) }}</a>
                    </td>
                    <td class="px-5 py-3 text-ink-600">
                      <span class="inline-flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full" [class]="policyTypeDot[policy.type]"></span>
                        {{ policyTypeLabel[policy.type] }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-ink-500">{{ policy.startDate | date: 'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3 text-ink-500">{{ policy.renewalDate | date: 'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3 font-medium text-ink-800">{{ policy.premium | currency: 'EUR' }}</td>
                    <td class="px-5 py-3">
                      <ui-badge [tone]="statusMeta(policy.status).tone">{{ statusMeta(policy.status).label }}</ui-badge>
                    </td>
                    <td class="px-5 py-3">
                      <a [routerLink]="['/customers', policy.customerId]" class="text-xs font-medium text-brand-600 hover:text-brand-700">Ver cliente</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ui-pagination [page]="page()" [pageSize]="pageSize" [total]="filteredPolicies().length" (pageChange)="page.set($event)" />
        }
      </ui-card>
    </div>
  `,
})
export class PoliciesListComponent {
  private readonly data = inject(MockDataService);

  protected readonly search = signal('');
  protected readonly typeFilter = signal<'all' | PolicyType>('all');
  protected readonly statusFilter = signal<'all' | PolicyStatus>('all');
  protected readonly sortKey = signal<SortKey>('renewal');
  protected readonly sortDir = signal<SortDir>('asc');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly statusMeta = policyStatusMeta;
  protected readonly policyTypeLabel = POLICY_TYPE_LABEL;
  protected readonly policyTypeDot = POLICY_TYPE_DOT;

  protected readonly filteredPolicies = computed(() => {
    const term = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();
    let list = this.data.policies();

    if (type !== 'all') list = list.filter((p) => p.type === type);
    if (status !== 'all') list = list.filter((p) => p.status === status);
    if (term) {
      list = list.filter(
        (p) => p.id.toLowerCase().includes(term) || this.customerName(p.customerId).toLowerCase().includes(term),
      );
    }

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const sorted = [...list];
    if (this.sortKey() === 'startDate') {
      sorted.sort((a, b) => dir * (+new Date(a.startDate) - +new Date(b.startDate)));
    } else if (this.sortKey() === 'renewal') {
      sorted.sort((a, b) => dir * (+new Date(a.renewalDate) - +new Date(b.renewalDate)));
    } else {
      sorted.sort((a, b) => dir * (a.premium - b.premium));
    }
    return sorted;
  });

  protected readonly pagedPolicies = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredPolicies().slice(start, start + this.pageSize);
  });

  customerName(customerId: string): string {
    const c = this.data.getCustomerById(customerId);
    return c ? `${c.firstName} ${c.lastName}` : customerId;
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onTypeFilter(event: Event): void {
    this.typeFilter.set((event.target as HTMLSelectElement).value as 'all' | PolicyType);
    this.page.set(1);
  }

  onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'all' | PolicyStatus);
    this.page.set(1);
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }
}
