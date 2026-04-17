// import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';
// import { SocioPuestoService } from '../../core/services/socio-puesto.service';
// import { SocioService } from '../../core/services/socio.service';
// import { PuestoService } from '../../core/services/puesto.service';
// import { SocioPuesto, SocioPuestoDTO } from '../../core/models/socio-puesto.model';
// import { Socio } from '../../core/models/socio.model';
// import { Puesto } from '../../core/models/puesto.model';
//
// @Component({
//   selector: 'app-socio-puesto',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './socio-puesto.html',
//   styleUrl: './socio-puesto.css'
// })
// export class SocioPuestoComponent implements OnInit {
//   private socioPuestoService = inject(SocioPuestoService);
//   private socioService = inject(SocioService);
//   private puestoService = inject(PuestoService);
//   private platformId = inject(PLATFORM_ID);
//   private cdr = inject(ChangeDetectorRef);
//   private ngZone = inject(NgZone);
//
//   asignaciones: SocioPuesto[] = [];
//   asignacionesFiltradas: SocioPuesto[] = [];
//   socios: Socio[] = [];
//   puestos: Puesto[] = [];
//   puestosLibres: Puesto[] = [];
//   dto: SocioPuestoDTO = { idSocio: 0, idPuesto: 0 };
//   historial: SocioPuesto[] = [];
//
//   textoBusqueda = '';
//   filtroSector = '';
//   fechaDesde = '';
//   fechaHasta = '';
//
//   esAdmin = false;
//   modalAbierto = false;
//   modalHistorialAbierto = false;
//   puestoSeleccionadoNombre = '';
//   cargando = false;
//
//   ngOnInit() {
//     if (!isPlatformBrowser(this.platformId)) return;
//     this.verificarRol();
//     this.cargarDatos();
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
//   // Sectores únicos de las asignaciones actuales
//   get sectoresDisponibles(): string[] {
//     const sectores = this.asignaciones
//       .map(a => a.puesto.sector)
//       .filter((s): s is string => !!s);
//     return [...new Set(sectores)].sort();
//   }
//
//   filtrar() {
//     let resultado = this.asignaciones;
//
//     // Filtro texto
//     const texto = this.textoBusqueda.toLowerCase().trim();
//     if (texto) {
//       resultado = resultado.filter(a =>
//         a.puesto.codigo.toLowerCase().includes(texto) ||
//         (a.puesto.sector ?? '').toLowerCase().includes(texto) ||
//         a.socio.nombre.toLowerCase().includes(texto) ||
//         a.socio.dni.includes(texto)
//       );
//     }
//
//     // Filtro sector
//     if (this.filtroSector) {
//       resultado = resultado.filter(a => a.puesto.sector === this.filtroSector);
//     }
//
//     // Filtro fecha desde
//     if (this.fechaDesde) {
//       resultado = resultado.filter(a =>
//         a.fechaAsignacion >= this.fechaDesde
//       );
//     }
//
//     // Filtro fecha hasta
//     if (this.fechaHasta) {
//       resultado = resultado.filter(a =>
//         a.fechaAsignacion <= this.fechaHasta
//       );
//     }
//
//     this.asignacionesFiltradas = resultado;
//     this.cdr.detectChanges();
//   }
//
//   setFiltroSector(sector: string) {
//     this.filtroSector = sector;
//     this.filtrar();
//   }
//
//   limpiarFechas() {
//     this.fechaDesde = '';
//     this.fechaHasta = '';
//     this.filtrar();
//   }
//
//   cargarDatos() {
//     this.cargando = true;
//     this.asignaciones = [];
//     this.asignacionesFiltradas = [];
//
//     this.socioService.listarTodos().subscribe(d => {
//       this.ngZone.run(() => {
//         this.socios = d;
//         this.cdr.detectChanges();
//       });
//     });
//
//     Promise.all([
//       new Promise<Puesto[]>(resolve => {
//         this.puestoService.listarTodos().subscribe(p => resolve(p));
//       }),
//       new Promise<number[]>(resolve => {
//         this.socioPuestoService.obtenerPuestosOcupados().subscribe(
//           ids => resolve(ids),
//           () => resolve([])
//         );
//       })
//     ]).then(([puestos, ocupadosIds]) => {
//       this.ngZone.run(() => {
//         this.puestos = puestos;
//         const ocupadosSet = new Set(ocupadosIds);
//         this.puestosLibres = puestos.filter(p => !ocupadosSet.has(p.idPuesto!));
//
//         let pendientes = ocupadosIds.length;
//         if (pendientes === 0) {
//           this.cargando = false;
//           this.filtrar();
//           this.cdr.detectChanges();
//           return;
//         }
//
//         ocupadosIds.forEach(idPuesto => {
//           this.socioPuestoService.obtenerAsignacionActivaPorPuesto(idPuesto).subscribe({
//             next: (asig) => {
//               this.ngZone.run(() => {
//                 this.asignaciones.push(asig);
//                 pendientes--;
//                 if (pendientes === 0) {
//                   this.cargando = false;
//                   this.filtrar();
//                 }
//                 this.cdr.detectChanges();
//               });
//             },
//             error: () => {
//               pendientes--;
//               if (pendientes === 0) {
//                 this.ngZone.run(() => {
//                   this.cargando = false;
//                   this.filtrar();
//                   this.cdr.detectChanges();
//                 });
//               }
//             }
//           });
//         });
//       });
//     });
//   }
//
//   abrirModalAsignar() {
//     this.dto = { idSocio: 0, idPuesto: 0 };
//     this.modalAbierto = true;
//     this.cdr.detectChanges();
//   }
//
//   cerrarModal() {
//     this.ngZone.run(() => {
//       this.modalAbierto = false;
//       this.cdr.detectChanges();
//     });
//   }
//
//   guardarAsignacion() {
//     if (!this.dto.idSocio || !this.dto.idPuesto) {
//       Swal.fire('Atención', 'Debe seleccionar un socio y un puesto', 'warning');
//       return;
//     }
//     this.socioPuestoService.asignar(this.dto).subscribe({
//       next: () => {
//         this.ngZone.run(() => {
//           this.cerrarModal();
//           this.cargarDatos();
//           Swal.fire({ title: 'Asignado', text: 'Socio asignado al puesto correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
//         });
//       },
//       error: (err) => Swal.fire('Error', err.error?.detalles?.[0] || 'Error al asignar', 'error')
//     });
//   }
//
//   verHistorial(idPuesto: number, codigoPuesto: string) {
//     this.puestoSeleccionadoNombre = codigoPuesto;
//     this.socioPuestoService.historialPorPuesto(idPuesto).subscribe({
//       next: (data) => {
//         this.ngZone.run(() => {
//           this.historial = data;
//           this.modalHistorialAbierto = true;
//           this.cdr.detectChanges();
//         });
//       },
//       error: () => Swal.fire('Error', 'No se pudo cargar el historial', 'error')
//     });
//   }
//
//   cerrarHistorial() {
//     this.ngZone.run(() => {
//       this.modalHistorialAbierto = false;
//       this.cdr.detectChanges();
//     });
//   }
//
//   desasignar(id: number) {
//     Swal.fire({
//       title: '¿Desasignar socio?', text: 'El puesto quedará libre', icon: 'warning',
//       showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
//       confirmButtonText: 'Sí, desasignar', cancelButtonText: 'Cancelar'
//     }).then(result => {
//       if (result.isConfirmed) {
//         this.socioPuestoService.desasignar(id).subscribe({
//           next: () => {
//             this.ngZone.run(() => {
//               this.cargarDatos();
//               Swal.fire({ title: 'Listo', text: 'Socio desasignado correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
//             });
//           },
//           error: () => Swal.fire('Error', 'No se pudo desasignar', 'error')
//         });
//       }
//     });
//   }
// }
