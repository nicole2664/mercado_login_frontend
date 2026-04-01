import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

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
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, llena todos los espacios para continuar',
        icon: 'warning',
        confirmButtonColor: '#1d4ed8'
      });
      return;
    }

    this.http.post('/api/login', this.loginData).subscribe({
      next: (response: any) => {
        console.log('Respuesta backend:', response);

        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Inicio de sesión correcto',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // En login.ts, dentro del .then() de la alerta de éxito:

          console.log("ROL RECIBIDO:", response.rol);

// PRUEBA MANUAL:
// Si te logueas como 'cajero1', vamos a FORZAR el verde
// para confirmar que el LayoutCajeroComponent funciona bien.

          if (this.loginData.username === 'cajero1') {
            this.router.navigate(['/cajero/dashboard']);
          } else {
            this.router.navigate(['/admin/dashboard']);
          }
        });
      },
      error: (error) => {
        console.log('Error:', error);

        Swal.fire({
          title: 'Acceso denegado',
          text: 'Usuario o contraseña incorrectos',
          icon: 'error',
          confirmButtonColor: '#1d4ed8'
        });
      },
    });
  }
}
