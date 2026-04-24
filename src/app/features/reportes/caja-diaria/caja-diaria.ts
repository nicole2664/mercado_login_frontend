import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ReporteCajaApi } from '../../../core/api/reportes/reporte-caja.api';
import type { CajaDiariaResponse } from '../../../core/api/reportes/reporte-caja.models';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-caja-diaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja-diaria.html',
  styleUrl: './caja-diaria.css',
})
export class CajaDiariaComponent implements OnInit {
  private api = inject(ReporteCajaApi);
  private auth = inject(AuthService);

  // default hoy en formato YYYY-MM-DD
  fecha = signal(new Date().toISOString().slice(0, 10));

  cargando = signal(false);
  data = signal<CajaDiariaResponse | null>(null);

  cards = computed(() => this.data()?.cards);
  items = computed(() => this.data()?.items ?? []);

  ngOnInit(): void {
    this.cargar();
  }

  onFechaChange() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.cajaDiaria(this.fecha()).subscribe({
      next: (resp) => {
        this.data.set(resp);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        Swal.fire('Error', 'No se pudo cargar el reporte de caja.', 'error');
      },
    });
  }

  exportCsv() {
    this.api.descargarCsv(this.fecha()).subscribe({
      next: (res) =>
        this.descargarBlob(
          res.body!,
          this.nombreArchivoDesdeHeader(res, `caja-diaria-${this.fecha()}.csv`),
        ),
      error: () => Swal.fire('Error', 'No se pudo descargar el CSV.', 'error'),
    });
  }

  exportXlsx() {
    this.api.descargarXlsx(this.fecha()).subscribe({
      next: (res) =>
        this.descargarBlob(
          res.body!,
          this.nombreArchivoDesdeHeader(res, `caja-diaria-${this.fecha()}.xlsx`),
        ),
      error: () => Swal.fire('Error', 'No se pudo descargar el Excel.', 'error'),
    });
  }

  // Helpers de UI: color por rol (ADMIN=azul, CAJERO=verde)
  accentSolidClass(): string {
    return this.auth.hasRole('ADMIN') ? 'accent-admin' : 'accent-cajero';
  }

  accentOutlineClass(): string {
    return this.auth.hasRole('ADMIN') ? 'accent-admin-outline' : 'accent-cajero-outline';
  }

  private descargarBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private nombreArchivoDesdeHeader(res: any, fallback: string) {
    const cd = res?.headers?.get?.('content-disposition') as string | null;
    if (!cd) return fallback;

    // busca filename="..."
    const match = /filename="([^"]+)"/.exec(cd);
    return match?.[1] ?? fallback;
  }
}
