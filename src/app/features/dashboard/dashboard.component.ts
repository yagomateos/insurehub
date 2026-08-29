import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { DonutChartComponent, DonutSlice } from '../../shared/components/donut-chart/donut-chart.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { claimStatusMeta } from '../../shared/utils/status-styles';
import { CLAIM_TYPE_LABEL } from '../../core/models/claim.model';
import { POLICY_TYPE_LABEL } from '../../core/models/policy.model';

const POLICY_TYPE_COLORS: Record<string, string> = {
  auto: 'var(--color-brand-500)',
  hogar: 'var(--color-success-500)',
  salud: 'var(--color-warning-500)',
  vida: 'var(--color-brand-800)',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, CardComponent, StatCardComponent, LineChartComponent, DonutChartComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <p class="-mt-2 text-sm text-ink-500">Resumen general de tu actividad</p>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ui-stat-card label="Pólizas activas" [value]="formatNumber(kpis.activePolicies.value)" [deltaPct]="kpis.activePolicies.deltaPct" [direction]="kpis.activePolicies.direction" sentiment="positive" iconTone="brand">
          <svg stat-icon class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </ui-stat-card>
        <ui-stat-card label="Clientes" [value]="formatNumber(kpis.customers.value)" [deltaPct]="kpis.customers.deltaPct" [direction]="kpis.customers.direction" sentiment="positive" iconTone="brand">
          <svg stat-icon class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </ui-stat-card>
        <ui-stat-card label="Siniestros abiertos" [value]="formatNumber(kpis.openClaims.value)" [deltaPct]="kpis.openClaims.deltaPct" [direction]="kpis.openClaims.direction" sentiment="positive" iconTone="warning">
          <svg stat-icon class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </ui-stat-card>
        <ui-stat-card label="Siniestros pendientes" [value]="formatNumber(kpis.pendingClaims.value)" [deltaPct]="kpis.pendingClaims.deltaPct" [direction]="kpis.pendingClaims.direction" sentiment="negative" iconTone="warning">
          <svg stat-icon class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </ui-stat-card>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ui-card title="Evolución de siniestros" subtitle="Últimos 12 meses" class="xl:col-span-2">
          <ui-line-chart [data]="monthlyEvolution()" />
        </ui-card>

        <ui-card title="Pólizas por tipo" subtitle="Distribución actual de la cartera">
          <ui-donut-chart [data]="policyTypeSlices()" />
        </ui-card>
      </div>

      <ui-card title="Siniestros recientes" subtitle="Últimos siniestros registrados en la plataforma" [padded]="false">
        <div card-actions>
          <a routerLink="/claims" class="text-sm font-medium text-brand-600 hover:text-brand-700">Ver todos</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-y border-ink-200 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th class="px-5 py-3 font-medium">ID</th>
                <th class="px-5 py-3 font-medium">Cliente</th>
                <th class="px-5 py-3 font-medium">Póliza</th>
                <th class="px-5 py-3 font-medium">Fecha</th>
                <th class="px-5 py-3 font-medium">Importe</th>
                <th class="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-100">
              @for (claim of recentClaims(); track claim.id) {
                <tr class="hover:bg-ink-50/60">
                  <td class="px-5 py-3">
                    <a [routerLink]="['/claims', claim.id]" class="font-medium text-brand-600 hover:text-brand-700">{{ claim.id }}</a>
                  </td>
                  <td class="px-5 py-3 text-ink-700">{{ customerName(claim.customerId) }}</td>
                  <td class="px-5 py-3 text-ink-500">{{ claim.policyId }}</td>
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
    </div>
  `,
})
export class DashboardComponent {
  private readonly data = inject(MockDataService);

  protected readonly kpis = this.data.kpis;
  protected readonly monthlyEvolution = this.data.claimsMonthlyEvolution;
  protected readonly claimMeta = claimStatusMeta;

  protected readonly recentClaims = computed(() => this.data.getRecentClaims(6));

  protected readonly policyTypeSlices = computed<DonutSlice[]>(() =>
    this.data.policiesByType().map((entry) => ({
      label: POLICY_TYPE_LABEL[entry.type],
      value: entry.count,
      color: POLICY_TYPE_COLORS[entry.type],
    })),
  );

  protected customerName(customerId: string): string {
    const customer = this.data.getCustomerById(customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : customerId;
  }

  protected formatNumber(value: number): string {
    return new Intl.NumberFormat('es-ES').format(value);
  }

  protected readonly claimTypeLabel = CLAIM_TYPE_LABEL;
}
