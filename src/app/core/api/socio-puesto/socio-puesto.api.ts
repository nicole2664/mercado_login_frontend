// src/app/core/api/socio-puesto/socio-puesto.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';
import { DistribuirDeudaRequest } from '../deudas/deudas.models';

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

export interface SocioPuestoDTO {
  idSocio: number;
  idPuesto: number;
}

@Injectable({ providedIn: 'root' })
export class SocioPuestoApi {
  private http = inject(HttpClient);

  // ✅ NUEVO: lista asignaciones activas
  listarActivos(): Observable<SocioPuestoResponse[]> {
    return this.http.get<SocioPuestoResponse[]>(
      apiUrl(`${API_CONFIG.endpoints.socioPuesto}/activos`),
    );
  }

  // ✅ Crear asignación
  asignar(dto: SocioPuestoDTO): Observable<SocioPuestoResponse> {
    return this.http.post<SocioPuestoResponse>(apiUrl(API_CONFIG.endpoints.socioPuesto), dto);
  }

  // ✅ Desasignar
  desasignar(idSocioPuesto: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`${API_CONFIG.endpoints.socioPuesto}/${idSocioPuesto}`));
  }

  // ✅ Historial por puesto
  historialPorPuesto(idPuesto: number): Observable<SocioPuestoResponse[]> {
    return this.http.get<SocioPuestoResponse[]>(
      apiUrl(`${API_CONFIG.endpoints.socioPuesto}/puesto/${idPuesto}/historial`),
    );
  }

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

  obtenerPuestosOcupados(): Observable<number[]> {
    return this.http.get<number[]>(apiUrl(`${API_CONFIG.endpoints.socioPuesto}/ocupados`));
  }

  distribuir(dto: DistribuirDeudaRequest): Observable<void> {
    return this.http.post<void>(apiUrl(`${API_CONFIG.endpoints.deudas}/distribuir`), dto);
  }

  // puestosOcupadosActivos(): Observable<number[]> {
  //   return this.http.get<number[]>(
  //     apiUrl(`${API_CONFIG.endpoints.socioPuesto}/activos/puestos-ocupados`),
  //   );
  // }
}
