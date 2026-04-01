import { Component, inject, OnInit } from '@angular/core';
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

  username: string = 'Cajero'; // Valor por defecto

  ngOnInit() {
    // Intentamos recuperar el nombre del usuario que guardamos en el login
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.username = user.username || 'Cajero';
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
