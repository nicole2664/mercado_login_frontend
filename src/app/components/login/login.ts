import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private router = inject(Router);
  private http = inject(HttpClient);

  loginData = {
    username: '',
    password: '',
  };

  onLogin() {
    console.log('Datos capturados:', this.loginData);

    if (!this.loginData.username || !this.loginData.password) {
      alert('Por favor, completa tus datos');
      return;
    }

    this.http.post('/api/login', this.loginData).subscribe({
      next: (response: any) => {
        console.log('Respuesta backend:', response);

        alert('Login correcto');

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.log('Error:', error);

        alert('Credenciales incorrectas');
      },
    });
  }
}
