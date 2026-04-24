import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PermissionsService } from '../../core/auth/permissions.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private authz = inject(PermissionsService);

  esAdmin = signal(true);

  ngOnInit() {
    // Si estás usando SSR/hydration, este check evita efectos raros.
    if (!isPlatformBrowser(this.platformId)) return;

    this.esAdmin.set(this.authz.isAdmin());
  }

  contactarSoporte() {
    const mensaje = encodeURIComponent('Hola, necesito soporte con el sistema MarketPay');
    window.open(`https://wa.me/51902752563?text=${mensaje}`, '_blank');
  }
}
