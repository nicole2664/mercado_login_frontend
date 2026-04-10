import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Deuda {
  id: number;
  titulo: string;
  monto: number;
  vencimiento: string;
  seleccionada: boolean;
}


interface Socio {
  dni: string;
  nombre: string;
  correo: string;
  puestos: string[];
  deudas: Deuda[];
}

@Component({
  selector: 'app-registrar-pago',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './registrar-pago.html',
  styleUrl: './registrar-pago.css',
})

//backend
//private socioService = inject(SocioService);

//seleccionarSocio(dni: string) {
//this.socioService.obtenerSocioPorDni(dni).subscribe({
//next: (socioReal) => {
//this.socioSeleccionado.set(socioReal);
// ... resto de la lógica de puestos
//},
//error: (err) => console.error('Socio no encontrado', err)
//});
//}
export class RegistrarPago {
  socioSeleccionado = signal<Socio | null>(null);
  puestoSeleccionado = signal<string>('');
  metodoPago = signal<string>('Efectivo');
  fechaOperacion = new Date().toLocaleDateString('es-PE');

  seleccionarSocio(dni: string) {
    const mockSocio: Socio = {
      dni: '72834951',
      nombre: 'Alexander Hamilton',
      correo: 'a.hamilton@mail.com',
      puestos: ['B-205', 'B-206'],
      deudas: [
        {
          id: 1,
          titulo: 'Renta Mensual - Abril 2026',
          monto: 1250,
          vencimiento: '10/04/2026',
          seleccionada: false,
        },
        {
          id: 2,
          titulo: 'Mantenimiento y Limpieza',
          monto: 150,
          vencimiento: '05/04/2026',
          seleccionada: false,
        },
      ],
    };

    this.socioSeleccionado.set(mockSocio);

    if (mockSocio.puestos.length === 1) {
      this.puestoSeleccionado.set(mockSocio.puestos[0]);
    } else {
      this.puestoSeleccionado.set(''); // Obliga a elegir del select
    }
  }

  deudaTotalPuesto = computed(() => {
    const socio = this.socioSeleccionado();
    if (!socio) return 0;

    return socio.deudas.reduce((acc: number, d: Deuda) => acc + d.monto, 0);
  });

  totalACobrar = computed(() => {
    const socio = this.socioSeleccionado();
    const puesto = this.puestoSeleccionado();
    if (!socio || !puesto) return 0;
    return socio.deudas
      .filter((d: Deuda) => d.seleccionada)
      .reduce((acc: number, d: Deuda) => acc + d.monto, 0);
  });

  toggleDeuda(deudaId: number) {
    const socio = this.socioSeleccionado();
    if (socio) {
      socio.deudas = socio.deudas.map((d: Deuda) =>
        d.id === deudaId ? { ...d, seleccionada: !d.seleccionada } : d,
      );
      this.socioSeleccionado.set({ ...socio });
    }
  }

  mostrarRecibo = signal<boolean>(false);

  procesarPago() {
    console.log('Procesando pago...');
    // Aquí iría la llamada al backend
    this.mostrarRecibo.set(true);
  }

  //procesarPago() {
    //const datosPago = {
      //dni: this.socioSeleccionado()?.dni,
      //puesto: this.puestoSeleccionado(),
      //montoTotal: this.totalACobrar(),
      //metodo: this.metodoPago(),
      //deudasIds: this.socioSeleccionado()
        //?.deudas.filter((d) => d.seleccionada)
        //.map((d) => d.id),
    //};

    //this.socioService.registrarPago(datosPago).subscribe(() => {
      //this.mostrarRecibo.set(true);
    //});
  //}

  imprimirRecibo() {
    window.print();
  }

  cerrarRecibo() {
    this.mostrarRecibo.set(false);
    this.socioSeleccionado.set(null);
    this.puestoSeleccionado.set('');
  }
}
