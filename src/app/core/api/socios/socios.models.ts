// src/app/core/api/socios/socios.models.ts
export interface Socio {
  id: number;
  dni: string;
  nombre: string;
  estado: boolean;
}

export interface SocioBusquedaResponse {
  id: number;
  dni: string;
  nombreCompleto: string;
}

export interface SocioResponse {
  idSocio: number;
  dni: string;
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
  estado?: boolean;
  fechaCreacion?: string;
}

export interface SocioDTO {
  dni: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  email?: string;
}
