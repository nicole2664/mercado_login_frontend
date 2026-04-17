// src/app/core/api/deudas/deudas.models.ts
export interface DeudaPendienteResponse {
  idDeuda: number;
  motivo: string;
  monto: number;
  fecha: string; // ISO
}

export interface DistribuirDeudaRequest {
  // completa según tu DTO real
  [key: string]: any;
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
