// src/app/core/api/deudas/deudas.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';
import type { DeudaListadoResponse, DeudaResponse, DistribuirDeudaRequest } from './deudas.models';

@Injectable({ providedIn: 'root' })
export class DeudasApi {
  private http = inject(HttpClient);

  // ✅ Listado global con filtros (nuevo backend GET /deudas)
  listar(params?: {
    q: string | undefined;
    estado: undefined | 'TODOS' | 'PENDIENTE' | 'PAGADA';
    idMotivo: undefined | number | '';
    fechaDesde: string | undefined;
    fechaHasta: string | undefined;
  }): Observable<DeudaListadoResponse[]> {
    let httpParams = new HttpParams();

    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.idMotivo != null) httpParams = httpParams.set('idMotivo', String(params.idMotivo));
    if (params?.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);

    return this.http.get<DeudaListadoResponse[]>(apiUrl(API_CONFIG.endpoints.deudas), {
      params: httpParams,
    });
  }

  distribuir(dto: DistribuirDeudaRequest): Observable<void> {
    return this.http.post<void>(apiUrl(`${API_CONFIG.endpoints.deudas}/distribuir`), dto);
  }

  // (opcional) Mantener tu endpoint actual de caja
  listarPendientesPorPuesto(codigoPuesto: string): Observable<DeudaResponse[]> {
    return this.http.get<DeudaResponse[]>(
      apiUrl(
        `${API_CONFIG.endpoints.deudas}/puesto/${encodeURIComponent(codigoPuesto)}/pendientes`,
      ),
    );
  }
}
