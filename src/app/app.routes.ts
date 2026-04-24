import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { HomeRedirectComponent } from './features/home-redirect/home-redirect';
import { LayoutComponent } from './shared/layout/layout';

import { DashboardComponent } from './features/dashboard/admin/dashboard';
import { DashboardCajaComponent } from './features/dashboard/cajero/dashboard';
import { NotFound } from './features/not-found/not-found';
import { guestGuard } from './core/guards/guest.guard';
import { CajaDiariaComponent } from './features/reportes/caja-diaria/caja-diaria';

import { PagoListar } from './features/pagos/pagos-listar/pago-listar';
import { Conceptos } from './features/conceptos/conceptos';
import { SociosComponent } from './features/socios/socios';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PagoNuevo } from './features/pagos/pagos-register/pago-nuevo';
import { PuestosComponent } from './features/puestos/puestos';
import { SocioPuestoComponent } from './features/socio-puesto/socio-puesto';
import { DeudaListar } from './features/deudas/deudas-listar/deuda-listar';
import { RegistrarDeuda } from './features/deudas/deudas-register/registrar-deuda';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Si entran a "/", manda a /home para que redirija por rol
      { path: '', pathMatch: 'full', redirectTo: 'home' },

      { path: 'home', component: HomeRedirectComponent },

      // Reportes
      {
        path: 'flujo-caja',
        component: CajaDiariaComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
      },

      // Dashboards
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'dashboard-caja',
        component: DashboardCajaComponent,
        canActivate: [roleGuard],
        data: { roles: ['CAJERO'] },
      },

      // Mantenimientos
      {
        path: 'conceptos',
        component: Conceptos,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'socios',
        component: SociosComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
      },
      {
        path: 'puestos',
        component: PuestosComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
      },
      {
        path: 'socio-puesto',
        component: SocioPuestoComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
      },

      // Deudas
      {
        path: 'deudas',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
        children: [
          { path: '', component: DeudaListar },

          {
            path: 'nuevo',
            component: RegistrarDeuda,
            canActivate: [roleGuard],
            // AJUSTA esto según tu regla real:
            // - Si es “solo cajero”: ['CAJERO']
            // - Si es “solo admin”: ['ADMIN']
            data: { roles: ['CAJERO'] },
          },
        ],
      },

      // Pagos
      {
        path: 'pagos',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
        children: [
          { path: '', component: PagoListar },
          {
            path: 'nuevo',
            component: PagoNuevo,
            canActivate: [roleGuard],
            data: { roles: ['CAJERO'] },
          },
        ],
      },

      // Not found dentro del layout
      { path: '**', component: NotFound },
    ],
  },

  // Fallback global: manda al login
  { path: '**', redirectTo: 'login' },
];
