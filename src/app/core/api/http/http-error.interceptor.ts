// src/app/core/api/http/http-error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

type ApiError = {
  error: string;
  detalles: string[];
  fecha: string;
};

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Si backend manda ApiError:
      const apiError = err.error as Partial<ApiError> | null;
      const message =
        apiError?.detalles?.[0] || apiError?.error || err.message || 'Ocurrió un error inesperado';

      // Solo alerta si el error NO es 401/403 (ya manejados por el AuthInterceptor)
      if (!(err.status === 401 || err.status === 403)) {
        alert(message); // Reemplaza por snackbar/toast si lo prefieres
      }
      return throwError(() => ({
        status: err.status,
        message,
        raw: err,
      }));
    }),
  );
};
