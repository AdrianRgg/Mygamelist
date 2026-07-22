import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { GameCardComponent } from '../../components/game-card/game-card';
import { Game, GamesService } from '../../services/games';
import { HomeData, HomeService } from '../../services/home';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule, GameCardComponent, RouterLink],
  templateUrl: './games.html',
  styleUrl: './games.css'
})
export class GamesComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  query = '';
  games: Game[] = [];
  loading = false;
  loadingMore = false;
  error = '';
  searched = false;
  currentPage = 1;
  hasMore = false;

  homeData: HomeData | null = null;
  homeLoading = true;

  statusLabels: Record<string, string> = {
    playing:   'añadió a Jugando',
    completed: 'marcó como Terminado',
    dropped:   'abandonó',
    pending:   'añadió a Pendientes',
  };

  private search$ = new Subject<string>();

  constructor(
    private gamesService: GamesService,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.homeService.getHome().subscribe({
      next: (data) => {
        this.homeData = data;
        this.homeLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.homeLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) return of(null);
        this.loading = true;
        this.error = '';
        this.currentPage = 1;
        this.games = [];
        return this.gamesService.search(query, 1).pipe(
          catchError(() => {
            this.error = 'Error al buscar juegos';
            return of(null);
          })
        );
      })
    ).subscribe(result => {
      if (result) {
        this.games = result.data;
        this.hasMore = result.has_more;
        this.currentPage = result.page;
        this.searched = true;
      } else {
        this.games = [];
        this.searched = false;
      }
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onSearch(): void {
    this.search$.next(this.query);
  }

  clearSearch(): void {
    this.query = '';
    this.games = [];
    this.searched = false;
    this.cdr.detectChanges();
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;

    this.gamesService.search(this.query, this.currentPage + 1).subscribe({
      next: (result) => {
        this.games = [...this.games, ...result.data];
        this.hasMore = result.has_more;
        this.currentPage = result.page;
        this.loadingMore = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingMore = false;
        this.cdr.detectChanges();
      }
    });
  }
}