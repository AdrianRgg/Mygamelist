import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProfileResponse {
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
  avatar_url: string | null;
  reviews: {
    id: number;
    game_igdb_id: string;
    game_name: string;
    rating: number;
    body: string;
    created_at: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`);
  }

  uploadAvatar(file: File): Observable<ProfileResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<ProfileResponse>(`${this.apiUrl}/profile/avatar`, formData);
  }

  updateName(name: string): Observable<ProfileResponse> {
    const formData = new FormData();
    formData.append('name', name);
    return this.http.post<ProfileResponse>(`${this.apiUrl}/profile/avatar`, formData);
  }
}