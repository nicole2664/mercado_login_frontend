import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { PermissionsService } from '../../../core/auth/permissions.service';
import { PuestosApi } from '../../../core/api/puestos/puestos.api';
import type { Puesto as PuestoApiModel } from '../../../core/api/puestos/puestos.models';
import { SocioPuestoApi } from '../../../core/api/socio-puesto/socio-puesto.api';
import { ConceptosApi } from '../../../core/api/conceptos/conceptos.api';
import type { ConceptoResponse } from '../../../core/api/conceptos/conceptos.models';
import { DeudasApi } from '../../../core/api/deudas/deudas.api';
import type { DistribuirDeudaRequest } from '../../../core/api/deudas/deudas.models';

type PuestoUI = {
  idPuesto: number;
  codigo: string;
  sector: string;
  socio: string;
  esAsociacion: boolean; // puesto.estado === true
  seleccionado: boolean;
};

@Component({
  selector: 'app-registrar-deuda',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './registrar-deuda.html',
  styleUrl: './registrar-deuda.css',
})
export class RegistrarDeuda implements OnInit {
  authz = inject(PermissionsService);
  private router = inject(Router);

  private puestosApi = inject(PuestosApi);
  private socioPuestoApi = inject(SocioPuestoApi);
  private conceptosApi = inject(ConceptosApi);
  private deudasApi = inject(DeudasApi);

  cargando = signal(false);
  enviando = signal(false);

  // UI
  textoBusqueda = signal('');
  montoBase = signal<number | null>(null);

  // Fechas
  fechaHoyIso = new Date().toISOString().slice(0, 10); // yyyy-mm-dd (para backend)
  fechaHoy = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Conceptos (activos)
  conceptos = signal<ConceptoResponse[]>([]);
  idMotivoSeleccionado = signal<number | null>(null); // idMotivo = idConcepto en backend

  // Puestos UI
  sectoresOcultos = signal<Record<string, boolean>>({});
  allPuestos = signal<PuestoUI[]>([]);

  // Modal confirmación
  mostrarConfirmacion = signal(false);

  ngOnInit() {
    this.cargarPantalla();
  }

  private cargarPantalla() {
    this.cargando.set(true);

    // 1) cargar conceptos activos
    this.conceptosApi.listarActivos().subscribe({
      next: (data) => {
        this.conceptos.set(data ?? []);
        if (!this.idMotivoSeleccionado() && this.conceptos().length > 0) {
          this.idMotivoSeleccionado.set(this.conceptos()[0].idMotivo);
        }
      },
      error: (e) => {
        console.error('Error cargando conceptos activos', e);
        this.conceptos.set([]);
      },
    });

    // 2) cargar puestos + asignaciones activas
    this.puestosApi.listar().subscribe({
      next: (puestos) => {
        this.socioPuestoApi.listarActivos().subscribe({
          next: (asigs) => {
            const socioPorPuesto = new Map<number, string>();
            for (const a of asigs ?? []) {
              socioPorPuesto.set(a.puesto.idPuesto, a.socio?.nombre ?? '—');
            }

            const ui: PuestoUI[] = (puestos ?? []).map((p: PuestoApiModel) => {
              const esAsociacion = p.estado === true;
              const socioAsignado = socioPorPuesto.get(p.idPuesto);

              return {
                idPuesto: p.idPuesto,
                codigo: p.codigo,
                sector: (p.sector ?? 'Sin sector').trim() || 'Sin sector',
                socio: esAsociacion
                  ? 'Asociación (sin socio)'
                  : (socioAsignado ?? 'Sin asignación'),
                esAsociacion,
                seleccionado: false,
              };
            });

            ui.sort((a, b) => a.sector.localeCompare(b.sector) || a.codigo.localeCompare(b.codigo));
            this.allPuestos.set(ui);
            this.cargando.set(false);
          },
          error: (e) => {
            console.error('Error cargando asignaciones activas', e);

            const ui: PuestoUI[] = (puestos ?? []).map((p: PuestoApiModel) => ({
              idPuesto: p.idPuesto,
              codigo: p.codigo,
              sector: (p.sector ?? 'Sin sector').trim() || 'Sin sector',
              socio: p.estado === true ? 'Asociación (sin socio)' : 'Sin asignación',
              esAsociacion: p.estado === true,
              seleccionado: false,
            }));

            ui.sort((a, b) => a.sector.localeCompare(b.sector) || a.codigo.localeCompare(b.codigo));
            this.allPuestos.set(ui);
            this.cargando.set(false);
          },
        });
      },
      error: (e) => {
        console.error('Error cargando puestos', e);
        this.allPuestos.set([]);
        this.cargando.set(false);
        Swal.fire('Error', 'No se pudieron cargar los puestos', 'error');
      },
    });
  }

  // ===== agrupación y filtros =====
  puestosAgrupados = computed(() => {
    const term = this.textoBusqueda().toLowerCase().trim();

    const filtrados = this.allPuestos().filter((p) => {
      if (!term) return true;
      return p.codigo.toLowerCase().includes(term) || p.socio.toLowerCase().includes(term);
    });

    const grupos = filtrados.reduce(
      (acc, puesto) => {
        if (!acc[puesto.sector]) acc[puesto.sector] = [];
        acc[puesto.sector].push(puesto);
        return acc;
      },
      {} as Record<string, PuestoUI[]>,
    );

    return Object.keys(grupos).map((nombre) => ({
      nombre,
      puestos: grupos[nombre],
    }));
  });

  totalSeleccionados = computed(() => this.allPuestos().filter((p) => p.seleccionado).length);

  montoPorLocal = computed(() => {
    const total = this.montoBase() || 0;
    const n = this.totalSeleccionados() || 1;
    return total / n;
  });

  totalARecaudar = computed(() => this.montoBase() || 0);

  todosSeleccionados = computed(
    () => this.allPuestos().length > 0 && this.allPuestos().every((p) => p.seleccionado),
  );

  // ===== UI acciones =====
  togglePuesto(idPuesto: number) {
    this.allPuestos.update((ps) =>
      ps.map((p) => (p.idPuesto === idPuesto ? { ...p, seleccionado: !p.seleccionado } : p)),
    );
  }

  toggleSector(nombreSector: string) {
    const grupo = this.puestosAgrupados().find((g) => g.nombre === nombreSector);
    if (!grupo) return;

    const todosMarcados = grupo.puestos.every((p) => p.seleccionado);
    this.allPuestos.update((ps) =>
      ps.map((p) => (p.sector === nombreSector ? { ...p, seleccionado: !todosMarcados } : p)),
    );
  }

  toggleColapsarSector(nombre: string) {
    this.sectoresOcultos.update((prev) => ({
      ...prev,
      [nombre]: !prev[nombre],
    }));
  }

  obtenerIconoSector(grupo: { puestos: PuestoUI[] }): string {
    const seleccionados = grupo.puestos.filter((p) => p.seleccionado).length;
    const total = grupo.puestos.length;

    if (seleccionados === 0) return 'check_box_outline_blank';
    if (seleccionados === total) return 'check_box';
    return 'indeterminate_check_box';
  }

  seleccionarTodos() {
    const estado = !this.todosSeleccionados();
    this.allPuestos.update((ps) => ps.map((p) => ({ ...p, seleccionado: estado })));
  }

  filtrarPuestos(event: any) {
    this.textoBusqueda.set(event.target.value);
  }

  // ===== Confirmación / submit =====
  abrirConfirmacion() {
    const idMotivo = this.idMotivoSeleccionado();
    const monto = this.montoBase();

    if (!idMotivo) {
      Swal.fire('Atención', 'Debe seleccionar un concepto', 'warning');
      return;
    }

    if (monto == null || monto <= 0) {
      Swal.fire('Atención', 'Debe ingresar un monto válido', 'warning');
      return;
    }

    if (this.totalSeleccionados() === 0) {
      Swal.fire('Atención', 'Debe seleccionar al menos un puesto', 'warning');
      return;
    }

    this.mostrarConfirmacion.set(true);
  }

  confirmarYRepartir() {
    const idMotivo = this.idMotivoSeleccionado();
    const montoTotal = this.montoBase();

    if (!idMotivo || montoTotal == null || montoTotal <= 0) return;

    const codigosPuestos = this.allPuestos()
      .filter((p) => p.seleccionado)
      .map((p) => p.codigo);

    const dto: DistribuirDeudaRequest = {
      idMotivo,
      montoTotal,
      fecha: this.fechaHoyIso,
      codigosPuestos,
    };

    this.enviando.set(true);

    this.deudasApi.distribuir(dto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.mostrarConfirmacion.set(false);

        Swal.fire({
          title: 'Listo',
          text: 'La deuda fue distribuida correctamente.',
          icon: 'success',
          timer: 1600,
          showConfirmButton: false,
        });

        this.router.navigateByUrl('/deudas');
      },
      error: (err) => {
        this.enviando.set(false);
        console.error(err);
        Swal.fire('Error', err?.error?.message || 'No se pudo distribuir la deuda', 'error');
      },
    });
  }

  // Helper: nombre del concepto seleccionado para el modal
  conceptoSeleccionadoNombre = computed(() => {
    const id = this.idMotivoSeleccionado();
    return this.conceptos().find((c) => c.idMotivo === id)?.nombre ?? '—';
  });
}
