import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({ standalone: true, template: '' })
export class HomeRedirectComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const roles = this.auth.getRoles();

    if (roles.includes('ADMIN')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (roles.includes('CAJERO')) {
      this.router.navigate(['/dashboard-caja']);
      return;
    }

    this.router.navigate(['/login']);
  }
}
