// src/app/core/auth/permissions.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  constructor(private auth: AuthService) {}

  isAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  isCajero(): boolean {
    return this.auth.hasRole('CAJERO');
  }

  // reglas negocio
  canRegisterPayment(): boolean {
    return this.isCajero(); // admin NO registra pagos
  }

  canEditEntities(): boolean {
    return this.isAdmin(); // solo admin edita entidades
  }

  canViewDashboard(): boolean {
    return this.isAdmin();
  }
}
