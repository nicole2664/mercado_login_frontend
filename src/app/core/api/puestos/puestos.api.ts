// src/app/core/api/puestos/puestos.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl, API_CONFIG } from '../api.config';
import { Observable } from 'rxjs';
import { Puesto, PuestoDTO } from './puestos.models';

@Injectable({ providedIn: 'root' })
export class PuestosApi {
  private http = inject(HttpClient);

  listar(): Observable<Puesto[]> {
    return this.http.get<Puesto[]>(apiUrl(API_CONFIG.endpoints.puestos));
  }

  crear(dto: PuestoDTO): Observable<Puesto> {
    return this.http.post<Puesto>(apiUrl(API_CONFIG.endpoints.puestos), dto);
  }

  actualizar(idPuesto: number, dto: PuestoDTO): Observable<Puesto> {
    return this.http.put<Puesto>(apiUrl(`${API_CONFIG.endpoints.puestos}/${idPuesto}`), dto);
  }

  eliminar(idPuesto: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`${API_CONFIG.endpoints.puestos}/${idPuesto}`));
  }
}
