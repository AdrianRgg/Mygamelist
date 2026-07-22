import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Friend, FriendshipService } from '../../services/friendship';
import { ProfileService } from '../../services/profile';
import { GameStatus, UserGame, UserGamesService } from '../../services/user-games';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-list.html',
  styleUrl: './my-list.css'
})
export class MyListComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  games: UserGame[] = [];
  friends: Friend[] = [];
  loading = true;
  filter: GameStatus | 'all' = 'all';
reviews: any[] = [];
  avatarUrl: string | null = null;
  userName = '';
  uploadingAvatar = false;

  stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  donutSegments: {
    status: string;
    label: string;
    color: string;
    count: number;
    percent: number;
    dashArray: string;
    dashOffset: string;
  }[] = [];

  statusLabels: Record<GameStatus, string> = {
    playing:   '🎮 Jugando',
    completed: '✅ Terminado',
    dropped:   '❌ Abandonado',
    pending:   '⏳ Pendiente',
  };

  filters: { value: GameStatus | 'all', label: string }[] = [
    { value: 'all',       label: 'Todos' },
    { value: 'playing',   label: '🎮 Jugando' },
    { value: 'completed', label: '✅ Terminados' },
    { value: 'dropped',   label: '❌ Abandonados' },
    { value: 'pending',   label: '⏳ Pendientes' },
  ];

  constructor(
    private userGamesService: UserGamesService,
    private profileService: ProfileService,
    private authService: AuthService,
    private friendshipService: FriendshipService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.userName = this.authService.currentUser?.name || '';

    this.profileService.getProfile().subscribe({
  next: (res) => {
    this.avatarUrl = res.avatar_url;
    this.userName = res.user.name;
    this.reviews = res.reviews;
    this.cdr.detectChanges();
  }
});

    this.userGamesService.getAll().subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
        this.buildDonut();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.friendshipService.getFriends().subscribe({
      next: (friends) => {
        this.friends = friends;
        this.cdr.detectChanges();
      }
    });
  }

  buildDonut(): void {
    const total = this.games.length;
    if (total === 0) return;

    const config = [
      { status: 'playing',   label: 'Jugando',    color: '#7C3AED' },
      { status: 'completed', label: 'Terminados',  color: '#10B981' },
      { status: 'dropped',   label: 'Abandonados', color: '#EF4444' },
      { status: 'pending',   label: 'Pendientes',  color: '#F59E0B' },
    ];

    const circumference = 100;
    let offset = 0;

    this.donutSegments = config.map(c => {
      const count = this.games.filter(g => g.status === c.status).length;
      const percent = Math.round((count / total) * 100);
      const dash = (count / total) * circumference;
      const segment = {
        ...c,
        count,
        percent,
        dashArray: `${dash} ${circumference - dash}`,
        dashOffset: `${-offset}`,
      };
      offset += dash;
      return segment;
    });
  }

  get filteredGames(): UserGame[] {
    const filtered = this.filter === 'all'
      ? [...this.games]
      : this.games.filter(g => g.status === this.filter);

    return filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  setFilter(filter: GameStatus | 'all'): void {
    this.filter = filter;
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploadingAvatar = true;

    this.profileService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.avatarUrl = res.avatar_url;
        this.uploadingAvatar = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadingAvatar = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeFriend(friendshipId: number): void {
    this.friendshipService.removeFriend(friendshipId).subscribe({
      next: () => {
        this.friends = this.friends.filter(f => f.friendship_id !== friendshipId);
        this.cdr.detectChanges();
      }
    });
  }

  getStarArray(rating: number | null): { star: number, filled: boolean }[] {
    return [1, 2, 3, 4, 5].map(s => ({
      star: s,
      filled: (rating ?? 0) >= s * 2
    }));
  }
}