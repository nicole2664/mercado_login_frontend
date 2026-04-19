import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';
import { ConceptoResponse, ConceptoRequest } from './conceptos.models';
import { PageResponse } from '../pagos/pagos.models';

@Injectable({ providedIn: 'root' })
export class ConceptosApi {
  private http = inject(HttpClient);

  listar(q?: string, page = 0, size = 10): Observable<PageResponse<ConceptoResponse>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (q) params = params.set('q', q);

    return this.http.get<PageResponse<ConceptoResponse>>(apiUrl(API_CONFIG.endpoints.conceptos), {
      params,
    });
  }

  // ✅ NUEVO: lista activos para selects (deudas-register)
  listarActivos(): Observable<ConceptoResponse[]> {
    return this.http.get<ConceptoResponse[]>(`${apiUrl(API_CONFIG.endpoints.conceptos)}/activos`);
  }

  registrar(req: ConceptoRequest): Observable<ConceptoResponse> {
    return this.http.post<ConceptoResponse>(apiUrl(API_CONFIG.endpoints.conceptos), req);
  }

  editar(id: number, req: ConceptoRequest): Observable<ConceptoResponse> {
    return this.http.put<ConceptoResponse>(`${apiUrl(API_CONFIG.endpoints.conceptos)}/${id}`, req);
  }

  cambiarEstado(id: number): Observable<ConceptoResponse> {
    return this.http.patch<ConceptoResponse>(
      `${apiUrl(API_CONFIG.endpoints.conceptos)}/${id}/estado`,
      {},
    );
  }

  obtenerConteoActivos(): Observable<number> {
    return this.http.get<number>(`${apiUrl(API_CONFIG.endpoints.conceptos)}/count-activos`);
  }
}
