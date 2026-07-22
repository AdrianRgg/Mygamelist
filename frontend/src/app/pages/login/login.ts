import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.loading) return;
    this.error = '';
    this.loading = true;

    this.authService.login(this.email, this.password)
      .subscribe({
        next: () => this.router.navigate(['/games']),
        error: (err) => {
          this.error = err.error?.message || 'Credenciales incorrectas';
          this.loading = false;
        }
      });
  }
}