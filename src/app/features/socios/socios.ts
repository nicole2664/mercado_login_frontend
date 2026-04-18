import { Component, OnInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SociosApi } from '../../core/api/socios/socios.api';
import {
  SocioPuestoApi,
  type SocioPuestoResponse,
  type SocioPuestoCountResponse,
} from '../../core/api/socio-puesto/socio-puesto.api';

import type { SocioDTO, SocioResponse } from '../../core/api/socios/socios.models';

@Component({
  selector: 'app-socios',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './socios.html',
  styleUrl: './socios.css',
})
export class SociosComponent implements OnInit {
  private sociosApi = inject(SociosApi);
  private socioPuestoApi = inject(SocioPuestoApi);
  private platformId = inject(PLATFORM_ID);

  // Data
  socios = signal<SocioResponse[]>([]);
  sociosFiltrados = signal<SocioResponse[]>([]);

  // UI filtros
  textoBusqueda = '';
  filtroEstado: 'todos' | 'activo' | 'inactivo' = 'todos';

  // Puestos por socio (solo conteo para la tabla)
  puestosPorSocio = new Map<number, number>();

  // Asignaciones (solo para el modal “ver puestos”, se cargan bajo demanda)
  asignacionesPorSocio = new Map<number, SocioPuestoResponse[]>();

  // Paginación (client-side)
  paginaActual = 1;
  itemsPorPagina = 10;

  // Modal crear/editar
  socioActual: SocioDTO = this.nuevoSocioDTO();
  idEditando: number | null = null;
  esAdmin = false;
  modalAbierto = false;
  modoEdicion = false;
  guardando = false;

  // Modal ver puestos
  modalPuestosAbierto = signal(false);
  socioSeleccionado = signal<SocioResponse | null>(null);
  puestosSocioSeleccionado = signal<SocioPuestoResponse[]>([]);
  cargandoPuestosModal = signal(false);

  // Loading general
  cargando = signal(false);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.verificarRol();
    this.cargarSocios(); // ✅ ahora trae socios + conteos en 2 requests (sin N+1)
  }

  private nuevoSocioDTO(): SocioDTO {
    return {
      nombre: '',
      dni: '',
      telefono: '',
      direccion: '',
      email: '',
    };
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

  // ======== Carga socios (sin N+1) ========

  cargarSocios() {
    this.cargando.set(true);

    forkJoin({
      socios: this.sociosApi.listar(), // SocioResponse[]
      counts: this.socioPuestoApi.contadorPuestosActivosPorSocio(), // SocioPuestoCountResponse[]
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ socios, counts }) => {
          // data base
          this.socios.set(socios);
          this.textoBusqueda = '';
          this.filtroEstado = 'todos';
          this.paginaActual = 1;

          // reset conteos y cache de asignaciones
          this.puestosPorSocio.clear();
          this.asignacionesPorSocio.clear();

          // counts solo trae socios con >=1 puesto activo.
          // Los que no están, quedan con 0.
          for (const c of counts) {
            const id = Number(c.idSocio);
            const n = Number(c.puestosActivos ?? 0);
            if (Number.isFinite(id)) this.puestosPorSocio.set(id, n);
          }

          this.filtrar();
        },
        error: () => Swal.fire('Error', 'No se pudieron cargar los socios', 'error'),
      });
  }

  // ======== Helpers puestos ========

  getPuestosCount(idSocio: number): number {
    return this.puestosPorSocio.get(idSocio) ?? 0;
  }

  get totalActivos(): number {
    return this.socios().filter((s) => this.getPuestosCount(s.idSocio) > 0).length;
  }

  get totalInactivos(): number {
    return this.socios().filter((s) => this.getPuestosCount(s.idSocio) === 0).length;
  }

  get totalConMasDeUnPuesto(): number {
    return this.socios().filter((s) => this.getPuestosCount(s.idSocio) > 1).length;
  }

  // ======== Modal ver puestos (cargar bajo demanda) ========
  verPuestosSocio(socio: SocioResponse) {
    this.socioSeleccionado.set(socio);
    console.log('CLICK ver puestos:', socio?.idSocio, socio);
    // Si ya lo tenemos cacheado, lo mostramos de una
    const cached = this.asignacionesPorSocio.get(socio.idSocio);
    if (cached) {
      this.puestosSocioSeleccionado.set(cached);
      this.modalPuestosAbierto.set(true);
      return;
    }



    // Si no, lo traemos del backend y lo cacheamos
    this.cargandoPuestosModal.set(true);
    this.puestosSocioSeleccionado.set([]);
    this.modalPuestosAbierto.set(true);

    this.socioPuestoApi
      .puestosActivosPorSocio(socio.idSocio)
      .pipe(finalize(() => this.cargandoPuestosModal.set(false)))
      .subscribe({
        next: (asig) => {
          // Cache + set data
          this.asignacionesPorSocio.set(socio.idSocio, asig);
          this.puestosSocioSeleccionado.set(asig);

          // ✅ Abrir recién con data lista
          this.modalPuestosAbierto.set(true);
        },
        error: () => {
          // Cache vacío para no reintentar en cada click si el endpoint falla
          this.asignacionesPorSocio.set(socio.idSocio, []);
          this.puestosSocioSeleccionado.set([]);

          // ✅ Igual abrimos, pero ya con estado final (vacío) y no “parpadea”
          this.modalPuestosAbierto.set(true);
        },
      });
  }

  cerrarModalPuestos() {
    this.modalPuestosAbierto.set(false);
    this.socioSeleccionado.set(null);
    this.puestosSocioSeleccionado.set([]);
  }

  // ======== Filtros + paginación ========

  setFiltroEstado(estado: 'todos' | 'activo' | 'inactivo') {
    this.filtroEstado = estado;
    this.paginaActual = 1;
    this.filtrar();
  }

  filtrar() {
    let resultado = this.socios();

    const texto = this.textoBusqueda.toLowerCase().trim();
    if (texto) {
      resultado = resultado.filter(
        (s) =>
          (s.nombre ?? '').toLowerCase().includes(texto) ||
          (s.dni ?? '').includes(texto) ||
          (s.telefono ?? '').includes(texto),
      );
    }

    if (this.filtroEstado === 'activo') {
      resultado = resultado.filter((s) => this.getPuestosCount(s.idSocio) > 0);
    } else if (this.filtroEstado === 'inactivo') {
      resultado = resultado.filter((s) => this.getPuestosCount(s.idSocio) === 0);
    }

    this.sociosFiltrados.set(resultado);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.sociosFiltrados().length / this.itemsPorPagina));
  }

  get sociosPaginados(): SocioResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.sociosFiltrados().slice(inicio, inicio + this.itemsPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(p: number) {
    if (p >= 1 && p <= this.totalPaginas) this.paginaActual = p;
  }

  // ======== Modal crear/editar ========

  soloNumeros(event: Event, campo: 'dni' | 'telefono') {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '');
    input.value = soloDigitos;
    if (campo === 'dni') this.socioActual.dni = soloDigitos;
    if (campo === 'telefono') this.socioActual.telefono = soloDigitos;
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.idEditando = null;
    this.guardando = false;
    this.socioActual = this.nuevoSocioDTO();
    this.modalAbierto = true;
  }

  abrirModalEditar(socio: SocioResponse) {
    this.modoEdicion = true;
    this.idEditando = socio.idSocio;
    this.guardando = false;

    this.socioActual = {
      nombre: socio.nombre,
      dni: socio.dni,
      telefono: socio.telefono ?? '',
      direccion: socio.direccion ?? '',
      email: socio.email ?? '',
    };

    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.guardando = false;
    this.socioActual = this.nuevoSocioDTO();
    this.idEditando = null;
  }

  guardarSocio() {
    if (this.guardando) return;

    if (
      !this.socioActual.nombre?.trim() ||
      !this.socioActual.dni?.trim() ||
      !this.socioActual.telefono?.trim()
    ) {
      Swal.fire('Atención', 'Nombre, DNI y Teléfono son obligatorios', 'warning');
      return;
    }
    if (this.socioActual.dni.length !== 8) {
      Swal.fire('Atención', 'El DNI debe tener exactamente 8 dígitos', 'warning');
      return;
    }
    if (this.socioActual.telefono.length !== 9) {
      Swal.fire('Atención', 'El teléfono debe tener exactamente 9 dígitos', 'warning');
      return;
    }

    this.guardando = true;

    const operacion =
      this.modoEdicion && this.idEditando
        ? this.sociosApi.actualizar(this.idEditando, this.socioActual)
        : this.sociosApi.crear(this.socioActual);

    operacion.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: () => {
        this.cerrarModal();
        // recargar (socios + conteos)
        this.cargarSocios();
        Swal.fire({
          title: this.modoEdicion ? 'Actualizado' : 'Guardado',
          text: `Socio ${this.modoEdicion ? 'actualizado' : 'registrado'} correctamente`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        Swal.fire('Error', err?.error?.detalles?.[0] || 'Error al guardar', 'error');
      },
    });
  }

  eliminarSocio(id: number | undefined) {
    if (!id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'El socio será dado de baja',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.sociosApi.eliminar(id).subscribe({
        next: () => {
          // recargar (socios + conteos)
          this.cargarSocios();
          Swal.fire({
            title: 'Eliminado',
            text: 'El socio ha sido eliminado',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: () => Swal.fire('Error', 'No se pudo eliminar el socio', 'error'),
      });
    });
  }
}
