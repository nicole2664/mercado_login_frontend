// src/app/core/api/pagos/pagos.models.ts
// Estructura típica de Spring Page<>

export interface PagoListadoDto {
  idComprobante: number;
  idRecibo: string;
  fechaPago: string; // LocalDateTime => string ISO
  puesto: string;
  socio: string;
  monto: number; // BigDecimal => number
  estado: string;
  conceptos: string[];
}

export interface PageResponse<T> {
  content: T[];

  totalElements: number;
  totalPages: number;

  size: number;
  number: number;

  first: boolean;
  last: boolean;
  empty: boolean;

  // Spring agrega estos; opcionales para no romper si cambian
  numberOfElements?: number;
  pageable?: unknown;
  sort?: unknown;
}

export type PagoEstado = 'Completado' | 'Pendiente' | 'Anulado' | string;


export interface PagoRequest {
  idPuesto: number;
  idUsuario: number; // <-- AGREGAR
  fechaOperacion?: string; // opcional
  deudas: { idDeuda: number; montoPagado: number }[];
  metodosPago: { metodo: 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'; monto: number }[];
}
