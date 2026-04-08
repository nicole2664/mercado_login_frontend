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

  login(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  getRole() {
    return this.getUser()?.rol;
  }

  isLoggedIn() {
    return !!localStorage.getItem('user');
  }

  logout() {
    localStorage.removeItem('user');
  }
}
