import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (typeof window === 'undefined') return true;

  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);

  const rolesRequeridos = route.data['roles'] as string[] | undefined;
  if (!rolesRequeridos || rolesRequeridos.length === 0) return true;

  return auth.hasAnyRole(rolesRequeridos) ? true : router.createUrlTree(['/login']);
};
