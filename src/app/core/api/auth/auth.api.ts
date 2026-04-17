// src/app/core/api/auth/auth.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl, API_CONFIG } from '../api.config';
import { LoginRequest, LoginResponse } from './auth.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(apiUrl(API_CONFIG.endpoints.auth.login), body);
  }
}
