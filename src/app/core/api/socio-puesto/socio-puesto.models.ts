// src/app/core/api/socio-puesto/socio-puesto.models.ts
export interface SocioPuestoDTO {
  idSocio: number;
  idPuesto: number;
  fechaAsignacion?: string; // si aplica
}

export interface SocioPuesto {
  id: number;
  // campos según tu modelo
}
