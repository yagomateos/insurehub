import { BadgeTone } from '../components/badge/badge.component';
import { CustomerStatus } from '../../core/models/customer.model';
import { PolicyStatus, POLICY_STATUS_LABEL } from '../../core/models/policy.model';
import { ClaimStatus, CLAIM_STATUS_LABEL } from '../../core/models/claim.model';

const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  pendiente: 'Pendiente',
};

const CUSTOMER_STATUS_TONE: Record<CustomerStatus, BadgeTone> = {
  activo: 'success',
  inactivo: 'neutral',
  pendiente: 'warning',
};

const POLICY_STATUS_TONE: Record<PolicyStatus, BadgeTone> = {
  activa: 'success',
  'proxima-vencer': 'warning',
  cancelada: 'neutral',
  pendiente: 'info',
};

const CLAIM_STATUS_TONE: Record<ClaimStatus, BadgeTone> = {
  abierto: 'info',
  'en-revision': 'warning',
  aprobado: 'success',
  rechazado: 'danger',
  cerrado: 'neutral',
};

export function customerStatusMeta(status: CustomerStatus): { label: string; tone: BadgeTone } {
  return { label: CUSTOMER_STATUS_LABEL[status], tone: CUSTOMER_STATUS_TONE[status] };
}

export function policyStatusMeta(status: PolicyStatus): { label: string; tone: BadgeTone } {
  return { label: POLICY_STATUS_LABEL[status], tone: POLICY_STATUS_TONE[status] };
}

export function claimStatusMeta(status: ClaimStatus): { label: string; tone: BadgeTone } {
  return { label: CLAIM_STATUS_LABEL[status], tone: CLAIM_STATUS_TONE[status] };
}
