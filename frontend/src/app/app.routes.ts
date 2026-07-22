import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { FriendProfileComponent } from './pages/friend-profile/friend-profile';
import { GameDetailComponent } from './pages/game-detail/game-detail';
import { GamesComponent } from './pages/games/games';
import { LoginComponent } from './pages/login/login';
import { MyListComponent } from './pages/my-list/my-list';
import { RegisterComponent } from './pages/register/register';

export const routes: Routes = [
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'games',              component: GamesComponent },
      { path: 'games/:id',          component: GameDetailComponent },
      { path: 'my-list',            component: MyListComponent },
      { path: 'profile/:id',        component: FriendProfileComponent },
      { path: '', redirectTo: 'games', pathMatch: 'full' },
    ]
  },
];