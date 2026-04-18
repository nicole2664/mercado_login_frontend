// src/app/core/api/socios/socios.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { apiUrl, API_CONFIG } from '../api.config';
import { Observable } from 'rxjs';
import { SocioBusquedaResponse, SocioDTO, SocioResponse } from './socios.models';

@Injectable({ providedIn: 'root' })
export class SociosApi {
  private http = inject(HttpClient);

  // en SociosApi
  buscarPorDniExacto(dni: string): Observable<SocioBusquedaResponse[]> {
    return this.http.get<SocioBusquedaResponse[]>(
      apiUrl(`${API_CONFIG.endpoints.socios}/buscar-por-dni`),
      { params: { dni } },
    );
  }

  listar(): Observable<SocioResponse[]> {
    return this.http.get<SocioResponse[]>(apiUrl(API_CONFIG.endpoints.socios));
  }

  crear(dto: SocioDTO): Observable<SocioResponse> {
    return this.http.post<SocioResponse>(apiUrl(API_CONFIG.endpoints.socios), dto);
  }

  actualizar(id: number, dto: SocioDTO): Observable<SocioResponse> {
    return this.http.put<SocioResponse>(apiUrl(`${API_CONFIG.endpoints.socios}/${id}`), dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`${API_CONFIG.endpoints.socios}/${id}`));
  }

  buscarPorDniPrefix(prefix: string): Observable<SocioBusquedaResponse[]> {
    const params = new HttpParams().set('dni', prefix);
    return this.http.get<SocioBusquedaResponse[]>(
      apiUrl(`${API_CONFIG.endpoints.socios}/buscar-por-dni`),
      { params },
    );
  }

  obtenerPorDni(dni: string): Observable<SocioResponse> {
    return this.http.get<SocioResponse>(apiUrl(`${API_CONFIG.endpoints.socios}/dni/${dni}`));
  }
}
