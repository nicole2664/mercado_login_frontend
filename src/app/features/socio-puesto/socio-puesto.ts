import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import {
  SocioPuestoApi,
  type SocioPuestoResponse,
  type SocioPuestoDTO,
} from '../../core/api/socio-puesto/socio-puesto.api';
import { SociosApi } from '../../core/api/socios/socios.api';
import { PuestosApi } from '../../core/api/puestos/puestos.api';

import type { SocioResponse } from '../../core/api/socios/socios.models';
import type { Puesto } from '../../core/api/puestos/puestos.models';

@Component({
  selector: 'app-socio-puesto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './socio-puesto.html',
  styleUrl: './socio-puesto.css',
})
export class SocioPuestoComponent implements OnInit {
  private socioPuestoApi = inject(SocioPuestoApi);
  private sociosApi = inject(SociosApi);
  private puestosApi = inject(PuestosApi);
  private platformId = inject(PLATFORM_ID);

  // auth
  esAdmin = false;

  // loading
  cargando = signal(false);
  cargandoHistorial = signal(false);

  // data base
  asignaciones = signal<SocioPuestoResponse[]>([]);
  socios = signal<SocioResponse[]>([]);
  puestos = signal<Puesto[]>([]);

  // filtros
  textoBusqueda = signal('');
  filtroSector = signal('');
  fechaDesde = signal(''); // yyyy-mm-dd
  fechaHasta = signal('');

  // modal asignar
  modalAbierto = signal(false);
  guardando = signal(false);
  dto = signal<SocioPuestoDTO>({ idSocio: 0, idPuesto: 0 });

  // modal historial
  modalHistorialAbierto = signal(false);
  puestoSeleccionadoNombre = signal('');
  historial = signal<SocioPuestoResponse[]>([]);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.verificarRol();
    this.cargarDatos();
  }

  verificarRol() {
    const raw = localStorage.getItem('user');
    if (!raw) return;

    try {
      const user = JSON.parse(raw);
      const roles: string[] = user.roles ?? [];
      this.esAdmin = roles.includes('ADMIN') || user.rol === 'ADMIN';
    } catch {
      this.esAdmin = false;
    }
  }

  // sectores disponibles (desde asignaciones activas)
  sectoresDisponibles = computed(() => {
    const set = new Set<string>();
    for (const a of this.asignaciones()) {
      const s = (a.puesto.sector ?? '').trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort();
  });

  // ocupados ids (derivado de asignaciones activas)
  puestosOcupadosIds = computed(() => {
    return new Set(this.asignaciones().map((a) => a.puesto.idPuesto));
  });

  // puestos libres (derivado)
  puestosLibres = computed(() => {
    const ocupados = this.puestosOcupadosIds();
    return this.puestos().filter((p) => !ocupados.has(p.idPuesto));
  });

  // filtrado (sin arrays mutables)
  asignacionesFiltradas = computed(() => {
    let res = this.asignaciones();

    const texto = this.textoBusqueda().toLowerCase().trim();
    if (texto) {
      res = res.filter((a) => {
        const codigo = (a.puesto.codigo ?? '').toLowerCase();
        const sector = (a.puesto.sector ?? '').toLowerCase();
        const socio = (a.socio.nombre ?? '').toLowerCase();
        const dni = a.socio.dni ?? '';
        return (
          codigo.includes(texto) ||
          sector.includes(texto) ||
          socio.includes(texto) ||
          dni.includes(texto)
        );
      });
    }

    const sectorFiltro = this.filtroSector().trim();
    if (sectorFiltro) {
      res = res.filter((a) => (a.puesto.sector ?? '') === sectorFiltro);
    }

    const desde = this.fechaDesde().trim();
    if (desde) {
      res = res.filter((a) => (a.fechaAsignacion ?? '') >= desde);
    }

    const hasta = this.fechaHasta().trim();
    if (hasta) {
      res = res.filter((a) => (a.fechaAsignacion ?? '') <= hasta);
    }

    return res;
  });

  // tarjetas resumen
  totalAsignaciones = computed(() => this.asignaciones().length);
  totalOcupados = computed(() => this.asignaciones().length);
  totalLibres = computed(() => this.puestosLibres().length);

  cargarDatos() {
    this.cargando.set(true);

    forkJoin({
      asignaciones: this.socioPuestoApi.listarActivos(), // ✅ 1 request, no N+1
      socios: this.sociosApi.listar(),
      puestos: this.puestosApi.listar(), // usa /api/puestos (todos) como dejaste backend
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ asignaciones, socios, puestos }) => {
          this.asignaciones.set(asignaciones ?? []);
          this.socios.set(socios ?? []);
          this.puestos.set(puestos ?? []);

          // reset filtros al cargar
          this.textoBusqueda.set('');
          this.filtroSector.set('');
          this.fechaDesde.set('');
          this.fechaHasta.set('');
        },
        error: () => Swal.fire('Error', 'No se pudieron cargar las asignaciones', 'error'),
      });
  }

  // handlers filtros
  onChangeTextoBusqueda(v: string) {
    this.textoBusqueda.set(v);
  }

  onChangeSector(v: string) {
    this.filtroSector.set(v);
  }

  limpiarFechas() {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
  }

  // modal asignar
  abrirModalAsignar() {
    this.dto.set({ idSocio: 0, idPuesto: 0 });
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarAsignacion() {
    const dto = this.dto();
    if (!dto.idSocio || !dto.idPuesto) {
      Swal.fire('Atención', 'Debe seleccionar un socio y un puesto', 'warning');
      return;
    }

    this.guardando.set(true);

    this.socioPuestoApi
      .asignar(dto)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarDatos();
          Swal.fire({
            title: 'Asignado',
            text: 'Socio asignado al puesto correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: (err) =>
          Swal.fire('Error', err?.error?.detalles?.[0] || 'Error al asignar', 'error'),
      });
  }

  // historial
  verHistorial(idPuesto: number, codigoPuesto: string) {
    this.puestoSeleccionadoNombre.set(codigoPuesto);
    this.historial.set([]);
    this.cargandoHistorial.set(true);

    this.socioPuestoApi
      .historialPorPuesto(idPuesto)
      .pipe(finalize(() => this.cargandoHistorial.set(false)))
      .subscribe({
        next: (data) => {
          this.historial.set(data ?? []);
          this.modalHistorialAbierto.set(true);
        },
        error: () => Swal.fire('Error', 'No se pudo cargar el historial', 'error'),
      });
  }

  cerrarHistorial() {
    this.modalHistorialAbierto.set(false);
    this.historial.set([]);
    this.puestoSeleccionadoNombre.set('');
  }

  // desasignar
  desasignar(idSocioPuesto: number) {
    Swal.fire({
      title: '¿Desasignar socio?',
      text: 'El puesto quedará libre',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, desasignar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.socioPuestoApi.desasignar(idSocioPuesto).subscribe({
        next: () => {
          this.cargarDatos();
          Swal.fire({
            title: 'Listo',
            text: 'Socio desasignado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: () => Swal.fire('Error', 'No se pudo desasignar', 'error'),
      });
    });
  }
}
