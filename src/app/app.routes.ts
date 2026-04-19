import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { HomeRedirectComponent } from './features/home-redirect/home-redirect';
import { LayoutComponent } from './shared/layout/layout';

import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { PagoListar } from './features/pagos/pagos-listar/pago-listar';
import { Conceptos } from './features/conceptos/conceptos';
import { SociosComponent } from './features/socios/socios';
// import { PuestosComponent } from './features/puestos/puestos';
// import { SocioPuestoComponent } from './features/socio-puesto/socio-puesto';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { PagoNuevo } from './features/pagos/pagos-register/pago-nuevo';
import { PuestosComponent } from './features/puestos/puestos';
import { SocioPuestoComponent } from './features/socio-puesto/socio-puesto';
import { DeudaListar } from './features/deudas/deudas-listar/deuda-listar';
import { RegistrarDeuda } from './features/deudas/deudas-register/registrar-deuda';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Shell autenticado
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Home inteligente
      { path: 'home', component: HomeRedirectComponent },

      // ADMIN only
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
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
          // listado
          { path: '', component: DeudaListar },

          // solo cajero
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
          // listado
          { path: '', component: PagoListar },

          // solo cajero
          {
            path: 'nuevo',
            component: PagoNuevo,
            canActivate: [roleGuard],
            data: { roles: ['CAJERO'] },
          },
        ],
      },

      // default: manda a home (para que redirija por rol)
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
