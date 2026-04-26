export interface SerieIngresoMesDTO {
  mes: string;
  total: number;
}

export interface TopDeudorDTO {
  idSocio: number;
  nombre: string;
  totalPendiente: number;
  diasAntigua: number;
  puestos: string;
}

export interface DashboardResponse {
  totalPuestos: number;
  totalAsignaciones: number;
  mesActual: number;
  mesAnterior: number;
  variacionPct: number;
  serieMensual: SerieIngresoMesDTO[];
  deudaVencidaTotal: number;
  deudaVencidaCantidad: number;
  topDeudores: TopDeudorDTO[];
}
