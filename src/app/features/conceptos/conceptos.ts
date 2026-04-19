import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConceptosApi } from '../../core/api/conceptos/conceptos.api';
import { ConceptoResponse, ConceptoRequest } from '../../core/api/conceptos/conceptos.models';
import { PageResponse } from '../../core/api/pagos/pagos.models';
import { Pagination } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-conceptos',
  standalone: true,
  imports: [CommonModule, FormsModule, Pagination],
  templateUrl: './conceptos.html',
  styleUrl: './conceptos.css',
})
export class Conceptos implements OnInit {
  private conceptosApi = inject(ConceptosApi);

  // 1. Data del Servidor
  pageInfo = signal<PageResponse<ConceptoResponse> | null>(null);
  loading = signal(false);
  searchTerm = signal('');
  totalActivosGlobal = signal(0); // Este manda en la tarjeta de activos
  errorMessage = signal<string | null>(null);

  // 2. Modales de Confirmación
  mostrarConfirmacion = signal(false);
  conceptoPorCambiar = signal<ConceptoResponse | null>(null);

  // 3. Modales de Formulario
  mostrarModal = signal(false);
  editando = signal(false);
  idSeleccionado = signal<number | null>(null);
  conceptoForm = signal<ConceptoRequest>({ nombre: '', descripcion: '' });

  ngOnInit() {
    this.cargarConceptos();
    this.actualizarConteoActivos();
  }

  actualizarConteoActivos() {
    this.conceptosApi.obtenerConteoActivos().subscribe({
      next: (conteo) => this.totalActivosGlobal.set(conteo),
      error: (e) => console.error('Error al obtener conteo', e),
    });
  }

  cargarConceptos(page = 0) {
    this.loading.set(true);
    this.conceptosApi.listar(this.searchTerm(), page, 5).subscribe({
      next: (res) => {
        this.pageInfo.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: any) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.cargarConceptos(0);
    // No es estrictamente necesario actualizar conteo al buscar,
    // pero lo dejamos cargando la página 0.
  }

  guardar() {
    this.errorMessage.set(null); // Limpiamos errores previos
    const data = this.conceptoForm();

    const observer = {
      next: () => {
        this.mostrarModal.set(false);
        this.cargarConceptos(this.editando() ? this.pageInfo()?.number : 0);
        this.actualizarConteoActivos();
      },
      error: (err: any) => {
        console.log('Error completo del server:', err); // Esto te ayudará a ver la estructura en la consola (F12)

        // Probamos varias rutas comunes donde Spring guarda el mensaje
        const msg =
          err.error?.message || err.error?.error || 'Ya existe un concepto con ese nombre';
        this.errorMessage.set(msg);
      },
    };

    if (this.editando() && this.idSeleccionado()) {
      this.conceptosApi.editar(this.idSeleccionado()!, data).subscribe(observer);
    } else {
      this.conceptosApi.registrar(data).subscribe(observer);
    }
  }

  ejecutarCambioEstado() {
    const item = this.conceptoPorCambiar();
    if (item) {
      this.conceptosApi.cambiarEstado(item.idMotivo).subscribe(() => {
        this.cargarConceptos(this.pageInfo()?.number);
        this.actualizarConteoActivos(); // Refresca tarjeta al suspender/activar
        this.mostrarConfirmacion.set(false);
      });
    }
  }

  // --- Helpers ---
  items = computed(() => this.pageInfo()?.content ?? []);
  totalItems = computed(() => this.pageInfo()?.totalElements ?? 0);

  pagesArray = computed(() => {
    const n = this.pageInfo()?.totalPages ?? 0;
    return Array.from({ length: n }, (_, i) => i + 1);
  });

  goToPage(p: number) {
    this.cargarConceptos(p - 1);
  }

  // Métodos de apertura de modal se mantienen igual...
  abrirNuevo() {
    this.errorMessage.set(null);
    this.editando.set(false);
    this.idSeleccionado.set(null);
    this.conceptoForm.set({ nombre: '', descripcion: '' });
    this.mostrarModal.set(true);
  }

  abrirEditar(item: ConceptoResponse) {
    this.errorMessage.set(null);
    this.editando.set(true);
    this.idSeleccionado.set(item.idMotivo);
    this.conceptoForm.set({ nombre: item.nombre, descripcion: item.descripcion });
    this.mostrarModal.set(true);
  }

  confirmarCambioEstado(item: ConceptoResponse) {
    this.conceptoPorCambiar.set(item);
    this.mostrarConfirmacion.set(true);
  }
}
