// import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
// import { PuestoService } from '../../core/services/puesto.service';
// import { SocioPuestoService } from '../../core/services/socio-puesto.service';
// import { Puesto, PuestoDTO } from '../../core/models/puesto.model';
//
// @Component({
//   selector: 'app-puestos',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './puestos.html',
//   styleUrl: './puestos.css'
// })
// export class PuestosComponent implements OnInit {
//   private puestoService = inject(PuestoService);
//   private socioPuestoService = inject(SocioPuestoService);
//   private platformId = inject(PLATFORM_ID);
//   private cdr = inject(ChangeDetectorRef);
//   private ngZone = inject(NgZone);
//
//   puestos: Puesto[] = [];
//   puestosFiltrados: Puesto[] = [];
//   textoBusqueda = '';
//   filtroEstado: 'todos' | 'ocupado' | 'libre' = 'todos';
//   filtroSector = '';
//   puestosOcupadosIds = new Set<number>();
//
//   paginaActual = 1;
//   itemsPorPagina = 10;
//
//   puestoActual: PuestoDTO = this.nuevoPuestoDTO();
//   idEditando: number | null = null;
//   esAdmin = false;
//   modalAbierto = false;
//   modoEdicion = false;
//   guardando = false;
//
//   ngOnInit() {
//     if (!isPlatformBrowser(this.platformId)) return;
//     this.verificarRol();
//     this.cargarPuestos();
//   }
//
//   private nuevoPuestoDTO(): PuestoDTO {
//     return { codigo: '', sector: '', numero: '', descripcion: '' };
//   }
//
//   verificarRol() {
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       const user = JSON.parse(userData);
//       this.esAdmin = user.rol === 'ADMIN';
//     }
//   }
//
//   cargarPuestos() {
//     this.puestoService.listarTodos().subscribe({
//       next: (data) => {
//         this.ngZone.run(() => {
//           this.puestos = data;
//           this.paginaActual = 1;
//           this.textoBusqueda = '';
//           this.filtroEstado = 'todos';
//           this.filtroSector = '';
//           this.cargarEstadosPuestos();
//           this.cdr.detectChanges();
//         });
//       },
//       error: () => Swal.fire('Error', 'No se pudieron cargar los puestos', 'error')
//     });
//   }
//
//   cargarEstadosPuestos() {
//     this.socioPuestoService.obtenerPuestosOcupados().subscribe({
//       next: (ids) => {
//         this.ngZone.run(() => {
//           this.puestosOcupadosIds = new Set(ids);
//           this.filtrar();
//           this.cdr.detectChanges();
//         });
//       },
//       error: () => {
//         this.filtrar();
//       }
//     });
//   }
//
//   estaOcupado(idPuesto: number): boolean {
//     return this.puestosOcupadosIds.has(idPuesto);
//   }
//
//   get totalOcupados(): number { return this.puestosOcupadosIds.size; }
//   get totalLibres(): number { return this.puestos.length - this.totalOcupados; }
//
//   setFiltroEstado(estado: 'todos' | 'ocupado' | 'libre') {
//     this.filtroEstado = estado;
//     this.paginaActual = 1;
//     this.filtrar();
//   }
//
//   filtrar() {
//     let resultado = this.puestos;
//
//     // Filtro por texto
//     const texto = this.textoBusqueda.toLowerCase().trim();
//     if (texto) {
//       resultado = resultado.filter(p =>
//         p.codigo.toLowerCase().includes(texto) ||
//         (p.sector ?? '').toLowerCase().includes(texto) ||
//         (p.descripcion ?? '').toLowerCase().includes(texto)
//       );
//     }
//
//     // Filtro por sector
//     if (this.filtroSector) {
//       resultado = resultado.filter(p => p.sector === this.filtroSector);
//     }
//
//     // Filtro por estado
//     if (this.filtroEstado === 'ocupado') {
//       resultado = resultado.filter(p => this.estaOcupado(p.idPuesto!));
//     } else if (this.filtroEstado === 'libre') {
//       resultado = resultado.filter(p => !this.estaOcupado(p.idPuesto!));
//     }
//
//     this.puestosFiltrados = resultado;
//     this.paginaActual = 1;
//     this.cdr.detectChanges();
//   }
//
//   get totalPaginas(): number {
//     return Math.max(1, Math.ceil(this.puestosFiltrados.length / this.itemsPorPagina));
//   }
//
//   get puestosPaginados(): Puesto[] {
//     const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
//     return this.puestosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
//   }
//
//   get paginas(): number[] {
//     return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
//   }
//
//   cambiarPagina(p: number) {
//     if (p >= 1 && p <= this.totalPaginas) {
//       this.paginaActual = p;
//       this.cdr.detectChanges();
//     }
//   }
//
//   abrirModalNuevo() {
//     this.modoEdicion = false;
//     this.idEditando = null;
//     this.guardando = false;
//     this.puestoActual = this.nuevoPuestoDTO();
//     this.modalAbierto = true;
//     this.cdr.detectChanges();
//   }
//
//   abrirModalEditar(puesto: Puesto) {
//     this.modoEdicion = true;
//     this.idEditando = puesto.idPuesto!;
//     this.guardando = false;
//     this.puestoActual = {
//       codigo: puesto.codigo,
//       sector: puesto.sector ?? '',
//       numero: puesto.numero ?? '',
//       descripcion: puesto.descripcion ?? ''
//     };
//     this.modalAbierto = true;
//     this.cdr.detectChanges();
//   }
//
//   cerrarModal() {
//     this.ngZone.run(() => {
//       this.modalAbierto = false;
//       this.guardando = false;
//       this.puestoActual = this.nuevoPuestoDTO();
//       this.idEditando = null;
//       this.cdr.detectChanges();
//     });
//   }
//
//   guardarPuesto() {
//     if (this.guardando) return;
//     if (!this.puestoActual.codigo.trim()) {
//       Swal.fire('Atención', 'El código del puesto es obligatorio', 'warning');
//       return;
//     }
//     this.guardando = true;
//     this.cdr.detectChanges();
//
//     const operacion = this.modoEdicion && this.idEditando
//       ? this.puestoService.actualizar(this.idEditando, this.puestoActual)
//       : this.puestoService.guardar(this.puestoActual);
//
//     operacion.subscribe({
//       next: () => {
//         this.ngZone.run(() => {
//           this.cerrarModal();
//           this.cargarPuestos();
//           Swal.fire({ title: this.modoEdicion ? 'Actualizado' : 'Guardado', text: `Puesto ${this.modoEdicion ? 'actualizado' : 'registrado'} correctamente`, icon: 'success', timer: 1500, showConfirmButton: false });
//         });
//       },
//       error: (err) => {
//         this.ngZone.run(() => {
//           this.guardando = false;
//           this.cdr.detectChanges();
//           Swal.fire('Error', err.error?.detalles?.[0] || 'Error al guardar', 'error');
//         });
//       }
//     });
//   }
//
//   eliminarPuesto(id: number | undefined) {
//     if (!id) return;
//     Swal.fire({
//       title: '¿Estás seguro?', text: 'El puesto será inhabilitado', icon: 'warning',
//       showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#ef4444',
//       confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.puestoService.eliminar(id).subscribe({
//           next: () => {
//             this.ngZone.run(() => {
//               this.cargarPuestos();
//               Swal.fire({ title: 'Eliminado', text: 'El puesto ha sido eliminado', icon: 'success', timer: 1500, showConfirmButton: false });
//             });
//           },
//           error: () => Swal.fire('Error', 'No se pudo eliminar el puesto', 'error')
//         });
//       }
//     });
//   }
// }
