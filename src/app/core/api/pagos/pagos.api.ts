// src/app/core/api/pagos/pagos.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';
import type { PageResponse, PagoListadoDto, PagoRequest } from './pagos.models';

export interface ListarPagosParams {
  q?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class PagosApi {
  private http = inject(HttpClient);

  registrarPago(req: PagoRequest): Observable<any> {
    return this.http.post<any>(apiUrl(API_CONFIG.endpoints.pagos), req);
  }

  listar(params: ListarPagosParams = {}): Observable<PageResponse<PagoListadoDto>> {
    let httpParams = new HttpParams();

    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.from) httpParams = httpParams.set('from', params.from);
    if (params.to) httpParams = httpParams.set('to', params.to);

    httpParams = httpParams.set('page', String(params.page ?? 0));
    httpParams = httpParams.set('size', String(params.size ?? 10));

    return this.http.get<PageResponse<PagoListadoDto>>(apiUrl(API_CONFIG.endpoints.pagos), {
      params: httpParams,
    });
  }
}
