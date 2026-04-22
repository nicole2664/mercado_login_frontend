import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/auth/auth.service';

import { PagosApi } from '../../../core/api/pagos/pagos.api';
import { SociosApi } from '../../../core/api/socios/socios.api';
import { SocioPuestoApi } from '../../../core/api/socio-puesto/socio-puesto.api';
import { DeudasApi } from '../../../core/api/deudas/deudas.api';

import type { SocioBusquedaResponse } from '../../../core/api/socios/socios.models';
import type { DeudaResponse } from '../../../core/api/deudas/deudas.models';
import type { PagoRequest } from '../../../core/api/pagos/pagos.models';

import { downloadBlob, openPdfInNewTab } from '../../../core/utils/pdf.utils';

interface DeudaUI {
  id: number;
  titulo: string;
  monto: number;
  vencimiento: string;
  seleccionada: boolean;
}

interface SocioUI {
  idSocio: number;
  dni: string;
  nombre: string;
  correo: string;
  puestos: { idPuesto: number; codigo: string; descripcion: string }[];
  deudas: DeudaUI[];
}

@Component({
  selector: 'app-registrar-pago',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pago-nuevo.html',
  styleUrl: './pago-nuevo.css',
})
export class PagoNuevo {
  private router = inject(Router);
  private auth = inject(AuthService);

  private pagosApi = inject(PagosApi);
  private sociosApi = inject(SociosApi);
  private socioPuestoApi = inject(SocioPuestoApi);
  private deudasApi = inject(DeudasApi);

  socioSeleccionado = signal<SocioUI | null>(null);
  puestoSeleccionadoCodigo = signal<string>('');
  puestoSeleccionadoId = signal<number | null>(null);

  metodoPago = signal<string>('Efectivo');
  fechaOperacion = new Date().toLocaleDateString('es-PE');
  mostrarRecibo = signal<boolean>(false);

  // sugerencias para el autocomplete de DNI
  sugerenciasDni = signal<SocioBusquedaResponse[]>([]);
  sugerenciasVisibles = signal<boolean>(false);

  // ========= Enter en DNI: buscar por DNI exacto =========
  onEnterDni(dni: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const limpio = this.filtrarDni(dni);
    if (limpio.length !== 8) return;

    // Para Enter: buscamos por DNI (devuelve lista) y tomamos el primero
    this.seleccionarSocio(limpio);
  }

  // ========= Cambio en input DNI: autocomplete con >= 2 dígitos =========
  onDniInputChange(valor: string) {
    const limpio = this.filtrarDni(valor);

    if (limpio.length < 2) {
      this.sugerenciasDni.set([]);
      this.sugerenciasVisibles.set(false);
      return;
    }

    // Este endpoint devuelve lista (prefijo)
    this.sociosApi.buscarPorDniPrefix(limpio).subscribe({
      next: (lista) => {
        this.sugerenciasDni.set(lista);
        this.sugerenciasVisibles.set(lista.length > 0);
      },
      error: (err) => {
        console.error('Error al autocompletar DNI', err);
        this.sugerenciasDni.set([]);
        this.sugerenciasVisibles.set(false);
      },
    });
  }

  // ========= Click en sugerencia: usar el ID directo (1 request menos) =========
  onSelectSocioSugerencia(s: SocioBusquedaResponse): void {
    console.log('CLICK sugerencia socio =', s);

    this.sugerenciasDni.set([]);
    this.sugerenciasVisibles.set(false);

    // Mejor UX: ya tenemos id/dni/nombreCompleto, no hace falta volver a consultar
    this.seleccionarSocioPorId(s.id, s.dni, s.nombreCompleto);
  }

  // ========= Búsqueda exacta por DNI: el endpoint devuelve Array(1) =========
  seleccionarSocio(dni: string) {
    const limpio = this.filtrarDni(dni);
    if (limpio.length !== 8) return;

    // IMPORTANTE: en tu backend, /buscar-por-dni devuelve LISTA.
    // Por eso tomamos el primer elemento.
    this.sociosApi.buscarPorDniExacto(limpio).subscribe({
      next: (lista: any) => {
        console.log('buscarPorDniExacto response =', lista);

        const socioMin: SocioBusquedaResponse | undefined = Array.isArray(lista) ? lista[0] : lista;

        if (!socioMin?.id) {
          console.error('No se encontró socio exacto para DNI', limpio, lista);
          this.resetSocio();
          return;
        }

        this.seleccionarSocioPorId(socioMin.id, socioMin.dni, socioMin.nombreCompleto);
      },
      error: (err) => {
        console.error('No se encontró socio por DNI', err);
        this.resetSocio();
      },
    });
  }

  // ========= Seleccionar socio por ID (camino principal) =========
  private seleccionarSocioPorId(idSocio: number, dni: string, nombreCompleto: string) {
    if (!idSocio) return;

    const socioUiBase: SocioUI = {
      idSocio,
      dni,
      nombre: nombreCompleto,
      correo: '',
      puestos: [],
      deudas: [],
    };

    this.socioSeleccionado.set(socioUiBase);

    // traer puestos del socio
    this.socioPuestoApi.puestosActivosPorSocio(idSocio).subscribe({
      next: (relaciones) => {
        const puestos = relaciones.map((r) => ({
          idPuesto: r.puesto.idPuesto,
          codigo: r.puesto.codigo,
          descripcion: r.puesto.descripcion,
        }));

        const socioActual = this.socioSeleccionado();
        if (!socioActual) return;

        this.socioSeleccionado.set({ ...socioActual, puestos });

        if (puestos.length > 0) {
          const p0 = puestos[0];
          this.puestoSeleccionadoCodigo.set(p0.codigo);
          this.puestoSeleccionadoId.set(p0.idPuesto);
          this.cargarDeudasPendientes(p0.codigo);
        } else {
          this.puestoSeleccionadoCodigo.set('');
          this.puestoSeleccionadoId.set(null);
          // sin puestos => sin deudas
          this.socioSeleccionado.set({ ...socioActual, deudas: [] });
        }
      },
      error: (err) => {
        console.error('Error al listar puestos del socio', err);
        this.puestoSeleccionadoCodigo.set('');
        this.puestoSeleccionadoId.set(null);
      },
    });
  }

  // ========= Cambio manual de puesto =========
  onPuestoChange(codigo: string) {
    const socio = this.socioSeleccionado();
    if (!socio) return;

    const encontrado = socio.puestos.find((p) => p.codigo === codigo);
    if (!encontrado) return;

    this.puestoSeleccionadoCodigo.set(encontrado.codigo);
    this.puestoSeleccionadoId.set(encontrado.idPuesto);

    this.cargarDeudasPendientes(encontrado.codigo);
  }

  // ========= Cargar deudas pendientes =========
  cargarDeudasPendientes(codigoPuesto: string) {
    if (!codigoPuesto) return;

    this.deudasApi.listarPendientesPorPuesto(codigoPuesto).subscribe({
      next: (deudasBack: DeudaResponse[]) => {
        const socio = this.socioSeleccionado();
        if (!socio) return;

        const deudasUI: DeudaUI[] = deudasBack.map((d) => ({
          id: d.idDeuda,
          titulo: d.motivo,
          monto: Number(d.monto),
          vencimiento: new Date(d.fecha).toLocaleDateString('es-PE'),
          seleccionada: true,
        }));

        this.socioSeleccionado.set({ ...socio, deudas: deudasUI });
      },
      error: (err) => {
        console.error('Error al obtener deudas pendientes', err);
        const socio = this.socioSeleccionado();
        if (socio) this.socioSeleccionado.set({ ...socio, deudas: [] });
      },
    });
  }

  // ========= Computados =========
  deudaTotalPuesto = computed(() => {
    const socio = this.socioSeleccionado();
    if (!socio) return 0;
    return socio.deudas.reduce((acc, d) => acc + d.monto, 0);
  });

  totalACobrar = computed(() => {
    const socio = this.socioSeleccionado();
    if (!socio) return 0;
    return socio.deudas.filter((d) => d.seleccionada).reduce((acc, d) => acc + d.monto, 0);
  });

  toggleDeuda(deudaId: number) {
    const socio = this.socioSeleccionado();
    if (!socio) return;

    const deudas = socio.deudas.map((d) =>
      d.id === deudaId ? { ...d, seleccionada: !d.seleccionada } : d,
    );

    this.socioSeleccionado.set({ ...socio, deudas });
  }

  // ========= Procesar pago =========
  procesarPago() {
    const socio = this.socioSeleccionado();
    const idPuesto = this.puestoSeleccionadoId();
    const codigoPuesto = this.puestoSeleccionadoCodigo();
    const total = this.totalACobrar();

    if (!socio || !idPuesto || !codigoPuesto || total === 0) return;

    const deudasSeleccionadas = socio.deudas.filter((d) => d.seleccionada);
    if (deudasSeleccionadas.length === 0) return;

    const metodo =
      this.metodoPago() === 'Efectivo'
        ? 'EFECTIVO'
        : this.metodoPago() === 'Tarjeta'
          ? 'TRANSFERENCIA'
          : 'YAPE';

    // Backend actual exige idUsuario numérico; AuthService no lo guarda.
    // Por ahora: fallback al cajero (2). Luego lo eliminamos cuando backend tome user del JWT.
    const idUsuario = 2;

    const request: PagoRequest = {
      idPuesto,
      idUsuario,
      fechaOperacion: new Date().toISOString(),
      deudas: deudasSeleccionadas.map((d) => ({ idDeuda: d.id, montoPagado: d.monto })),
      metodosPago: [{ metodo, monto: total }],
    };

    this.pagosApi.registrarPago(request).subscribe({
      next: (comprobante) => {
        console.log('Pago registrado, comprobante:', comprobante);
        this.mostrarRecibo.set(true);
      },
      error: (err) => {
        console.error('Error al procesar pago', err);
        alert(err?.error?.details?.[0] ?? 'Error al procesar el pago.');
      },
    });
  }

  // ========= utilidades =========
  filtrarDni(valor: string): string {
    return valor.replace(/\D/g, '').slice(0, 8);
  }

  imprimirRecibo() {
    window.print();
  }

  cerrarRecibo() {
    this.mostrarRecibo.set(false);
    this.resetSocio();
    this.router.navigate(['/pagos']);
  }

  private resetSocio() {
    this.socioSeleccionado.set(null);
    this.puestoSeleccionadoCodigo.set('');
    this.puestoSeleccionadoId.set(null);
    this.sugerenciasDni.set([]);
    this.sugerenciasVisibles.set(false);
  }
}
