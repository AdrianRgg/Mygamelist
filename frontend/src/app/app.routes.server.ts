import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { GameDetailComponent } from './pages/game-detail/game-detail';
import { GamesComponent } from './pages/games/games';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

export const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'games',     component: GamesComponent },
      { path: 'games/:id', component: GameDetailComponent },
      { path: '', redirectTo: 'games', pathMatch: 'full' },
    ]
  },
];