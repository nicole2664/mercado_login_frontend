import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Pagination } from '../../../shared/components/pagination/pagination';
import { PermissionsService } from '../../../core/auth/permissions.service';

import type { PageResponse, PagoListadoDto } from '../../../core/api/pagos/pagos.models';
import { PagosApi } from '../../../core/api/pagos/pagos.api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [CommonModule, Pagination, RouterLink, FormsModule],
  templateUrl: './pago-listar.html',
  styleUrl: './pago-listar.css',
})
export class PagoListar implements OnInit {
  private pagosApi = inject(PagosApi);
  authz = inject(PermissionsService);

  // Inputs (UI)
  qInput = signal<string>('');
  fromInput = signal<string>(''); // YYYY-MM-DD
  toInput = signal<string>(''); // YYYY-MM-DD

  // Filtros aplicados (los que realmente se envían al backend)
  q = signal<string>('');
  from = signal<string>('');
  to = signal<string>('');

  pageInfo = signal<PageResponse<PagoListadoDto> | null>(null);
  loading = signal(false);

  readonly pageSize = 10;

  ngOnInit() {
    this.cargarPagos(0);
  }

  // ======== Acciones de filtros ========

  aplicarFiltros() {
    // Validación simple de rango
    const from = this.fromInput();
    const to = this.toInput();
    if (from && to && from > to) return;

    // “commit” de inputs a filtros aplicados
    this.q.set(this.qInput());
    this.from.set(this.fromInput());
    this.to.set(this.toInput());

    // al aplicar filtros, siempre volver a página 0
    this.cargarPagos(0);
  }

  limpiarFiltros() {
    this.qInput.set('');
    this.fromInput.set('');
    this.toInput.set('');

    this.q.set('');
    this.from.set('');
    this.to.set('');

    this.cargarPagos(0);
  }

  onSearchEnter(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.aplicarFiltros();
  }

  // ======== Carga ========

  cargarPagos(page: number) {
    this.loading.set(true);

    this.pagosApi
      .listar({
        page,
        size: this.pageSize,
        q: this.q() || undefined,
        from: this.from() || undefined,
        to: this.to() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.pageInfo.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ========= Helpers para el componente <app-pagination> =========

  items = computed(() => this.pageInfo()?.content ?? []);

  totalItems = computed(() => this.pageInfo()?.totalElements ?? 0);
  totalPages = computed(() => this.pageInfo()?.totalPages ?? 0);
  currentPage = computed(() => (this.pageInfo()?.number ?? 0) + 1); // UI 1-based
  itemsPerPage = computed(() => this.pageInfo()?.size ?? this.pageSize);

  fromItem = computed(() => {
    const p = this.pageInfo();
    if (!p || p.totalElements === 0) return 0;
    return p.number * p.size + 1;
  });

  toItem = computed(() => {
    const p = this.pageInfo();
    if (!p) return 0;
    return Math.min((p.number + 1) * p.size, p.totalElements);
  });

  pagesArray = computed(() => {
    const n = this.totalPages();
    return Array.from({ length: n }, (_, i) => i + 1); // [1..n]
  });

  goToPage = (page1Based: number) => {
    this.cargarPagos(page1Based - 1);
  };

  nextPage = () => {
    const p = this.pageInfo();
    if (!p || p.last) return;
    this.cargarPagos(p.number + 1);
  };

  prevPage = () => {
    const p = this.pageInfo();
    if (!p || p.first) return;
    this.cargarPagos(p.number - 1);
  };

  // ========= Stats (sobre la página actual) =========
  private esMismaFecha(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  recaudacionHoy = computed(() => {
    const hoy = new Date();
    return this.items()
      .filter((p) => {
        const fecha = new Date(p.fechaPago);
        return this.esMismaFecha(fecha, hoy) && p.estado === 'Completado';
      })
      .reduce((acc, cur) => acc + cur.monto, 0);
  });

  pagosProcesados = computed(() => this.items().filter((p) => p.estado === 'Completado').length);

  totalMes = computed(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    return this.items()
      .filter((p) => {
        const fecha = new Date(p.fechaPago);
        return (
          fecha.getFullYear() === anioActual &&
          fecha.getMonth() === mesActual &&
          p.estado === 'Completado'
        );
      })
      .reduce((acc, p) => acc + p.monto, 0);
  });
}
