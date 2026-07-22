import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FriendProfile, FriendshipService } from '../../services/friendship';

@Component({
  selector: 'app-friend-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './friend-profile.html',
  styleUrl: './friend-profile.css'
})
export class FriendProfileComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  profile: FriendProfile | null = null;
  loading = true;
  error = '';

  filter: string = 'all';
  sortOrder: 'desc' | 'asc' = 'desc';

  donutSegments: any[] = [];

  statusLabels: Record<string, string> = {
    playing:   '🎮 Jugando',
    completed: '✅ Terminado',
    dropped:   '❌ Abandonado',
    pending:   '⏳ Pendiente',
  };

  filters: { value: string, label: string }[] = [
    { value: 'all',       label: 'Todos' },
    { value: 'playing',   label: '🎮 Jugando' },
    { value: 'completed', label: '✅ Terminados' },
    { value: 'dropped',   label: '❌ Abandonados' },
    { value: 'pending',   label: '⏳ Pendientes' },
  ];

  constructor(
    private route: ActivatedRoute,
    private friendshipService: FriendshipService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const userId = Number(this.route.snapshot.paramMap.get('id'));

    this.friendshipService.getProfile(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
        this.buildDonut();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No puedes ver este perfil';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredGames(): any[] {
    if (!this.profile) return [];

    const filtered = this.filter === 'all'
      ? [...this.profile.games]
      : this.profile.games.filter((g: any) => g.status === this.filter);

    return filtered.sort((a: any, b: any) =>
      this.sortOrder === 'desc'
        ? (b.rating ?? 0) - (a.rating ?? 0)
        : (a.rating ?? 0) - (b.rating ?? 0)
    );
  }

  setFilter(filter: string): void {
    this.filter = filter;
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
  }

  buildDonut(): void {
    if (!this.profile) return;
    const total = this.profile.games.length;
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
      const count = this.profile!.games.filter((g: any) => g.status === c.status).length;
      const percent = Math.round((count / total) * 100);
      const dash = (count / total) * circumference;
      const segment = {
        ...c, count, percent,
        dashArray: `${dash} ${circumference - dash}`,
        dashOffset: `${-offset}`,
      };
      offset += dash;
      return segment;
    });
  }

  getStarArray(rating: number | null): boolean[] {
    return [1, 2, 3, 4, 5].map(s => (rating ?? 0) >= s * 2);
  }
}