import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type GameStatus = 'playing' | 'completed' | 'dropped' | 'pending';

export interface UserGame {
  id: number;
  user_id: number;
  game_igdb_id: string;
  game_name: string;
  game_cover: string | null;
  status: GameStatus;
  rating: number | null;
}

@Injectable({ providedIn: 'root' })
export class UserGamesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserGame[]> {
    return this.http.get<UserGame[]>(`${this.apiUrl}/user-games`);
  }

  getByIgdbId(igdbId: string): Observable<UserGame | null> {
    return this.http.get<UserGame | null>(`${this.apiUrl}/user-games/igdb/${igdbId}`);
  }

  add(gameIgdbId: string, gameName: string, gameCover: string | null, status: GameStatus, rating?: number): Observable<UserGame> {
    return this.http.post<UserGame>(`${this.apiUrl}/user-games`, {
      game_igdb_id: gameIgdbId,
      game_name:   gameName,
      game_cover:  gameCover,
      status,
      rating:      rating ?? null,
    });
  }

  updateStatus(id: number, status: GameStatus, rating?: number): Observable<UserGame> {
    return this.http.patch<UserGame>(`${this.apiUrl}/user-games/${id}`, {
      status,
      rating: rating ?? null,
    });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user-games/${id}`);
  }
}