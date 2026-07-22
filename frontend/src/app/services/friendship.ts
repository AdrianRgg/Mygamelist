import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FriendUser {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface Friend {
  friendship_id: number;
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface PendingRequest {
  id: number;
  sender: FriendUser;
  created_at: string;
}

export interface FriendProfile {
  user: FriendUser;
  games: any[];
  reviews: any[];
}

@Injectable({ providedIn: 'root' })
export class FriendshipService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<FriendUser[]> {
    return this.http.get<FriendUser[]>(`${this.apiUrl}/friends/search?q=${query}`);
  }

  sendRequest(receiverId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/send`, { receiver_id: receiverId });
  }

  getPending(): Observable<PendingRequest[]> {
    return this.http.get<PendingRequest[]>(`${this.apiUrl}/friends/pending`);
  }

  accept(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/friends/${id}/accept`, {});
  }

  reject(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/friends/${id}/reject`, {});
  }

  getFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends`);
  }

  removeFriend(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/${id}`);
  }

  getProfile(userId: number): Observable<FriendProfile> {
    return this.http.get<FriendProfile>(`${this.apiUrl}/friends/profile/${userId}`);
  }
}