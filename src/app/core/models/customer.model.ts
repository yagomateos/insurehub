export type CustomerStatus = 'activo' | 'inactivo' | 'pendiente';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  status: CustomerStatus;
  policyIds: string[];
  lastActivity: string; // ISO date
  createdAt: string; // ISO date
}

export interface ActivityEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: 'policy' | 'claim' | 'profile' | 'note' | 'status';
}
