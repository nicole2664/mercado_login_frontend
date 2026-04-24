export interface DeudaSocioDetalleItem {
  concepto: string;
  monto: number;
}

export interface DeudaSocioDetallePuesto {
  codigo: string;
  deudas: DeudaSocioDetalleItem[];
  subtotal: number;
}

export interface DeudaSocioDetalleResponse {
  idSocio: number;
  nombre: string;
  dni: string;
  email: string;
  cantidadPuestos: number;
  montoTotalPendiente: number;
  puestos: DeudaSocioDetallePuesto[];
}

export interface DeudaSocioItem {
  idSocio: number;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  codigosPuestos: string[];
  cantidadDeudas: number;
  montoTotal: number;
}

export interface DeudaSocioResponse {
  deudaTotalMercado: number;
  totalSociosConDeuda: number;
  totalSocios: number;
  socios: DeudaSocioItem[];
}
