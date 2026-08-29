import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/errors/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: { title: 'Dashboard', breadcrumb: [{ label: 'Dashboard' }] },
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'customers',
        data: { title: 'Clientes', breadcrumb: [{ label: 'Clientes' }] },
        loadComponent: () =>
          import('./features/customers/customers-list/customers-list.component').then((m) => m.CustomersListComponent),
      },
      {
        path: 'customers/:id',
        data: {
          title: 'Detalle del cliente',
          breadcrumb: [{ label: 'Clientes', link: ['/customers'] }, { label: 'Detalle' }],
        },
        loadComponent: () =>
          import('./features/customers/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent),
      },
      {
        path: 'policies',
        data: { title: 'Pólizas', breadcrumb: [{ label: 'Pólizas' }] },
        loadComponent: () =>
          import('./features/policies/policies-list/policies-list.component').then((m) => m.PoliciesListComponent),
      },
      {
        path: 'claims',
        data: { title: 'Siniestros', breadcrumb: [{ label: 'Siniestros' }] },
        loadComponent: () =>
          import('./features/claims/claims-list/claims-list.component').then((m) => m.ClaimsListComponent),
      },
      {
        path: 'claims/:id',
        data: {
          title: 'Detalle del siniestro',
          breadcrumb: [{ label: 'Siniestros', link: ['/claims'] }, { label: 'Detalle' }],
        },
        loadComponent: () =>
          import('./features/claims/claim-detail/claim-detail.component').then((m) => m.ClaimDetailComponent),
      },
      {
        path: 'profile',
        data: { title: 'Mi perfil', breadcrumb: [{ label: 'Mi perfil' }] },
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'settings',
        data: { title: 'Configuración', breadcrumb: [{ label: 'Configuración' }] },
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
