import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  private router = inject(Router);
  loginData = {
    email: '',
    password: '',
  };

  onLogin() {
    console.log('Datos capturados:', this.loginData);
    // Si los datos no están vacíos, saltamos al dashboard
    if (this.loginData.email && this.loginData.password) {
      this.router.navigate(['/dashboard']);
    }
  }
}
