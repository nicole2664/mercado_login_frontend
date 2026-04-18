// src/app/core/api/deudas/deudas.models.ts
export interface DeudaPendienteResponse {
  idDeuda: number;
  motivo: string;
  monto: number;
  fecha: string; // ISO
}

export interface DistribuirDeudaRequest {
  idMotivo: number;
  montoTotal: number;
  fecha?: string; // yyyy-mm-dd
  codigosPuestos?: string[]; // si no mandas => backend usa todos
}

export interface MismaDeudaRequest {
  // completa según tu DTO real
  [key: string]: any;
}

export interface DeudaResponse {
  idDeuda: number;
  motivo: string;
  monto: number;
  fecha: string; // yyyy-mm-dd o ISO
  estado: 'PENDIENTE' | 'PAGADA' | string;
}

export interface DeudaListadoResponse {
  idDeuda: number;
  codigoPuesto: string;
  idPuesto: number;
  idMotivo: number;
  motivoNombre: string;
  monto: number;
  fecha: string; // yyyy-mm-dd
  estado: 'PENDIENTE' | 'PAGADA';

  idSocio: number | null;
  socioNombre: string | null;
  socioDni: string | null;
  socioEmail: string | null;
}
