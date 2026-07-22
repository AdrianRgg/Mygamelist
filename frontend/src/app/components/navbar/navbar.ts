import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';
import { NotificationsComponent } from '../notifications/notifications';
import { UserSearchComponent } from '../user-search/user-search';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, UserSearchComponent, NotificationsComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  get userName(): string {
    return this.authService.currentUser?.name || '';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
  }

  goRandom(): void {
    this.http.get<{ id: string }>(`${environment.apiUrl}/games/random`).subscribe({
      next: (res) => this.router.navigate(['/games', res.id]),
      error: () => {}
    });
  }
}