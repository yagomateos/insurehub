import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Claim, ClaimStatus, ClaimType, CLAIM_TYPE_LABEL } from '../../../core/models/claim.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SortIconComponent } from '../../../shared/components/sort-icon/sort-icon.component';
import { FilterIconComponent } from '../../../shared/components/filter-icon/filter-icon.component';
import { claimStatusMeta } from '../../../shared/utils/status-styles';
import { exportToCsv } from '../../../shared/utils/csv-export';
import { ClaimFormComponent } from '../claim-form/claim-form.component';

type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 8;

const CLAIM_TYPE_DOT: Record<ClaimType, string> = {
  colision: 'bg-brand-500',
  robo: 'bg-warning-500',
  incendio: 'bg-danger-500',
  agua: 'bg-info-500',
  'responsabilidad-civil': 'bg-brand-800',
  'asistencia-medica': 'bg-success-500',
  fallecimiento: 'bg-ink-500',
};

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    PaginationComponent,
    EmptyStateComponent,
    ModalComponent,
    ClaimFormComponent,
    SortIconComponent,
    FilterIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-ink-500">Gestiona y realiza el seguimiento de los siniestros.</p>
        <div class="flex gap-2">
          <ui-button variant="secondary" size="sm" (click)="exportClaims()">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12.75a.75.75 0 01-.75-.75V3.75a.75.75 0 011.5 0v8.25a.75.75 0 01-.75.75z" />
              <path d="M5.72 8.47a.75.75 0 011.06 0L10 11.69l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L5.72 9.53a.75.75 0 010-1.06z" />
              <path d="M3 13.75a.75.75 0 01.75.75v1.5c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25v-1.5a.75.75 0 011.5 0v1.5A2.75 2.75 0 0115 18.5H5a2.75 2.75 0 01-2.75-2.75v-1.5a.75.75 0 01.75-.75z" />
            </svg>
            Exportar
          </ui-button>
          <ui-button size="sm" (click)="modalOpen.set(true)">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" clip-rule="evenodd" />
            </svg>
            Nuevo siniestro
          </ui-button>
        </div>
      </div>

      <ui-card [padded]="false">
        <div class="flex flex-col gap-3 border-b border-ink-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative w-full sm:max-w-xs">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
            <input type="search" [value]="search()" (input)="onSearch($event)" placeholder="Buscar por ID, cliente o póliza…" class="field-input pl-9" />
          </div>
          <div class="flex items-center gap-2">
            <ui-filter-icon />
            <select class="field-input w-auto" [value]="statusFilter()" (change)="onStatusFilter($event)">
              <option value="all">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en-revision">En revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>
        </div>

        @if (pagedClaims().length === 0) {
          <div class="p-5">
            <ui-empty-state title="No se han encontrado siniestros" description="Prueba a cambiar los filtros o el término de búsqueda." />
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-ink-200 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th class="px-5 py-3 font-medium">ID</th>
                  <th class="px-5 py-3 font-medium">Cliente</th>
                  <th class="px-5 py-3 font-medium">Póliza</th>
                  <th class="px-5 py-3 font-medium">Tipo</th>
                  <th class="px-5 py-3 font-medium">
                    <button type="button" class="focus-ring flex items-center gap-1 hover:text-ink-700" (click)="toggleSort('date')">
                      Fecha
                      <ui-sort-icon />
                    </button>
                  </th>
                  <th class="px-5 py-3 font-medium">
                    <button type="button" class="focus-ring flex items-center gap-1 hover:text-ink-700" (click)="toggleSort('amount')">
                      Importe
                      <ui-sort-icon />
                    </button>
                  </th>
                  <th class="px-5 py-3 font-medium">Gestor</th>
                  <th class="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (claim of pagedClaims(); track claim.id) {
                  <tr class="hover:bg-ink-50/60">
                    <td class="px-5 py-3">
                      <a [routerLink]="['/claims', claim.id]" class="font-medium text-brand-600 hover:text-brand-700">{{ claim.id }}</a>
                    </td>
                    <td class="px-5 py-3">
                      <a [routerLink]="['/customers', claim.customerId]" class="text-ink-700 hover:text-brand-600">{{ customerName(claim.customerId) }}</a>
                    </td>
                    <td class="px-5 py-3 text-ink-500">{{ claim.policyId }}</td>
                    <td class="px-5 py-3 text-ink-600">
                      <span class="inline-flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full" [class]="claimTypeDot[claim.type]"></span>
                        {{ claimTypeLabel[claim.type] }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-ink-500">{{ claim.date | date: 'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3 font-medium text-ink-800">{{ claim.amount | currency: 'EUR' }}</td>
                    <td class="px-5 py-3 text-ink-500">{{ claim.manager }}</td>
                    <td class="px-5 py-3">
                      <ui-badge [tone]="claimMeta(claim.status).tone">{{ claimMeta(claim.status).label }}</ui-badge>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ui-pagination [page]="page()" [pageSize]="pageSize" [total]="filteredClaims().length" (pageChange)="page.set($event)" />
        }
      </ui-card>
    </div>

    <ui-modal [open]="modalOpen()" title="Nuevo siniestro" [hasFooter]="false" (close)="modalOpen.set(false)">
      <app-claim-form (saved)="onSaved($event)" (cancelled)="modalOpen.set(false)" />
    </ui-modal>
  `,
})
export class ClaimsListComponent {
  private readonly data = inject(MockDataService);
  private readonly toast = inject(ToastService);

  protected readonly search = signal('');
  protected readonly statusFilter = signal<'all' | ClaimStatus>('all');
  protected readonly sortKey = signal<SortKey>('date');
  protected readonly sortDir = signal<SortDir>('desc');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly modalOpen = signal(false);
  protected readonly claimMeta = claimStatusMeta;
  protected readonly claimTypeLabel = CLAIM_TYPE_LABEL;
  protected readonly claimTypeDot = CLAIM_TYPE_DOT;

  protected readonly filteredClaims = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    let list = this.data.claims();

    if (status !== 'all') list = list.filter((c) => c.status === status);
    if (term) {
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(term) ||
          c.policyId.toLowerCase().includes(term) ||
          this.customerName(c.customerId).toLowerCase().includes(term),
      );
    }

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const sorted = [...list];
    if (this.sortKey() === 'date') {
      sorted.sort((a, b) => dir * (+new Date(a.date) - +new Date(b.date)));
    } else {
      sorted.sort((a, b) => dir * (a.amount - b.amount));
    }
    return sorted;
  });

  protected readonly pagedClaims = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredClaims().slice(start, start + this.pageSize);
  });

  customerName(customerId: string): string {
    const c = this.data.getCustomerById(customerId);
    return c ? `${c.firstName} ${c.lastName}` : customerId;
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'all' | ClaimStatus);
    this.page.set(1);
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('desc');
    }
  }

  onSaved(claim: Claim): void {
    this.data.addClaim(claim);
    this.modalOpen.set(false);
    this.toast.success('Siniestro creado correctamente');
  }

  exportClaims(): void {
    exportToCsv(
      'siniestros.csv',
      this.filteredClaims().map((c) => ({
        id: c.id,
        cliente: this.customerName(c.customerId),
        poliza: c.policyId,
        tipo: c.type,
        fecha: c.date,
        importe: c.amount,
        estado: c.status,
      })),
    );
    this.toast.info('Exportación completada', 'Se ha descargado el archivo siniestros.csv');
  }
}
