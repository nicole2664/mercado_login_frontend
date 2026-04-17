import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationService } from '../../../core/services/pagination';
import { Pagination } from '../../../shared/components/pagination/pagination';

interface DeudaCajero {
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
  selector: 'app-deudas-cajero',
  standalone: true,
  imports: [CommonModule, Pagination],
  templateUrl: './deudas-cajero.html',
  styleUrl: './deudas-cajero.css',
})
export class DeudasCajero {
  private paginationService = inject(PaginationService);
  searchTerm = signal('');
  mostrarDetalle = signal(false);
  deudaSeleccionada = signal<any>(null);

  deudas = signal<DeudaCajero[]>([
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
  ]);
  totalPendiente = computed(() => this.deudas().reduce((acc, d) => acc + d.monto, 0));
  conteoVencidas = signal(28);
  recaudacionEsperada = signal(158200.0);

  filteredDeudas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.deudas().filter(
      (d) => d.socio.toLowerCase().includes(term) || d.puesto.toLowerCase().includes(term),
    );
  });

  pagination = this.paginationService.createPagination(this.filteredDeudas, 10);

  onSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    console.log('Buscando:', value);
  }
  verDetalle(deuda: any) {
    this.deudaSeleccionada.set(deuda);
    this.mostrarDetalle.set(true);
  }

  cerrarDetalle() {
    this.mostrarDetalle.set(false);
    this.deudaSeleccionada.set(null);
  }

  procesarPago(deuda: any) {
    console.log('Iniciando proceso de cobro para:', deuda);
    // Aquí podrías navegar a la pantalla de registrar pago
  }
}
