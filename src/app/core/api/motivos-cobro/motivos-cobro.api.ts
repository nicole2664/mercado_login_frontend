// src/app/core/api/motivos-cobro/motivos-cobro.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl, API_CONFIG } from '../api.config';

export interface MotivoCobroResponse {
  idMotivo: number;
  nombre: string;
  descripcion?: string | null;
  estado?: 'ACTIVO' | 'SUSPENDIDO';
  fechaCreacion?: string;
}

@Injectable({ providedIn: 'root' })
export class MotivosCobroApi {
  private http = inject(HttpClient);

  listar(): Observable<MotivoCobroResponse[]> {
    return this.http.get<MotivoCobroResponse[]>(apiUrl(API_CONFIG.endpoints.motivosCobro));
  }
}
