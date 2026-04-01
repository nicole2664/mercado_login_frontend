import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Usamos la ruta corta gracias al PROXY de tu compañero
  private apiUrl = '/api/auth/login';

  // Esta función le envía el correo y la clave al Java de tu compañero
  login(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
