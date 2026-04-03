import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { LayoutComponent } from './components/layouts/layout-admin/layout';
import { LayoutCajeroComponent } from './components/layouts/layout-cajero/layout-cajero';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent }
    ]
  },

  {
    path: 'cajero',
    component: LayoutCajeroComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent }
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login'}
];
