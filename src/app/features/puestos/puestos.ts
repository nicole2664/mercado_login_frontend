import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PuestosApi } from '../../core/api/puestos/puestos.api';
import { SocioPuestoApi } from '../../core/api/socio-puesto/socio-puesto.api';
import type { Puesto, PuestoDTO } from '../../core/api/puestos/puestos.models';

@Component({
  selector: 'app-puestos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './puestos.html',
  styleUrl: './puestos.css',
})
export class PuestosComponent implements OnInit {
  private puestosApi = inject(PuestosApi);
  private socioPuestoApi = inject(SocioPuestoApi);
  private platformId = inject(PLATFORM_ID);

  // Auth
  esAdmin = false;

  // Loading
  cargando = signal(false);

  // Data
  puestos = signal<Puesto[]>([]);
  puestosOcupadosIds = signal<Set<number>>(new Set<number>());

  // UI filtros
  textoBusqueda = signal('');
  filtroEstado = signal<'todos' | 'ocupado' | 'libre'>('todos');
  filtroSector = signal(''); // '' = todos

  // Paginación
  paginaActual = signal(1);
  itemsPorPagina = 10;

  // Modal
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  idEditando = signal<number | null>(null);
  puestoActual = signal<PuestoDTO>(this.nuevoPuestoDTO());

  // Sectores disponibles (derivados de data)
  sectoresDisponibles = computed(() => {
    const sectores = new Set<string>();
    for (const p of this.puestos()) {
      const s = (p.sector ?? '').trim();
      if (s) sectores.add(s);
    }
    return Array.from(sectores).sort();
  });

  // Filtrado reactivo
  puestosFiltrados = computed(() => {
    let res = this.puestos();

    const texto = this.textoBusqueda().toLowerCase().trim();
    if (texto) {
      res = res.filter((p) => {
        const codigo = (p.codigo ?? '').toLowerCase();
        const sector = (p.sector ?? '').toLowerCase();
        const desc = (p.descripcion ?? '').toLowerCase();
        const numero = (p.numero ?? '').toLowerCase();
        return (
          codigo.includes(texto) ||
          sector.includes(texto) ||
          desc.includes(texto) ||
          numero.includes(texto)
        );
      });
    }

    const sectorFiltro = this.filtroSector().trim();
    if (sectorFiltro) {
      res = res.filter((p) => (p.sector ?? '') === sectorFiltro);
    }

    const estado = this.filtroEstado();
    if (estado === 'ocupado') {
      res = res.filter((p) => this.estaOcupado(p.idPuesto));
    } else if (estado === 'libre') {
      res = res.filter((p) => !this.estaOcupado(p.idPuesto));
    }

    return res;
  });

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.puestosFiltrados().length / this.itemsPorPagina)),
  );

  puestosPaginados = computed(() => {
    const page = this.paginaActual();
    const start = (page - 1) * this.itemsPorPagina;
    return this.puestosFiltrados().slice(start, start + this.itemsPorPagina);
  });

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  // Resumen
  totalPuestos = computed(() => this.puestos().length);
  totalOcupados = computed(() => this.puestos().filter((p) => this.estaOcupado(p.idPuesto)).length);
  totalLibres = computed(() => this.totalPuestos() - this.totalOcupados());
  porcentajeOcupacion = computed(() => {
    const total = this.totalPuestos();
    return total === 0 ? 0 : Math.round((this.totalOcupados() / total) * 100);
  });

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.verificarRol();
    this.cargarPuestos();
  }

  private nuevoPuestoDTO(): PuestoDTO {
    return { codigo: '', sector: '', numero: '', descripcion: '' };
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

  cargarPuestos() {
    this.cargando.set(true);

    forkJoin({
      puestos: this.puestosApi.listar(),
      ocupados: this.socioPuestoApi.obtenerPuestosOcupados(),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ puestos, ocupados }) => {
          this.puestos.set(puestos);
          this.puestosOcupadosIds.set(new Set(ocupados ?? []));

          // reset UI
          this.textoBusqueda.set('');
          this.filtroEstado.set('todos');
          this.filtroSector.set('');
          this.paginaActual.set(1);
        },
        error: () => Swal.fire('Error', 'No se pudieron cargar los puestos', 'error'),
      });
  }

  estaOcupado(idPuesto: number): boolean {
    return this.puestosOcupadosIds().has(idPuesto);
  }

  // UI handlers
  setFiltroEstado(estado: 'todos' | 'ocupado' | 'libre') {
    this.filtroEstado.set(estado);
    this.paginaActual.set(1);
  }

  onChangeTextoBusqueda(value: string) {
    this.textoBusqueda.set(value);
    this.paginaActual.set(1);
  }

  onChangeSector(value: string) {
    this.filtroSector.set(value);
    this.paginaActual.set(1);
  }

  cambiarPagina(p: number) {
    if (p >= 1 && p <= this.totalPaginas()) this.paginaActual.set(p);
  }

  // Modal
  abrirModalNuevo() {
    this.modoEdicion.set(false);
    this.idEditando.set(null);
    this.guardando.set(false);
    this.puestoActual.set(this.nuevoPuestoDTO());
    this.modalAbierto.set(true);
  }

  abrirModalEditar(puesto: Puesto) {
    this.modoEdicion.set(true);
    this.idEditando.set(puesto.idPuesto);
    this.guardando.set(false);
    this.puestoActual.set({
      codigo: puesto.codigo,
      sector: puesto.sector ?? '',
      numero: puesto.numero ?? '',
      descripcion: puesto.descripcion ?? '',
    });
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.guardando.set(false);
    this.puestoActual.set(this.nuevoPuestoDTO());
    this.idEditando.set(null);
  }

  guardarPuesto() {
    if (this.guardando()) return;

    const dto = this.puestoActual();

    if (!dto.codigo?.trim()) {
      Swal.fire('Atención', 'El código del puesto es obligatorio', 'warning');
      return;
    }

    this.guardando.set(true);

    const req =
      this.modoEdicion() && this.idEditando()
        ? this.puestosApi.actualizar(this.idEditando()!, dto)
        : this.puestosApi.crear(dto);

    req.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarPuestos();
        Swal.fire({
          title: this.modoEdicion() ? 'Actualizado' : 'Guardado',
          text: `Puesto ${this.modoEdicion() ? 'actualizado' : 'registrado'} correctamente`,
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

  eliminarPuesto(idPuesto: number | undefined) {
    if (!idPuesto) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'El puesto será inhabilitado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.puestosApi.eliminar(idPuesto).subscribe({
        next: () => {
          this.cargarPuestos();
          Swal.fire({
            title: 'Eliminado',
            text: 'El puesto ha sido eliminado',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: () => Swal.fire('Error', 'No se pudo eliminar el puesto', 'error'),
      });
    });
  }
}
