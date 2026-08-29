import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { Customer, CustomerStatus } from '../../../core/models/customer.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SortIconComponent } from '../../../shared/components/sort-icon/sort-icon.component';
import { FilterIconComponent } from '../../../shared/components/filter-icon/filter-icon.component';
import { DropdownMenuComponent, DropdownMenuItem } from '../../../shared/components/dropdown-menu/dropdown-menu.component';
import { customerStatusMeta } from '../../../shared/utils/status-styles';
import { exportToCsv } from '../../../shared/utils/csv-export';
import { CustomerFormComponent } from '../customer-form/customer-form.component';

type SortKey = 'name' | 'lastActivity';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 8;

const ROW_ACTIONS: DropdownMenuItem[] = [
  { label: 'Ver detalle', action: 'view', icon: 'view' },
  { label: 'Editar', action: 'edit', icon: 'edit' },
];

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    AvatarComponent,
    PaginationComponent,
    EmptyStateComponent,
    SkeletonComponent,
    ModalComponent,
    DropdownMenuComponent,
    CustomerFormComponent,
    SortIconComponent,
    FilterIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-sm text-ink-500">Gestiona y consulta tu cartera de clientes.</p>
        <div class="flex gap-2">
          <ui-button variant="secondary" size="sm" (click)="exportCustomers()">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12.75a.75.75 0 01-.75-.75V3.75a.75.75 0 011.5 0v8.25a.75.75 0 01-.75.75z" />
              <path d="M5.72 8.47a.75.75 0 011.06 0L10 11.69l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L5.72 9.53a.75.75 0 010-1.06z" />
              <path d="M3 13.75a.75.75 0 01.75.75v1.5c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25v-1.5a.75.75 0 011.5 0v1.5A2.75 2.75 0 0115 18.5H5a2.75 2.75 0 01-2.75-2.75v-1.5a.75.75 0 01.75-.75z" />
            </svg>
            Exportar
          </ui-button>
          <ui-button size="sm" (click)="openCreateModal()">
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 0110 5z" clip-rule="evenodd" />
            </svg>
            Nuevo cliente
          </ui-button>
        </div>
      </div>

      <ui-card [padded]="false">
        <div class="flex flex-col gap-3 border-b border-ink-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative w-full sm:max-w-xs">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
            <input
              type="search"
              [value]="search()"
              (input)="onSearch($event)"
              placeholder="Buscar por nombre, ID o correo…"
              class="field-input pl-9"
            />
          </div>

          <div class="flex items-center gap-2">
            <ui-filter-icon />
            <select class="field-input w-auto" [value]="statusFilter()" (change)="onStatusFilter($event)">
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        @if (loading()) {
          <div class="space-y-3 p-5">
            @for (i of [1, 2, 3, 4, 5]; track i) {
              <ui-skeleton height="2.5rem" />
            }
          </div>
        } @else if (pagedCustomers().length === 0) {
          <div class="p-5">
            <ui-empty-state title="No se han encontrado clientes" description="Prueba a cambiar los filtros o el término de búsqueda." />
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-ink-200 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th class="px-5 py-3 font-medium">
                    <button type="button" class="focus-ring flex items-center gap-1 hover:text-ink-700" (click)="toggleSort('name')">
                      Cliente
                      <ui-sort-icon />
                    </button>
                  </th>
                  <th class="px-5 py-3 font-medium">ID</th>
                  <th class="px-5 py-3 font-medium">Correo electrónico</th>
                  <th class="px-5 py-3 font-medium">Teléfono</th>
                  <th class="px-5 py-3 font-medium">Pólizas</th>
                  <th class="px-5 py-3 font-medium">Estado</th>
                  <th class="px-5 py-3 font-medium">
                    <button type="button" class="focus-ring flex items-center gap-1 hover:text-ink-700" (click)="toggleSort('lastActivity')">
                      Última actividad
                      <ui-sort-icon />
                    </button>
                  </th>
                  <th class="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (customer of pagedCustomers(); track customer.id) {
                  <tr class="hover:bg-ink-50/60">
                    <td class="px-5 py-3">
                      <a [routerLink]="['/customers', customer.id]" class="flex items-center gap-3">
                        <ui-avatar [name]="customer.firstName + ' ' + customer.lastName" tone="soft" size="sm" />
                        <span class="font-medium text-ink-800 hover:text-brand-600">{{ customer.firstName }} {{ customer.lastName }}</span>
                      </a>
                    </td>
                    <td class="px-5 py-3 text-ink-500">{{ customer.id }}</td>
                    <td class="px-5 py-3 text-ink-500">{{ customer.email }}</td>
                    <td class="px-5 py-3 text-ink-500">{{ customer.phone }}</td>
                    <td class="px-5 py-3 text-ink-700">{{ customer.policyIds.length }}</td>
                    <td class="px-5 py-3">
                      <ui-badge [tone]="statusMeta(customer.status).tone">{{ statusMeta(customer.status).label }}</ui-badge>
                    </td>
                    <td class="px-5 py-3 text-ink-500">{{ customer.lastActivity | date: 'dd/MM/yyyy' }}</td>
                    <td class="px-5 py-3">
                      <ui-dropdown-menu [items]="rowActions" (actionSelected)="onRowAction(customer, $event)" />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <ui-pagination [page]="page()" [pageSize]="pageSize" [total]="filteredCustomers().length" (pageChange)="page.set($event)" />
        }
      </ui-card>
    </div>

    <ui-modal [open]="modalOpen()" [title]="editingCustomer() ? 'Editar cliente' : 'Nuevo cliente'" [hasFooter]="false" (close)="closeModal()">
      <app-customer-form [customer]="editingCustomer()" (saved)="onSaved($event)" (cancelled)="closeModal()" />
    </ui-modal>
  `,
})
export class CustomersListComponent {
  private readonly data = inject(MockDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly search = signal('');
  protected readonly statusFilter = signal<'all' | CustomerStatus>('all');
  protected readonly sortKey = signal<SortKey>('name');
  protected readonly sortDir = signal<SortDir>('asc');
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly rowActions = ROW_ACTIONS;
  protected readonly statusMeta = customerStatusMeta;

  protected readonly modalOpen = signal(false);
  protected readonly editingCustomer = signal<Customer | null>(null);

  protected readonly filteredCustomers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    let list = this.data.customers();

    if (status !== 'all') {
      list = list.filter((c) => c.status === status);
    }
    if (term) {
      list = list.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term),
      );
    }

    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const sorted = [...list];
    if (this.sortKey() === 'name') {
      sorted.sort((a, b) => dir * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    } else {
      sorted.sort((a, b) => dir * (+new Date(a.lastActivity) - +new Date(b.lastActivity)));
    }
    return sorted;
  });

  protected readonly pagedCustomers = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredCustomers().slice(start, start + this.pageSize);
  });

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'all' | CustomerStatus);
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

  onRowAction(customer: Customer, action: string): void {
    if (action === 'edit') {
      this.editingCustomer.set(customer);
      this.modalOpen.set(true);
    } else if (action === 'view') {
      this.router.navigate(['/customers', customer.id]);
    }
  }

  openCreateModal(): void {
    this.editingCustomer.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onSaved(customer: Customer): void {
    const isEdit = this.editingCustomer() !== null;
    if (isEdit) {
      this.data.updateCustomer(customer);
    } else {
      this.data.addCustomer(customer);
    }
    this.closeModal();
    this.toast.success(isEdit ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
  }

  exportCustomers(): void {
    exportToCsv(
      'clientes.csv',
      this.filteredCustomers().map((c) => ({
        id: c.id,
        nombre: `${c.firstName} ${c.lastName}`,
        email: c.email,
        telefono: c.phone,
        estado: c.status,
        polizas: c.policyIds.length,
      })),
    );
    this.toast.info('Exportación completada', 'Se ha descargado el archivo clientes.csv');
  }
}
