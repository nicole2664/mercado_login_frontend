// src/app/core/api/puestos/puestos.models.ts
export interface Puesto {
  idPuesto: number;
  codigo: string;
  sector?: string | null;
  numero?: string | null;
  descripcion?: string | null;
  estado: boolean;
}

export interface PuestoDTO {
  codigo: string;
  sector?: string;
  numero?: string;
  descripcion?: string;
}
