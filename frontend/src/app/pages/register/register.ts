import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
  if (this.loading) return;
  this.error = '';
  this.loading = true;

  this.authService.register(this.name, this.email, this.password, this.password_confirmation)
    .subscribe({
      next: () => {
  this.authService.clearSession();
  this.router.navigate(['/login']);
},
      error: (err) => {
        this.error = err.error?.message || 'Error al registrarse';
        this.loading = false;
      }
    });
}}