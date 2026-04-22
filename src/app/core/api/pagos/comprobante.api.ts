import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';

@Injectable({ providedIn: 'root' })
export class ComprobanteApi {
  private http = inject(HttpClient);

  /**
   * Descarga el PDF como Blob.
   * El authInterceptor ya adjunta Authorization: Bearer <token>.
   */
  getComprobantePdf(idRecibo: number): Observable<Blob> {
    const url = apiUrl(`${API_CONFIG.endpoints.pagos}/${idRecibo}/comprobante.pdf`);
    return this.http.get(url, { responseType: 'blob' });
  }
}
