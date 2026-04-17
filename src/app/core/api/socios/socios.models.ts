// src/app/core/api/socios/socios.models.ts
export interface Socio {
  id: number;
  dni: string;
  nombre: string;
  estado: boolean;
}

export interface SocioDTO {
  dni: string;
  nombre: string;
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
  correo?: string;
  telefono?: string;
  puestos: { idPuesto: number; codigo: string; descripcion: string }[];
}
