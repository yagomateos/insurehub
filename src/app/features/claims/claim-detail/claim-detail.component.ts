import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { CLAIM_STATUS_STEP_RANK, CLAIM_TIMELINE_STEPS, CLAIM_TYPE_LABEL } from '../../../core/models/claim.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { claimStatusMeta } from '../../../shared/utils/status-styles';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, ButtonComponent, CardComponent, BadgeComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (claim(); as claim) {
      <div class="space-y-6">
        <ui-card>
          <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-lg font-semibold text-ink-900">Siniestro {{ claim.id }}</h2>
                <ui-badge [tone]="statusMeta(claim.status).tone">{{ statusMeta(claim.status).label }}</ui-badge>
              </div>
              <p class="mt-1 text-sm text-ink-500">
                <a [routerLink]="['/customers', claim.customerId]" class="text-brand-600 hover:text-brand-700">{{ customerName() }}</a>
                · Póliza {{ claim.policyId }} · {{ claimTypeLabel[claim.type] }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              @if (canDecide()) {
                <ui-button variant="secondary" size="sm" (click)="requestInfo()">Solicitar información</ui-button>
                <ui-button variant="danger" size="sm" (click)="reject()">Rechazar</ui-button>
                <ui-button size="sm" (click)="approve()">Aprobar</ui-button>
              }
              @if (claim.status === 'aprobado') {
                <ui-button size="sm" (click)="close()">Cerrar siniestro</ui-button>
              }
            </div>
          </div>
        </ui-card>

        @if (claim.status !== 'rechazado') {
          <ui-card title="Progreso del siniestro">
            <ol class="flex flex-wrap items-center gap-y-4">
              @for (step of timelineSteps; track step; let i = $index; let last = $last) {
                <li class="flex items-center">
                  <div class="flex flex-col items-center gap-1.5">
                    <span
                      class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
                      [class]="i <= stepRank() ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'"
                    >
                      @if (i < stepRank()) {
                        <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" clip-rule="evenodd" /></svg>
                      } @else {
                        {{ i + 1 }}
                      }
                    </span>
                    <span class="w-20 text-center text-xs font-medium" [class]="i <= stepRank() ? 'text-ink-800' : 'text-ink-400'">{{ step }}</span>
                  </div>
                  @if (!last) {
                    <div class="mx-2 h-0.5 w-10 sm:w-16" [class]="i < stepRank() ? 'bg-brand-600' : 'bg-ink-200'"></div>
                  }
                </li>
              }
            </ol>
          </ui-card>
        } @else {
          <div class="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            Este siniestro ha sido rechazado y no admite más acciones.
          </div>
        }

        <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div class="space-y-4 xl:col-span-2">
            <ui-card title="Información del siniestro">
              <dl class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Importe</dt>
                  <dd class="mt-1 text-sm font-medium text-ink-800">{{ claim.amount | currency: 'EUR' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Fecha de creación</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ claim.date | date: 'dd/MM/yyyy' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Gestor asignado</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ claim.manager }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Tipo de siniestro</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ claimTypeLabel[claim.type] }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-xs font-medium uppercase tracking-wide text-ink-400">Descripción</dt>
                  <dd class="mt-1 text-sm text-ink-800">{{ claim.description }}</dd>
                </div>
              </dl>
            </ui-card>

            <ui-card title="Documentación">
              @if (claim.documents.length === 0) {
                <ui-empty-state title="Sin documentación" description="Todavía no se ha adjuntado ningún documento a este siniestro." />
              } @else {
                <ul class="divide-y divide-ink-100">
                  @for (doc of claim.documents; track doc.id) {
                    <li class="flex items-center justify-between py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-9 w-9 items-center justify-center rounded-md bg-ink-100 text-ink-500">
                          <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-ink-800">{{ doc.name }}</p>
                          <p class="text-xs text-ink-500">{{ doc.sizeKb }} KB · {{ doc.uploadedAt | date: 'dd/MM/yyyy' }}</p>
                        </div>
                      </div>
                    </li>
                  }
                </ul>
              }
            </ui-card>

            <ui-card title="Notas">
              @if (claim.notes.length === 0) {
                <ui-empty-state title="Sin notas" description="Todavía no se han añadido notas internas a este siniestro." />
              } @else {
                <ul class="space-y-4">
                  @for (note of claim.notes; track note.id) {
                    <li class="rounded-md bg-ink-50 px-4 py-3">
                      <p class="text-sm text-ink-700">{{ note.text }}</p>
                      <p class="mt-1 text-xs text-ink-400">{{ note.author }} · {{ note.date | date: 'dd/MM/yyyy HH:mm' }}</p>
                    </li>
                  }
                </ul>
              }
            </ui-card>
          </div>

          <div class="space-y-4">
            <ui-card title="Historial de estados">
              <ol class="space-y-4">
                @for (entry of reversedHistory(); track $index) {
                  <li class="flex gap-3">
                    <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500"></span>
                    <div>
                      <p class="text-sm font-medium text-ink-800">{{ statusMeta(entry.status).label }}</p>
                      @if (entry.note) {
                        <p class="text-sm text-ink-500">{{ entry.note }}</p>
                      }
                      <p class="mt-0.5 text-xs text-ink-400">{{ entry.actor }} · {{ entry.date | date: 'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                  </li>
                }
              </ol>
            </ui-card>
          </div>
        </div>
      </div>
    } @else {
      <ui-empty-state title="Siniestro no encontrado" description="El siniestro solicitado no existe o ha sido eliminado." />
    }
  `,
})
export class ClaimDetailComponent {
  readonly id = input.required<string>();

  private readonly data = inject(MockDataService);
  private readonly toast = inject(ToastService);

  protected readonly statusMeta = claimStatusMeta;
  protected readonly claimTypeLabel = CLAIM_TYPE_LABEL;
  protected readonly timelineSteps = CLAIM_TIMELINE_STEPS;

  protected readonly claim = computed(() => this.data.getClaimById(this.id()));
  protected readonly stepRank = computed(() => {
    const claim = this.claim();
    return claim ? CLAIM_STATUS_STEP_RANK[claim.status] : 0;
  });
  protected readonly reversedHistory = computed(() => [...(this.claim()?.history ?? [])].reverse());
  protected readonly canDecide = computed(() => {
    const status = this.claim()?.status;
    return status === 'abierto' || status === 'en-revision';
  });

  customerName(): string {
    const claim = this.claim();
    if (!claim) return '';
    const customer = this.data.getCustomerById(claim.customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : claim.customerId;
  }

  approve(): void {
    this.data.updateClaimStatus(this.id(), 'aprobado');
    this.toast.success('Siniestro aprobado correctamente');
  }

  reject(): void {
    this.data.updateClaimStatus(this.id(), 'rechazado', 'No cumple las condiciones de cobertura de la póliza.');
    this.toast.warning('Siniestro rechazado');
  }

  close(): void {
    this.data.updateClaimStatus(this.id(), 'cerrado');
    this.toast.success('Siniestro cerrado correctamente');
  }

  requestInfo(): void {
    this.toast.info('Solicitud enviada', 'Se ha solicitado información adicional al cliente.');
  }
}
