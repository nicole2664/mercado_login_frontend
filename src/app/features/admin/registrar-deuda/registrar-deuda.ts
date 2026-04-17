import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Puesto {
  id: number;
  codigo: string;
  socio: string;
  area: number;
  seleccionado: boolean;
  sector: string;
}

@Component({
  selector: 'app-registrar-deuda',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './registrar-deuda.html',
  styleUrl: './registrar-deuda.css',
})
export class RegistrarDeuda {
  fechaHoy = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  textoBusqueda = signal('');
  montoBase = signal<number | null>(null);
  conceptoSeleccionado = signal('Servicio Eléctrico Común');
  sectoresOcultos = signal<Record<string, boolean>>({});

  allPuestos = signal<Puesto[]>([
    { id: 1, codigo: 'A-102', socio: 'Alexander Hamilton', area: 45, seleccionado: false, sector: 'Sector A - Abarrotes' },
    { id: 2, codigo: 'A-105', socio: 'Julianna De Marco', area: 50, seleccionado: false, sector: 'Sector A - Abarrotes' },
    { id: 3, codigo: 'B-205', socio: 'Carnicería El Torito', area: 62, seleccionado: false, sector: 'Sector B - Carnes' },
    { id: 4, codigo: 'B-210', socio: 'Alex Rivera', area: 60, seleccionado: false, sector: 'Sector B - Carnes' },
    { id: 5, codigo: 'C-012', socio: 'Abarrotes Central', area: 110, seleccionado: false, sector: 'Sector C - Frutas' },
    { id: 6, codigo: 'C-015', socio: 'Maria Elena Torres', area: 30, seleccionado: false, sector: 'Sector C - Frutas' },
  ]);

  // Lógica para agrupar puestos por sector para el scroll
  puestosAgrupados = computed(() => {
    const term = this.textoBusqueda().toLowerCase();
    const filtrados = this.allPuestos().filter(p =>
      p.codigo.toLowerCase().includes(term) || p.socio.toLowerCase().includes(term)
    );

    // Creamos un mapa de sectores
    const grupos = filtrados.reduce((acc, puesto) => {
      if (!acc[puesto.sector]) acc[puesto.sector] = [];
      acc[puesto.sector].push(puesto);
      return acc;
    }, {} as Record<string, Puesto[]>);

    return Object.keys(grupos).map(nombre => ({
      nombre,
      puestos: grupos[nombre]
    }));
  });

  // Funciones de cálculo
  totalSeleccionados = computed(() => this.allPuestos().filter(p => p.seleccionado).length);
  montoPorLocal = computed(() => (this.montoBase() || 0) / (this.totalSeleccionados() || 1));
  totalARecaudar = computed(() => this.montoBase() || 0);
  todosSeleccionados = computed(() => this.allPuestos().length > 0 && this.allPuestos().every(p => p.seleccionado));

  // Acciones
  togglePuesto(id: number) {
    this.allPuestos.update(ps => ps.map(p => p.id === id ? { ...p, seleccionado: !p.seleccionado } : p));
  }

  toggleSector(nombreSector: string) {
    const todosMarcados = this.puestosAgrupados().find(g => g.nombre === nombreSector)?.puestos.every(p => p.seleccionado);
    this.allPuestos.update(ps => ps.map(p => p.sector === nombreSector ? { ...p, seleccionado: !todosMarcados } : p));
  }

  toggleColapsarSector(nombre: string) {
    this.sectoresOcultos.update(prev => ({
      ...prev,
      [nombre]: !prev[nombre]
    }));
  }


  obtenerIconoSector(grupo: any): string {
    const seleccionados = grupo.puestos.filter((p: any) => p.seleccionado).length;
    const total = grupo.puestos.length;

    if (seleccionados === 0) return 'check_box_outline_blank'; // Casilla vacía
    if (seleccionados === total) return 'check_box'; // Todos marcados
    return 'indeterminate_check_box'; // Solo algunos marcados (-)
  }

  seleccionarTodos() {
    const estado = !this.todosSeleccionados();
    this.allPuestos.update(ps => ps.map(p => ({ ...p, seleccionado: estado })));
  }

  filtrarPuestos(event: any) {
    this.textoBusqueda.set(event.target.value);
  }

  confirmarReparto() {
    alert('Procesando deuda...');
  }

  mostrarConfirmacion = signal(false);

  abrirConfirmacion() {
    if (this.totalSeleccionados() === 0) {
      alert('Debe seleccionar al menos un puesto.');
      return;
    }
    this.mostrarConfirmacion.set(true);
  }

  confirmarYRepartir() {
    // Aquí iría la llamada al backend real
    console.log('Repartiendo deuda...');
    this.mostrarConfirmacion.set(false);
    // Podrías redirigir al listado después de un éxito
  }
}
