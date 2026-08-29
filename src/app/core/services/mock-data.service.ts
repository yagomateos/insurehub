import { Injectable, computed, signal } from '@angular/core';
import { ActivityEntry, Customer, CustomerStatus } from '../models/customer.model';
import { Policy, PolicyStatus, PolicyType } from '../models/policy.model';
import { Claim, ClaimStatus, ClaimType } from '../models/claim.model';

/** Deterministic PRNG so the seeded dataset is stable across reloads within a session. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'María', 'Carlos', 'Lucía', 'Javier', 'Elena', 'David', 'Sofía', 'Pablo', 'Ana', 'Diego',
  'Marta', 'Sergio', 'Laura', 'Alejandro', 'Carmen', 'Miguel', 'Isabel', 'Adrián', 'Cristina', 'Raúl',
  'Patricia', 'Fernando', 'Beatriz', 'Rubén', 'Nuria', 'Andrés', 'Silvia', 'Iván', 'Rosa', 'Óscar',
  'Paula', 'Manuel', 'Alicia', 'Jorge', 'Teresa', 'Víctor', 'Eva', 'Gonzalo', 'Sara', 'Enrique',
];
const LAST_NAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Muñoz', 'Romero', 'Alonso', 'Gutiérrez',
  'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Serrano', 'Blanco', 'Suárez', 'Molina',
];
const CITIES = [
  { city: 'Madrid', postal: '28001' },
  { city: 'Barcelona', postal: '08001' },
  { city: 'Valencia', postal: '46001' },
  { city: 'Sevilla', postal: '41001' },
  { city: 'Bilbao', postal: '48001' },
  { city: 'Málaga', postal: '29001' },
  { city: 'Zaragoza', postal: '50001' },
  { city: 'Alicante', postal: '03001' },
  { city: 'Murcia', postal: '30001' },
  { city: 'Valladolid', postal: '47001' },
];
const STREETS = [
  'Calle Mayor', 'Avenida de la Constitución', 'Calle Alcalá', 'Paseo de Gracia', 'Gran Vía',
  'Calle Serrano', 'Avenida Diagonal', 'Calle San Fernando', 'Calle Larios', 'Calle Colón',
];
const MANAGERS = ['Yago Mateos', 'Beatriz Campos', 'Iván Torres', 'Marta Reyes', 'Alejandro Ruiz'];

const POLICY_TYPES: PolicyType[] = ['auto', 'hogar', 'salud', 'vida'];
const CLAIM_TYPES_BY_POLICY: Record<PolicyType, ClaimType[]> = {
  auto: ['colision', 'robo', 'responsabilidad-civil'],
  hogar: ['incendio', 'agua', 'robo'],
  salud: ['asistencia-medica'],
  vida: ['fallecimiento'],
};

const CUSTOMER_COUNT = 64;
const MONTHS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly seed = 20260829;

  private readonly _customers = signal<Customer[]>([]);
  private readonly _policies = signal<Policy[]>([]);
  private readonly _claims = signal<Claim[]>([]);

  readonly customers = this._customers.asReadonly();
  readonly policies = this._policies.asReadonly();
  readonly claims = this._claims.asReadonly();

  /** Company-wide KPI totals shown on the dashboard cards (headline figures for a firm this size). */
  readonly kpis = {
    activePolicies: { value: 1248, deltaPct: 4.2, direction: 'up' as const },
    customers: { value: 3842, deltaPct: 2.8, direction: 'up' as const },
    openClaims: { value: 86, deltaPct: -3.5, direction: 'down' as const },
    pendingClaims: { value: 24, deltaPct: 6.1, direction: 'up' as const },
  };

  readonly claimsMonthlyEvolution = computed(() => {
    const now = new Date();
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { label: MONTHS_ES[d.getMonth()], count: 0 };
    });
    const rng = mulberry32(this.seed + 7);
    // Base seasonal curve so the chart looks like real claim volume, not noise.
    return buckets.map((b, i) => ({
      ...b,
      count: Math.round(48 + Math.sin(i / 2) * 14 + rng() * 20),
    }));
  });

  readonly policiesByType = computed(() => {
    const counts: Record<PolicyType, number> = { auto: 0, hogar: 0, salud: 0, vida: 0 };
    for (const p of this._policies()) counts[p.type]++;
    const total = this._policies().length || 1;
    return POLICY_TYPES.map((type) => ({
      type,
      count: counts[type],
      pct: Math.round((counts[type] / total) * 1000) / 10,
    }));
  });

  constructor() {
    this.seedData();
  }

  getCustomerById(id: string): Customer | undefined {
    return this._customers().find((c) => c.id === id);
  }

  getPolicyById(id: string): Policy | undefined {
    return this._policies().find((p) => p.id === id);
  }

  getClaimById(id: string): Claim | undefined {
    return this._claims().find((c) => c.id === id);
  }

  getPoliciesForCustomer(customerId: string): Policy[] {
    return this._policies().filter((p) => p.customerId === customerId);
  }

  getClaimsForCustomer(customerId: string): Claim[] {
    return this._claims().filter((c) => c.customerId === customerId);
  }

  getRecentClaims(limit = 6): Claim[] {
    return [...this._claims()]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, limit);
  }

  getActivityForCustomer(customerId: string): ActivityEntry[] {
    const policies = this.getPoliciesForCustomer(customerId);
    const claims = this.getClaimsForCustomer(customerId);
    const entries: ActivityEntry[] = [];

    for (const p of policies) {
      entries.push({
        id: `act-${p.id}-created`,
        date: p.startDate,
        title: 'Póliza contratada',
        description: `Se dio de alta la póliza ${p.id}.`,
        icon: 'policy',
      });
    }
    for (const c of claims) {
      entries.push({
        id: `act-${c.id}-created`,
        date: c.date,
        title: 'Siniestro presentado',
        description: `Se registró el siniestro ${c.id}.`,
        icon: 'claim',
      });
      const last = c.history.at(-1);
      if (last && last.status !== 'abierto') {
        entries.push({
          id: `act-${c.id}-status`,
          date: last.date,
          title: 'Actualización de siniestro',
          description: `El siniestro ${c.id} cambió de estado.`,
          icon: 'status',
        });
      }
    }
    return entries.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }

  addCustomer(customer: Customer): void {
    this._customers.update((list) => [customer, ...list]);
  }

  updateCustomer(customer: Customer): void {
    this._customers.update((list) => list.map((c) => (c.id === customer.id ? customer : c)));
  }

  addPolicy(policy: Policy): void {
    this._policies.update((list) => [policy, ...list]);
    this._customers.update((list) =>
      list.map((c) =>
        c.id === policy.customerId ? { ...c, policyIds: [...c.policyIds, policy.id] } : c,
      ),
    );
  }

  addClaim(claim: Claim): void {
    this._claims.update((list) => [claim, ...list]);
  }

  updateClaimStatus(claimId: string, status: ClaimStatus, note?: string): void {
    this._claims.update((list) =>
      list.map((c) => {
        if (c.id !== claimId) return c;
        return {
          ...c,
          status,
          history: [
            ...c.history,
            { status, date: new Date().toISOString(), actor: 'Yago Mateos', note },
          ],
        };
      }),
    );
  }

  private seedData(): void {
    const rng = mulberry32(this.seed);
    const customers: Customer[] = [];
    const policies: Policy[] = [];
    const claims: Claim[] = [];

    const statusPool: CustomerStatus[] = ['activo', 'activo', 'activo', 'inactivo', 'pendiente'];
    let claimSeq = 10000 + Math.floor(rng() * 200);

    for (let i = 0; i < CUSTOMER_COUNT; i++) {
      const first = pick(rng, FIRST_NAMES);
      const last1 = pick(rng, LAST_NAMES);
      const last2 = pick(rng, LAST_NAMES);
      const location = pick(rng, CITIES);
      const status = pick(rng, statusPool);
      const id = `CUS-${String(1000 + i)}`;
      const createdDaysAgo = 40 + Math.floor(rng() * 900);

      const customer: Customer = {
        id,
        firstName: first,
        lastName: `${last1} ${last2}`,
        email: `${first.toLowerCase()}.${last1.toLowerCase()}@ejemplo.com`.replace(/[^\w.@]/g, ''),
        phone: `6${Math.floor(10000000 + rng() * 89999999)}`,
        address: `${pick(rng, STREETS)}, ${Math.floor(1 + rng() * 200)}`,
        city: location.city,
        postalCode: location.postal,
        status,
        policyIds: [],
        lastActivity: daysAgo(Math.floor(rng() * 60)),
        createdAt: daysAgo(createdDaysAgo),
      };
      customers.push(customer);

      const policyCount = 1 + Math.floor(rng() * 3);
      const usedTypes = new Set<PolicyType>();
      for (let j = 0; j < policyCount; j++) {
        let type = pick(rng, POLICY_TYPES);
        let guard = 0;
        while (usedTypes.has(type) && guard < 5) {
          type = pick(rng, POLICY_TYPES);
          guard++;
        }
        usedTypes.add(type);

        const startDaysAgo = 20 + Math.floor(rng() * 700);
        const renewalInDays = Math.floor(rng() * 400) - 60; // some already past->cancelled/renewed, some upcoming
        const policyId = `POL-${String(5000 + policies.length)}`;
        const renewalDate = daysFromNow(renewalInDays);

        let policyStatus: PolicyStatus;
        if (renewalInDays < 0) {
          policyStatus = rng() > 0.3 ? 'cancelada' : 'activa';
        } else if (renewalInDays < 30) {
          policyStatus = 'proxima-vencer';
        } else {
          policyStatus = rng() > 0.92 ? 'pendiente' : 'activa';
        }

        const basePremium = { auto: 480, hogar: 320, salud: 850, vida: 610 }[type];
        const premium = Math.round((basePremium + rng() * 300) * 100) / 100;

        const policy: Policy = {
          id: policyId,
          customerId: customer.id,
          type,
          startDate: daysAgo(startDaysAgo),
          renewalDate,
          premium,
          status: policyStatus,
        };
        policies.push(policy);
        customer.policyIds.push(policyId);

        const claimChance = rng();
        const claimCount = claimChance > 0.55 ? (claimChance > 0.85 ? 2 : 1) : 0;
        for (let k = 0; k < claimCount; k++) {
          const claimDaysAgo = Math.floor(rng() * Math.min(startDaysAgo, 300));
          const claimType = pick(rng, CLAIM_TYPES_BY_POLICY[type]);
          const claimId = `CLM-${claimSeq++}`;

          const statusRoll = rng();
          let status: ClaimStatus;
          if (statusRoll < 0.18) status = 'abierto';
          else if (statusRoll < 0.36) status = 'en-revision';
          else if (statusRoll < 0.5) status = 'rechazado';
          else if (statusRoll < 0.7) status = 'aprobado';
          else status = 'cerrado';

          const baseAmount = { auto: 1800, hogar: 2400, salud: 900, vida: 15000 }[type];
          const amount = Math.round((baseAmount * (0.3 + rng() * 1.4)) * 100) / 100;

          const filedDate = daysAgo(claimDaysAgo);
          const history = this.buildHistory(filedDate, status, rng);

          claims.push({
            id: claimId,
            customerId: customer.id,
            policyId: policy.id,
            type: claimType,
            date: filedDate,
            amount,
            manager: pick(rng, MANAGERS),
            status,
            description: this.buildClaimDescription(claimType),
            history,
            notes:
              rng() > 0.5
                ? [
                    {
                      id: `${claimId}-note-1`,
                      author: pick(rng, MANAGERS),
                      date: daysAgo(Math.max(0, claimDaysAgo - 2)),
                      text: 'Se ha contactado con el cliente para solicitar documentación adicional.',
                    },
                  ]
                : [],
            documents:
              rng() > 0.4
                ? [
                    {
                      id: `${claimId}-doc-1`,
                      name: 'parte-siniestro.pdf',
                      type: 'pdf',
                      sizeKb: 220 + Math.floor(rng() * 900),
                      uploadedAt: filedDate,
                    },
                  ]
                : [],
          });
        }
      }
    }

    this._customers.set(customers);
    this._policies.set(policies);
    this._claims.set(claims);
  }

  private buildHistory(
    filedDate: string,
    finalStatus: ClaimStatus,
    rng: () => number,
  ): Claim['history'] {
    const order: ClaimStatus[] = ['abierto', 'en-revision', 'aprobado', 'cerrado'];
    const history: Claim['history'] = [
      { status: 'abierto', date: filedDate, actor: 'Cliente', note: 'Siniestro presentado por el cliente.' },
    ];

    if (finalStatus === 'abierto') return history;

    const filedTime = +new Date(filedDate);
    const now = Date.now();
    const step = (now - filedTime) / 4;

    if (finalStatus === 'rechazado') {
      history.push({
        status: 'en-revision',
        date: new Date(filedTime + step).toISOString(),
        actor: pick(rng, MANAGERS),
      });
      history.push({
        status: 'rechazado',
        date: new Date(filedTime + step * 2).toISOString(),
        actor: pick(rng, MANAGERS),
        note: 'No cumple las condiciones de cobertura de la póliza.',
      });
      return history;
    }

    const targetIndex = order.indexOf(finalStatus);
    for (let i = 1; i <= targetIndex; i++) {
      history.push({
        status: order[i],
        date: new Date(filedTime + step * i).toISOString(),
        actor: pick(rng, MANAGERS),
      });
    }
    return history;
  }

  private buildClaimDescription(type: ClaimType): string {
    const map: Record<ClaimType, string> = {
      colision: 'Colisión frontal en vía urbana con daños en el vehículo asegurado.',
      robo: 'Sustracción del vehículo/bienes del domicilio asegurado.',
      incendio: 'Incendio con daños materiales en la vivienda asegurada.',
      agua: 'Daños por filtración de agua procedentes de la vivienda superior.',
      'responsabilidad-civil': 'Daños a terceros derivados de un incidente cubierto por la póliza.',
      'asistencia-medica': 'Atención médica derivada de un episodio cubierto por la póliza de salud.',
      fallecimiento: 'Solicitud de prestación por fallecimiento del asegurado.',
    };
    return map[type];
  }
}
