import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../core/auth/auth.service';
import { PermissionsService } from '../../core/auth/permissions.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  authz = inject(PermissionsService);

  // username basado en sesión
  username = signal(this.auth.getUsername() ?? (this.authz.isAdmin() ? 'Admin' : 'Cajero'));

  // tema basado en rol (NO en URL)
  esAdmin = computed(() => this.authz.isAdmin());
  colorTema = computed(() => (this.esAdmin() ? 'blue' : 'emerald'));

  logout() {
    Swal.fire({
      title: this.esAdmin() ? '¿Cerrar sesión?' : '¿Cerrar turno?',
      text: 'Se finalizará tu sesión actual',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: this.esAdmin() ? '#1d4ed8' : '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
