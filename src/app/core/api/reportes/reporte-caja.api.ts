import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../api.config';
import type { CajaDiariaResponse } from './reporte-caja.models';

@Injectable({ providedIn: 'root' })
export class ReporteCajaApi {
  private http = inject(HttpClient);

  cajaDiaria(fecha?: string): Observable<CajaDiariaResponse> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);

    return this.http.get<CajaDiariaResponse>(apiUrl('/reportes/caja/diario'), { params });
  }

  descargarCsv(fecha?: string): Observable<HttpResponse<Blob>> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);

    return this.http.get(apiUrl('/reportes/caja/diario.csv'), {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }

  descargarXlsx(fecha?: string): Observable<HttpResponse<Blob>> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);

    return this.http.get(apiUrl('/reportes/caja/diario.xlsx'), {
      params,
      responseType: 'blob',
      observe: 'response',
    });
  }
}
