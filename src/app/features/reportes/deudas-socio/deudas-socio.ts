import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReporteDeudaSocioApi } from '../../../core/api/reportes/reporte-deuda-socio.api';
import type {
  DeudaSocioResponse,
  DeudaSocioItem,
  DeudaSocioDetalleResponse
} from '../../../core/api/reportes/reporte-deuda-socio.models';

@Component({
  selector: 'app-deudas-socio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deudas-socio.html',
  styleUrl: './deudas-socio.css',
})
export class DeudaSocioComponent implements OnInit {
  private api = inject(ReporteDeudaSocioApi);

  q = signal('');
  cargando = signal(false);
  data = signal<DeudaSocioResponse | null>(null);

  paginaActual = signal(0);
  readonly size = 10;

  modalAbierto = signal(false);
  detalle = signal<DeudaSocioDetalleResponse | null>(null);
  cargandoDetalle = signal(false);

  socios = computed(() => this.data()?.socios ?? []);

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.socios().length / this.size))
  );

  sociosPaginados = computed(() => {
    const from = this.paginaActual() * this.size;
    return this.socios().slice(from, from + this.size);
  });

  paginas = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.getReporte(this.q() || undefined).subscribe({
      next: (resp) => {
        this.data.set(resp);
        this.paginaActual.set(0);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        Swal.fire('Error', 'No se pudo cargar el reporte.', 'error');
      },
    });
  }

  verDetalle(socio: DeudaSocioItem) {
    this.modalAbierto.set(true);
    this.detalle.set(null);
    this.cargandoDetalle.set(true);
    this.api.getDetalle(socio.idSocio).subscribe({
      next: (d) => {
        this.detalle.set(d);
        this.cargandoDetalle.set(false);
      },
      error: () => {
        this.cargandoDetalle.set(false);
        Swal.fire('Error', 'No se pudo cargar el detalle.', 'error');
      }
    });
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.detalle.set(null);
  }

  iniciales(nombre: string): string {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  imprimir() { window.print(); }
}
