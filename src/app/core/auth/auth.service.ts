// src/app/core/auth/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { AuthApi } from '../api/auth/auth.api';
import type { LoginRequest, LoginResponse } from '../api/auth/auth.models';

type StoredUser = { username: string; roles: string[] };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  constructor(
    private authApi: AuthApi,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.authApi.login(data).pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): StoredUser | null {
    if (!this.isBrowser()) return null;
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  }

  getUsername(): string | null {
    return this.getUser()?.username ?? null;
  }

  getRoles(): string[] {
    return this.getUser()?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some((r) => userRoles.includes(r));
  }

  private setSession(res: LoginResponse): void {
    if (!this.isBrowser()) return;
    const user: StoredUser = { username: res.username, roles: res.roles ?? [] };
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
