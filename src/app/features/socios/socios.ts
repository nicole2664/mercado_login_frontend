import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, mergeMap, toArray } from 'rxjs/operators';

import { SociosApi } from '../../core/api/socios/socios.api';
import { SocioPuestoApi } from '../../core/api/socio-puesto/socio-puesto.api';

import type { Socio, SocioDTO, SocioResponse } from '../../core/api/socios/socios.models';
import type { SocioPuestoResponse } from '../../core/api/socio-puesto/socio-puesto.api';

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
  socios: SocioResponse[] = [];
  sociosFiltrados: SocioResponse[] = [];

  // UI filtros
  textoBusqueda = '';
  filtroEstado: 'todos' | 'activo' | 'inactivo' = 'todos';

  // Puestos por socio
  puestosPorSocio = new Map<number, number>();
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
  modalPuestosAbierto = false;
  socioSeleccionado: SocioResponse | null = null;
  puestosSocioSeleccionado: SocioPuestoResponse[] = [];

  // Loading general
  cargando = false;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.verificarRol();
    this.cargarSocios();
  }

  private nuevoSocioDTO(): SocioDTO {
    return { nombre: '', dni: '', telefono: '', direccion: '', email: '' };
  }

  verificarRol() {
    // Tu AuthService guarda {username, roles[]} no {rol}.
    // Dejamos ambas compatibilidades por si hay restos antiguos.
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

  // ======== Carga socios ========

  cargarSocios() {
    this.cargando = true;

    this.sociosApi
      .listar()
      .pipe(
        map((lista: Socio[]) =>
          // Normalizamos a SocioResponse para que el HTML pueda usar idSocio
          lista.map(
            (s) =>
              ({
                idSocio: s.id,
                dni: s.dni,
                nombre: s.nombre,
                estado: s.estado,
                telefono: undefined,
                direccion: undefined,
                email: undefined,
                fechaCreacion: undefined,
              }) satisfies SocioResponse,
          ),
        ),
        finalize(() => (this.cargando = false)),
      )
      .subscribe({
        next: (data) => {
          this.socios = data;
          this.textoBusqueda = '';
          this.filtroEstado = 'todos';
          this.paginaActual = 1;

          // Cargar conteo/asignaciones (N+1 controlado)
          this.cargarPuestosPorSocio(data);
        },
        error: () => Swal.fire('Error', 'No se pudieron cargar los socios', 'error'),
      });
  }

  /**
   * N+1 controlado:
   * - Llama /socio-puesto/socio/{id}/puestos por cada socio
   * - Pero con concurrencia limitada (mergeMap with concurrency)
   */
  cargarPuestosPorSocio(socios: SocioResponse[]) {
    this.puestosPorSocio.clear();
    this.asignacionesPorSocio.clear();

    if (socios.length === 0) {
      this.filtrar();
      return;
    }

    const CONCURRENCY = 6; // ajustable

    of(...socios)
      .pipe(
        mergeMap((s) => {
          const idSocio = s.idSocio;
          return this.socioPuestoApi.puestosActivosPorSocio(idSocio).pipe(
            map((asignaciones) => ({ idSocio, asignaciones })),
            catchError(() => of({ idSocio, asignaciones: [] as SocioPuestoResponse[] })),
          );
        }, CONCURRENCY),
        toArray(),
      )
      .subscribe({
        next: (rows) => {
          for (const r of rows) {
            this.puestosPorSocio.set(r.idSocio, r.asignaciones.length);
            this.asignacionesPorSocio.set(r.idSocio, r.asignaciones);
          }
          this.filtrar();
        },
        error: () => {
          // si algo raro pasa, igual filtramos
          this.filtrar();
        },
      });

    // Filtrado inicial mientras llegan asignaciones (evita pantalla vacía)
    this.filtrar();
  }

  // ======== Helpers puestos ========

  getPuestosCount(idSocio: number): number {
    return this.puestosPorSocio.get(idSocio) ?? 0;
  }

  get totalActivos(): number {
    return this.socios.filter((s) => this.getPuestosCount(s.idSocio) > 0).length;
  }

  get totalInactivos(): number {
    return this.socios.filter((s) => this.getPuestosCount(s.idSocio) === 0).length;
  }

  // ======== Modal ver puestos ========

  verPuestosSocio(socio: SocioResponse) {
    this.socioSeleccionado = socio;
    this.puestosSocioSeleccionado = this.asignacionesPorSocio.get(socio.idSocio) ?? [];
    this.modalPuestosAbierto = true;
  }

  cerrarModalPuestos() {
    this.modalPuestosAbierto = false;
    this.socioSeleccionado = null;
    this.puestosSocioSeleccionado = [];
  }

  // ======== Filtros + paginación ========

  setFiltroEstado(estado: 'todos' | 'activo' | 'inactivo') {
    this.filtroEstado = estado;
    this.paginaActual = 1;
    this.filtrar();
  }

  filtrar() {
    let resultado = this.socios;

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

    this.sociosFiltrados = resultado;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.sociosFiltrados.length / this.itemsPorPagina));
  }

  get sociosPaginados(): SocioResponse[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.sociosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
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
