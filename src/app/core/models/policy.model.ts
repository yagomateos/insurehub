export type PolicyType = 'auto' | 'hogar' | 'salud' | 'vida';
export type PolicyStatus = 'activa' | 'proxima-vencer' | 'cancelada' | 'pendiente';

export interface Policy {
  id: string;
  customerId: string;
  type: PolicyType;
  startDate: string; // ISO date
  renewalDate: string; // ISO date
  premium: number;
  status: PolicyStatus;
}

export const POLICY_TYPE_LABEL: Record<PolicyType, string> = {
  auto: 'Auto',
  hogar: 'Hogar',
  salud: 'Salud',
  vida: 'Vida',
};

export const POLICY_STATUS_LABEL: Record<PolicyStatus, string> = {
  activa: 'Activa',
  'proxima-vencer': 'Próxima a vencer',
  cancelada: 'Cancelada',
  pendiente: 'Pendiente',
};
