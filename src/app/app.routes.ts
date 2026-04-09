import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { LayoutComponent } from './shared/layouts/layout-admin/layout';
import { LayoutCajeroComponent } from './shared/layouts/layout-cajero/layout-cajero';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { Pagos } from './features/admin/pagos/pagos';
import { PagosCajero } from './features/cajero/pagos-cajero/pagos-cajero';
import { RegistrarPago } from './features/cajero/registrar-pago/registrar-pago';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pagos', component: Pagos },
    ],
  },

  {
    path: 'cajero',
    component: LayoutCajeroComponent,
    children: [
      { path: 'pagos', component: PagosCajero },
      { path: 'nuevo-pago', component: RegistrarPago },
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'pagos', pathMatch: 'full' }
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
