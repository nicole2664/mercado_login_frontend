export interface Transaccion {
  id?: number;
  fecha: string;
  hora: string;
  puestoId: string;
  inquilino: string;
  concepto: string;
  monto: number;
  metodoPago: string;
  idRecibo: string;
}
