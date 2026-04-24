// src/app/core/api/dashboard/cajero/dashboard-caja.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardCajaDto {
  recaudacionHoy: number;
  recaudacionAyer: number;
  transaccionesHoy: number;
  alertasPendientes: number;
  ingresosSemana: { dia: string; total: number }[];
  pagosRecientes: { puesto: string; monto: number; hora: string; cobrador: string }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardCajaApi {
  private url = '/api/dashboard/caja';

  // Signal para el componente
  dashboardCajaSignal = signal<DashboardCajaDto | undefined>(undefined);

  constructor(private http: HttpClient) {}

  fetchDashboardCaja(): Observable<DashboardCajaDto> {
    return this.http.get<DashboardCajaDto>(this.url);
  }

  fetchDashboardCajaSignal() {
    // Actualiza la signal desde backend
    this.fetchDashboardCaja().subscribe({
      next: (data) => this.dashboardCajaSignal.set(data),
      error: (err) => {
        console.error('Error al cargar Dashboard Caja:', err);
      },
    });
  }
}
