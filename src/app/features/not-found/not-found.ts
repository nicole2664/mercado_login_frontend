import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound implements OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  esAdmin = signal(true); // Por defecto azul

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user'); //

      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Cambiamos la lógica: verificamos si explícitamente es CAJERO
          const isCajero = (user.roles ?? []).includes('CAJERO');
          this.esAdmin.set(!isCajero); // Si es cajero -> false (verde), si no -> true (azul)
          return;
        } catch (e) {
          console.error('Error al parsear usuario');
          this.esAdmin.set(true);
        }
      }

      const url = this.router.url;
      this.esAdmin.set(!url.includes('/pagos') && !url.includes('/nuevo'));
    }
  }

  contactarSoporte() {
    const mensaje = encodeURIComponent('Hola, necesito soporte con el sistema MarketPay');
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/51902752563?text=${mensaje}`, '_blank');
    }
  }
}
