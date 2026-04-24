import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, apiUrl } from '../api.config';

export interface DashboardOcupacion {
  totalPuestos: number;
  totalAsignaciones: number;
}

export interface SerieIngresoMes {
  mes: string; // "2024-03"
  total: number;
}

export interface DashboardIngresos {
  mesActual: number;
  mesAnterior: number;
  variacionPct: number;
  serieMensual: SerieIngresoMes[];
}

export interface DashboardDeudaVencida {
  montoTotal: number;
  cantidad: number;
}

export interface TopDeudor {
  idSocio: number;
  nombre: string;
  totalPendiente: number;
  diasAntigua: number;
  puestos: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  constructor(private http: HttpClient) {}

  getOcupacion(): Observable<DashboardOcupacion> {
    return this.http.get<DashboardOcupacion>(apiUrl(`${API_CONFIG.endpoints.dashboard}/ocupacion`));
  }

  getIngresos(): Observable<DashboardIngresos> {
    return this.http.get<DashboardIngresos>(apiUrl(`${API_CONFIG.endpoints.dashboard}/ingresos`));
  }

  getDeudaVencida(): Observable<DashboardDeudaVencida> {
    return this.http.get<DashboardDeudaVencida>(
      apiUrl(`${API_CONFIG.endpoints.dashboard}/deuda-vencida`),
    );
  }

  getTopDeudores(): Observable<TopDeudor[]> {
    return this.http.get<TopDeudor[]>(apiUrl(`${API_CONFIG.endpoints.dashboard}/top-deudores`));
  }
}
