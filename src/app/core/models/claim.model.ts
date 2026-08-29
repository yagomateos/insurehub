export type ClaimStatus = 'abierto' | 'en-revision' | 'aprobado' | 'rechazado' | 'cerrado';
export type ClaimType = 'colision' | 'robo' | 'incendio' | 'agua' | 'responsabilidad-civil' | 'asistencia-medica' | 'fallecimiento';

export interface ClaimStatusChange {
  status: ClaimStatus;
  date: string; // ISO date
  actor: string;
  note?: string;
}

export interface ClaimNote {
  id: string;
  author: string;
  date: string; // ISO date
  text: string;
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  sizeKb: number;
  uploadedAt: string;
}

export interface Claim {
  id: string;
  customerId: string;
  policyId: string;
  type: ClaimType;
  date: string; // ISO date
  amount: number;
  manager: string;
  status: ClaimStatus;
  description: string;
  history: ClaimStatusChange[];
  notes: ClaimNote[];
  documents: ClaimDocument[];
}

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  abierto: 'Abierto',
  'en-revision': 'En revisión',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  cerrado: 'Cerrado',
};

export const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  colision: 'Colisión',
  robo: 'Robo',
  incendio: 'Incendio',
  agua: 'Daños por agua',
  'responsabilidad-civil': 'Responsabilidad civil',
  'asistencia-medica': 'Asistencia médica',
  fallecimiento: 'Fallecimiento',
};

export const CLAIM_TIMELINE_STEPS: string[] = [
  'Presentado',
  'En revisión',
  'Evaluación',
  'Aprobado',
  'Cerrado',
];

/** Index reached (0-based) into CLAIM_TIMELINE_STEPS for a given status. -1 for rejected (handled as a distinct terminal state). */
export const CLAIM_STATUS_STEP_RANK: Record<ClaimStatus, number> = {
  abierto: 0,
  'en-revision': 1,
  aprobado: 3,
  cerrado: 4,
  rechazado: -1,
};
