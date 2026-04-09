import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  loginData = {
    username: '',
    password: '',
  };

  onLogin() {
    console.log('Datos capturados:', this.loginData);

    // VALIDACIÓN
    if (!this.loginData.username || !this.loginData.password) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, llena todos los espacios',
        icon: 'warning',
        confirmButtonColor: '#1d4ed8',
      });
      return;
    }

    // LLAMADA AL BACKEND
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        console.log('Respuesta backend:', response);

        // 💾 GUARDAR SESIÓN
        localStorage.setItem('user', JSON.stringify(response));

        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Inicio de sesión correcto',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          console.log('ROL RECIBIDO:', response.rol);

          // MAPA DE RUTAS POR ROL
          const roleRoutes: any = {
            ADMIN: '/admin/dashboard',
            CAJERO: '/cajero/dashboard',
          };

          const route = roleRoutes[response.rol];

          if (route) {
            this.router.navigate([route]);
          } else {
            console.warn('Rol no configurado:', response.rol);
            this.router.navigate(['/login']);
          }
        });
      },

      error: (error) => {
        console.log('Error:', error);

        Swal.fire({
          title: 'Acceso denegado',
          text: 'Usuario o contraseña incorrectos',
          icon: 'error',
          confirmButtonColor: '#1d4ed8',
        });
      },
    });
  }
}
