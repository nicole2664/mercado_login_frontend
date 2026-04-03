import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Ruta del backend (usando proxy)
  private apiUrl = '/api/login';

  // 🔐 LOGIN
  login(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // 📦 OBTENER USUARIO
  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  // 🎭 OBTENER ROL
  getRole() {
    return this.getUser()?.rol;
  }

  // 🔓 VALIDAR SI ESTÁ LOGUEADO
  isLoggedIn() {
    return !!localStorage.getItem('user');
  }

  // 🚪 LOGOUT
  logout() {
    localStorage.removeItem('user');
  }
}
