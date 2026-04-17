// src/app/core/api/deudas/deudas.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';
import type { DeudaResponse } from './deudas.models';

@Injectable({ providedIn: 'root' })
export class DeudasApi {
  private http = inject(HttpClient);

  listarPendientesPorPuesto(codigoPuesto: string): Observable<DeudaResponse[]> {
    return this.http.get<DeudaResponse[]>(
      apiUrl(
        `${API_CONFIG.endpoints.deudas}/puesto/${encodeURIComponent(codigoPuesto)}/pendientes`,
      ),
    );
  }
}
