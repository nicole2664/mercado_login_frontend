// src/app/core/api/socio-puesto/socio-puesto.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';

export interface SocioPuestoResponse {
  activo: boolean;
  fechaAsignacion: string;
  fechaFin: string | null;
  idSocioPuesto: number;
  puesto: {
    idPuesto: number;
    codigo: string;
    descripcion: string;
    estado: boolean;
    numero: string | null;
    sector: string | null;
  };
  socio: {
    idSocio: number;
    dni: string;
    nombre: string;
    telefono: string;
    email: string | null;
    direccion?: string | null;
    estado?: boolean;
    fechaCreacion?: string;
  };
}

export interface SocioPuestoCountResponse {
  idSocio: number;
  puestosActivos: number;
}

@Injectable({ providedIn: 'root' })
export class SocioPuestoApi {
  private http = inject(HttpClient);

  puestosActivosPorSocio(idSocio: number): Observable<SocioPuestoResponse[]> {
    return this.http.get<SocioPuestoResponse[]>(
      apiUrl(`${API_CONFIG.endpoints.socioPuesto}/socio/${idSocio}/puestos`),
    );
  }

  contadorPuestosActivosPorSocio(): Observable<SocioPuestoCountResponse[]> {
    return this.http.get<SocioPuestoCountResponse[]>(
      apiUrl(`${API_CONFIG.endpoints.socioPuesto}/activos/contador-por-socio`),
    );
  }

}
