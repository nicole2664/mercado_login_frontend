import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { PaginationService } from '../../../core/services/pagination';

interface DeudaAdmin {
  id: string;
  socio: string;
  correo: string;
  puesto: string;
  concepto: string;
  monto: number;
  fecha: string;
  estado: 'PENDIENTE' | 'PAGADA';
}

@Component({
  selector: 'app-deudas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Pagination],
  templateUrl: './deudas.html',
  styleUrl: './deudas.css',
})
export class Deudas {
  private paginationService = inject(PaginationService);
  private route = inject(ActivatedRoute);

  esAdmin = signal(true);
  colorTema = signal('blue');

  mostrarDetalle = signal(false);
  deudaSeleccionada = signal<any>(null);

  mostrarEditor = signal(false);
  deudaAEditar = signal<any>(null);

  mostrarConfirmarEliminar = signal(false);
  deudaParaEliminar = signal<DeudaAdmin | null>(null);

  ngOnInit() {
    // Detectamos el rol configurado en app.routes.ts
    const rolEnRuta = this.route.snapshot.data['role'];
    if (rolEnRuta === 'CAJERO') {
      this.esAdmin.set(false);
      this.colorTema.set('emerald');
    }
  }

  deudas = signal<DeudaAdmin[]>([
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-9021',
      socio: 'Ricardo Mendoza',
      correo: 'ricardo.m@market.com',
      puesto: 'A-12',
      concepto: 'Servicios Eléctricos',
      monto: 1250.0,
      fecha: '12 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8942',
      socio: 'Maria Elena Torres',
      correo: 'm.torres@market.com',
      puesto: 'C-05',
      concepto: 'Mantenimiento Pasillos',
      monto: 450.0,
      fecha: '10 Oct, 2023',
      estado: 'PAGADA',
    },
    {
      id: '#D-8930',
      socio: 'Jose Carlos Luque',
      correo: 'j.luque@market.com',
      puesto: 'B-22',
      concepto: 'Alquiler Octubre',
      monto: 2800.0,
      fecha: '09 Oct, 2023',
      estado: 'PENDIENTE',
    },
    {
      id: '#D-8912',
      socio: 'Lucia Fernandini',
      correo: 'l.fer@market.com',
      puesto: 'F-01',
      concepto: 'Multa Normativa',
      monto: 150.0,
      fecha: '08 Oct, 2023',
      estado: 'PAGADA',
    },
  ]);

  // Signals para estadísticas (los cuadritos de arriba)
  totalPendiente = computed(() =>
    this.deudas()
      .filter((d) => d.estado === 'PENDIENTE')
      .reduce((acc, d) => acc + d.monto, 0),
  );
  conteoVencidas = signal(14); // Dato fijo por ahora como el diseño
  recaudacionEsperada = signal(158200.0);

  searchTerm = signal('');

  // Filtro de búsqueda
  filteredDeudas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.deudas().filter(
      (d) =>
        d.socio.toLowerCase().includes(term) ||
        d.puesto.toLowerCase().includes(term) ||
        d.id.toLowerCase().includes(term),
    );
  });

  pagination = this.paginationService.createPagination(this.filteredDeudas, 10);

  // Métodos de acción
  verDetalle(deuda: any) {
    this.deudaSeleccionada.set(deuda);
    this.mostrarDetalle.set(true);
  }

  cerrarDetalle() {
    this.mostrarDetalle.set(false);
    this.deudaSeleccionada.set(null);
  }

  abrirEditor(deuda: any) {
    // Creamos una copia para no modificar la tabla directamente hasta guardar
    this.deudaAEditar.set({ ...deuda });
    this.mostrarEditor.set(true);
  }

  guardarCambios() {
    console.log('Guardando cambios de la deuda:', this.deudaAEditar());
    // Aquí iría tu servicio para actualizar en la DB
    this.mostrarEditor.set(false);
  }

  abrirModalEliminar(deuda: DeudaAdmin) {
    this.deudaParaEliminar.set(deuda);
    this.mostrarConfirmarEliminar.set(true);
  }

  // Ejecuta la eliminación real
  confirmarEliminacion() {
    const deuda = this.deudaParaEliminar();
    if (deuda) {
      this.deudas.update((list) => list.filter((d) => d.id !== deuda.id));
      this.mostrarConfirmarEliminar.set(false);
      this.deudaParaEliminar.set(null);
    }
  }
}
