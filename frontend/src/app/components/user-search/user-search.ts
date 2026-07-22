import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { FriendshipService, FriendUser } from '../../services/friendship';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css'
})
export class UserSearchComponent {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  query = '';
  users: FriendUser[] = [];
  loading = false;
  open = false;
  sentRequests = new Set<number>();
  errorMap = new Map<number, string>();

  private search$ = new Subject<string>();

  constructor(private friendshipService: FriendshipService) {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) return of([]);
        this.loading = true;
        return this.friendshipService.searchUsers(q).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(users => {
      this.users = users;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onSearch(): void {
    this.open = true;
    this.search$.next(this.query);
  }

  sendRequest(user: FriendUser): void {
    this.friendshipService.sendRequest(user.id).subscribe({
      next: () => {
        this.sentRequests.add(user.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMap.set(user.id, err.error?.message || 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  close(): void {
    this.open = false;
    this.query = '';
    this.users = [];
  }
}