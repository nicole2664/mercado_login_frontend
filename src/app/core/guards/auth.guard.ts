import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // si no usas SSR, puedes borrar esto
  if (typeof window === 'undefined') return true;

  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
