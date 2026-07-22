import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Review {
  id: number;
  user_id: number;
  game_igdb_id: string;
  game_name: string;
  rating: number;
  body: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReviews(igdbId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/${igdbId}`);
  }

  getMyReview(igdbId: string): Observable<Review | null> {
    return this.http.get<Review | null>(`${this.apiUrl}/reviews/${igdbId}/mine`).pipe(
      catchError(() => of(null))
    );
  }

  create(igdbId: string, gameName: string, rating: number, body: string): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, {
      game_igdb_id: igdbId,
      game_name:   gameName,
      rating,
      body
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }
}