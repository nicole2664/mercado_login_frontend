import { Component, signal,inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationService } from '../../../core/services/pagination';
import { Pagination } from '../../../shared/components/pagination/pagination';

interface ConceptoCobro {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  activo: boolean;
}

@Component({
  selector: 'app-conceptos',
  standalone: true,
  imports: [CommonModule, FormsModule, Pagination],
  templateUrl: './conceptos.html',
  styleUrl: './conceptos.css',
})
export class Conceptos {
  private paginationService = inject(PaginationService);

  conceptos = signal<ConceptoCobro[]>([
    {
      id: '001',
      nombre: 'Alquiler',
      descripcion: 'Arrendamiento mensual de local',
      categoria: 'Inmuebles',
      activo: true,
    },
    {
      id: '002',
      nombre: 'Luz',
      descripcion: 'Consumo eléctrico mensual',
      categoria: 'Servicios',
      activo: true,
    },
    {
      id: '003',
      nombre: 'Agua',
      descripcion: 'Suministro de agua potable',
      categoria: 'Servicios',
      activo: true,
    },
    {
      id: '004',
      nombre: 'Limpieza',
      descripcion: 'Mantenimiento de áreas comunes',
      categoria: 'Mantenimiento',
      activo: true,
    },
    {
      id: '005',
      nombre: 'Multa',
      descripcion: 'Sanción por incumplimiento',
      categoria: 'Legal',
      activo: false,
    },
  ]);

  mostrarModal = signal(false);
  editando = signal(false);
  searchTerm = signal('');

  filteredConceptos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.conceptos().filter(
      (c) =>
        c.nombre.toLowerCase().includes(term) ||
        c.descripcion.toLowerCase().includes(term) ||
        c.id.includes(term),
    );
  });

  // Objeto para el formulario
  conceptoActual = signal<ConceptoCobro>({
    id: '',
    nombre: '',
    descripcion: '',
    categoria: 'Servicios',
    activo: true,
  });

  abrirNuevo() {
    this.editando.set(false);
    this.conceptoActual.set({
      id: (this.conceptos().length + 1).toString().padStart(3, '0'),
      nombre: '',
      descripcion: '',
      categoria: 'Servicios',
      activo: true,
    });
    this.mostrarModal.set(true);
  }

  pagination = this.paginationService.createPagination(this.filteredConceptos, 5);

  onSearch(event: any) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  editar(item: ConceptoCobro) {
    this.editando.set(true);
    this.conceptoActual.set({ ...item });
    this.mostrarModal.set(true);
  }

  cambiarEstado(item: ConceptoCobro) {
    this.conceptos.update((list) =>
      list.map((c) => (c.id === item.id ? { ...c, activo: !c.activo } : c)),
    );
  }

  guardar() {
    if (this.editando()) {
      this.conceptos.update((list) =>
        list.map((c) => (c.id === this.conceptoActual().id ? this.conceptoActual() : c)),
      );
    } else {
      this.conceptos.update((list) => [...list, this.conceptoActual()]);
    }
    this.mostrarModal.set(false);
  }
}
