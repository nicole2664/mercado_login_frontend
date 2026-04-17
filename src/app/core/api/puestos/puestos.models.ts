// src/app/core/api/puestos/puestos.models.ts
export interface Puesto {
  id: number; // ajusta si tu backend usa idPuesto
  codigo: string;
  descripcion: string;
  estado: boolean;
}

export interface PuestoDTO {
  codigo: string;
  descripcion: string;
}
