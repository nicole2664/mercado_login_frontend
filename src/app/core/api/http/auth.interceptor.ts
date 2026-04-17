// src/app/core/api/http/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { API_CONFIG } from '../api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // No token o request a login: deja pasar
  const isLogin = req.url.includes(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`);
  if (!token || isLogin) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
