export type ConceptoEstado = 'ACTIVO' | 'SUSPENDIDO';

export interface ConceptoResponse {
  idMotivo: number;
  nombre: string;
  descripcion: string;
  estado: ConceptoEstado;
  fechaCreacion: string;
}

export interface ConceptoRequest {
  nombre: string;
  descripcion: string;
}
