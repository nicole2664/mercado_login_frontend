import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  loginData = { username: '', password: '' };

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, llena todos los espacios',
        icon: 'warning',
        confirmButtonColor: '#1d4ed8',
      });
      return;
    }

    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        // AuthService ya guardó token/user en localStorage
        const roles = res.roles ?? [];

        Swal.fire({
          title: '¡Bienvenido!',
          text: `Hola, ${res.username}`,
          icon: 'success',
          showConfirmButton: false,
          timer: 1200,
          timerProgressBar: true,
        }).then(() => {
          // Un solo punto de decisión: HomeRedirectComponent
          this.router.navigate(['/home']);
        });
      },
      error: (e) => {
        Swal.fire({
          title: 'Acceso denegado',
          text: e?.message ?? 'Usuario o contraseña incorrectos',
          icon: 'error',
          confirmButtonColor: '#1d4ed8',
        });
      },
    });
  }
}
