// src/app/core/api/http/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login'], { queryParams: { sesionExpirada: 1 } }).catch(() => {});
      }
      return throwError(() => err);
    }),
  );
};
