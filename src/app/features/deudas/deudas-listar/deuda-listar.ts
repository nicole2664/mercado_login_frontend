import { Component, signal, inject, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { PaginationService } from '../../../core/services/pagination';
import { PermissionsService } from '../../../core/auth/permissions.service';

import { DeudasApi } from '../../../core/api/deudas/deudas.api';
import type { DeudaListadoResponse } from '../../../core/api/deudas/deudas.models';
import {
  MotivosCobroApi,
  type MotivoCobroResponse,
} from '../../../core/api/motivos-cobro/motivos-cobro.api';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-deudas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Pagination],
  templateUrl: './deuda-listar.html',
  styleUrl: './deuda-listar.css',
})
export class DeudaListar implements OnInit {
  authz = inject(PermissionsService);
  private paginationService = inject(PaginationService);
  private deudasApi = inject(DeudasApi);
  private motivosApi = inject(MotivosCobroApi);
  private destroyRef = inject(DestroyRef);

  // UI state
  cargando = signal(false);

  // data
  deudas = signal<DeudaListadoResponse[]>([]);
  motivos = signal<MotivoCobroResponse[]>([]);

  // modales
  mostrarDetalle = signal(false);
  deudaSeleccionada = signal<DeudaListadoResponse | null>(null);

  mostrarEditor = signal(false);
  deudaAEditar = signal<DeudaListadoResponse | null>(null);

  mostrarConfirmarEliminar = signal(false);
  deudaParaEliminar = signal<DeudaListadoResponse | null>(null);

  // filtros
  searchTerm = signal('');
  filtroMotivoId = signal<number | ''>('');
  filtroEstado = signal<'TODOS' | 'PENDIENTE' | 'PAGADA'>('TODOS');
  fechaDesde = signal(''); // yyyy-mm-dd
  fechaHasta = signal(''); // yyyy-mm-dd

  // Debounce búsqueda
  private search$ = new Subject<string>();

  ngOnInit() {
    // debounce search
    const sub = this.search$
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => this.cargarDeudas());
    this.destroyRef.onDestroy(() => sub.unsubscribe());

    // carga inicial: motivos + deudas
    this.cargarMotivos();
    this.cargarDeudas();
  }

  // ====== Cargas ======
  cargarMotivos() {
    this.motivosApi.listar().subscribe({
      next: (data) => this.motivos.set(data ?? []),
      error: () => {
        // si falla, igual dejamos que la pantalla funcione sin el combo
        this.motivos.set([]);
      },
    });
  }

  cargarDeudas() {
    this.cargando.set(true);

    const estadoParam = this.filtroEstado() === 'TODOS' ? undefined : this.filtroEstado();
    const idMotivoParam = this.filtroMotivoId() === '' ? undefined : this.filtroMotivoId();

    this.deudasApi
      .listar({
        q: this.searchTerm().trim() || undefined,
        estado: estadoParam, // ✅ ahora es PENDIENTE|PAGADA|undefined
        idMotivo: idMotivoParam, // ✅ ahora es number|undefined
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
      })
      .subscribe({
        next: (data) => {
          this.deudas.set(data ?? []);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error al cargar deudas', err);
          this.deudas.set([]);
          this.cargando.set(false);
        },
      });
  }

  // ====== handlers filtros ======
  onChangeSearch(value: string) {
    this.searchTerm.set(value);
    this.search$.next(value);
  }

  onChangeMotivo(value: string) {
    // value llega como string desde <select>
    this.filtroMotivoId.set(value ? Number(value) : '');
    this.cargarDeudas();
  }

  onChangeEstado(value: 'TODOS' | 'PENDIENTE' | 'PAGADA') {
    this.filtroEstado.set(value);
    this.cargarDeudas();
  }

  onChangeFechaDesde(value: string) {
    this.fechaDesde.set(value);
    this.cargarDeudas();
  }

  onChangeFechaHasta(value: string) {
    this.fechaHasta.set(value);
    this.cargarDeudas();
  }

  limpiarFechas() {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.cargarDeudas();
  }

  // ====== estadísticas ======
  totalPendiente = computed(() =>
    this.deudas()
      .filter((d) => d.estado === 'PENDIENTE')
      .reduce((acc, d) => acc + (Number(d.monto) || 0), 0),
  );

  // No hay fecha_vencimiento en tu tabla -> por ahora 0.
  conteoVencidas = computed(() => 0);

  // Si quieres “recaudación esperada”, aquí lo normal es sumar pendientes.
  recaudacionEsperada = computed(() =>
    this.deudas()
      .filter((d) => d.estado === 'PENDIENTE')
      .reduce((acc, d) => acc + (Number(d.monto) || 0), 0),
  );

  // ====== paginación (client-side) ======
  filteredDeudas = computed(() => this.deudas());
  pagination = this.paginationService.createPagination(this.filteredDeudas, 10);

  // ====== UI helpers ======
  displaySocioNombre(d: DeudaListadoResponse): string {
    return d.socioNombre ?? '— Sin socio —';
  }
  displaySocioEmail(d: DeudaListadoResponse): string {
    return d.socioEmail ?? '';
  }

  // ====== acciones ======
  verDetalle(deuda: DeudaListadoResponse) {
    this.deudaSeleccionada.set(deuda);
    this.mostrarDetalle.set(true);
  }

  cerrarDetalle() {
    this.mostrarDetalle.set(false);
    this.deudaSeleccionada.set(null);
  }

  abrirEditor(deuda: DeudaListadoResponse) {
    this.deudaAEditar.set({ ...deuda });
    this.mostrarEditor.set(true);
  }

  guardarCambios() {
    // aquí luego iría endpoint PUT/PATCH si lo implementas
    this.mostrarEditor.set(false);
  }

  abrirModalEliminar(deuda: DeudaListadoResponse) {
    this.deudaParaEliminar.set(deuda);
    this.mostrarConfirmarEliminar.set(true);
  }

  confirmarEliminacion() {
    const deuda = this.deudaParaEliminar();
    if (!deuda) return;

    // Por ahora solo lo quita de UI. Si luego haces DELETE real, aquí llamas al API.
    this.deudas.update((list) => list.filter((d) => d.idDeuda !== deuda.idDeuda));
    this.mostrarConfirmarEliminar.set(false);
    this.deudaParaEliminar.set(null);
  }
}
