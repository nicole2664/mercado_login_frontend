import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { HomeRedirectComponent } from './features/home-redirect/home-redirect';
import { LayoutComponent } from './shared/layout/layout';

import { DashboardComponent } from './features/dashboard/admin/dashboard';
import { DashboardCajaComponent } from './features/dashboard/cajero/dashboard';
import { NotFound } from './features/not-found/not-found';
import { guestGuard } from './core/guards/guest.guard';
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

// ===== REPORTES =====
import { CajaDiariaComponent } from './features/reportes/caja-diaria/caja-diaria';
import { DeudaSocioComponent } from './features/reportes/deudas-socio/deudas-socio';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeRedirectComponent },

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
            data: { roles: ['ADMIN'] },
          },
        ],
      },
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

      // ===== REPORTES =====
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
        children: [
          {
            path: 'flujo-caja',
            component: CajaDiariaComponent,
            canActivate: [roleGuard],
            data: { roles: ['ADMIN', 'CAJERO'] },
          },
          {
            path: 'deudas-socio',
            component: DeudaSocioComponent,
            canActivate: [roleGuard],
            data: { roles: ['ADMIN'] },
          },
        ],
      },

      { path: '**', component: NotFound },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
