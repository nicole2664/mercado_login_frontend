import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../api.config';
import type {
  DeudaSocioResponse,
  DeudaSocioDetalleResponse
} from './reporte-deuda-socio.models';

@Injectable({ providedIn: 'root' })
export class ReporteDeudaSocioApi {
  private http = inject(HttpClient);

  getReporte(q?: string): Observable<DeudaSocioResponse> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<DeudaSocioResponse>(
      apiUrl('/reportes/deudas-socio'), { params }
    );
  }

  getDetalle(idSocio: number): Observable<DeudaSocioDetalleResponse> {
    return this.http.get<DeudaSocioDetalleResponse>(
      apiUrl(`/reportes/deudas-socio/${idSocio}/detalle`)
    );
  }
}
