import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-layout-cajero',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './layout-cajero.html',
  styleUrl: './layout-cajero.css'
})
export class LayoutCajeroComponent implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); // Inyectamos el ID de la plataforma

  username: string = 'Cajero';

  ngOnInit() {
    // Solo ejecutamos esto si estamos en el NAVEGADOR (Browser)
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.username = user.username || 'Cajero';
        } catch (e) {
          console.error('Error al parsear el usuario', e);
        }
      }
    }
  }

  onLogout() {
    Swal.fire({
      title: '¿Cerrar turno?',
      text: "Se finalizará tu sesión actual",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // El verde de tu nuevo diseño
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user'); // Limpiamos los datos
        this.router.navigate(['/login']); // Regresamos al login
      }
    });
  }
}
