import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Game {
  id: number;
  name: string;
  cover: string | null;
  summary: string | null;
  rating: number | null;
  release_date: string | null;
  platforms: string[];
  genres: string[];
  screenshots: string[];
  community_rating: number | null;
  review_count: number;
}

export interface GameSearchResult {
  data: Game[];
  page: number;
  has_more: boolean;
}

@Injectable({ providedIn: 'root' })
export class GamesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  search(query: string, page: number = 1): Observable<GameSearchResult> {
    return this.http.get<GameSearchResult>(`${this.apiUrl}/games/search/${query}/${page}`);
  }

  getGame(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/games/${id}`);
  }
}
