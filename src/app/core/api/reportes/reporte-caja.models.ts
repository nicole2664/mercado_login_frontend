export type CajaDiariaItem = {
  idRecibo: string;
  puesto: string;
  metodoPago: string;
  monto: number; // backend BigDecimal -> number
  hora: string;
  conceptos: string[];
};

export type CajaDiariaCards = {
  totalRecaudado: number;
  ingresosEfectivo: number;
  ingresosDigitales: number;
  porMetodo: Partial<Record<'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA', number>>;
};

export type CajaDiariaResponse = {
  fecha: string; // YYYY-MM-DD
  cards: CajaDiariaCards;
  items: CajaDiariaItem[];
};
