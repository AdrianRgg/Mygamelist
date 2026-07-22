import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TopRatedGame {
  game_igdb_id: string;
  game_name: string;
  avg_rating: number;
  review_count: number;
  game_cover: string | null;
}

export interface PopularGame {
  game_igdb_id: string;
  game_name: string;
  game_cover: string | null;
  total: number;
}

export interface FriendActivity {
  type: 'game_added' | 'review_added';
  user: { id: number; name: string; avatar_url: string | null };
  game_name: string;
  game_igdb_id: string;
  game_cover?: string | null;
  status?: string;
  rating?: number;
  body?: string;
  created_at: string;
}

export interface HomeData {
  top_rated: TopRatedGame[];
  popular: PopularGame[];
  activity: FriendActivity[];
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHome(): Observable<HomeData> {
    return this.http.get<HomeData>(`${this.apiUrl}/home`);
  }
}