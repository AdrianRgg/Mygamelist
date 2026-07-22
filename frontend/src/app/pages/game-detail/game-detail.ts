import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Game, GamesService } from '../../services/games';
import { Review, ReviewsService } from '../../services/reviews';
import { GameStatus, UserGame, UserGamesService } from '../../services/user-games';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.css'
})
export class GameDetailComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  game: Game | null = null;
  userGame: UserGame | null = null;
  selectedStatus: GameStatus = 'pending';
  selectedListRating = 0;
  hoverListRating = 0;

  reviews: Review[] = [];
  myReview: Review | null = null;
  newRating = 5;
  newBody = '';
  reviewError = '';
  reviewLoading = false;

  loading = true;
  saving = false;
  error = '';

  activeScreenshot: string | null = null;
  stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  hoverRating = 0;

  statusLabels: Record<GameStatus, string> = {
    playing:   '🎮 Jugando',
    completed: '✅ Terminado',
    dropped:   '❌ Abandonado',
    pending:   '⏳ Pendiente',
  };

  statuses: GameStatus[] = ['playing', 'completed', 'dropped', 'pending'];

  constructor(
    private route: ActivatedRoute,
    private gamesService: GamesService,
    private userGamesService: UserGamesService,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
  if (!isPlatformBrowser(this.platformId)) return;

  this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));
    const igdbId = String(id);

    // Reiniciar estado
    this.game = null;
    this.userGame = null;
    this.reviews = [];
    this.myReview = null;
    this.loading = true;
    this.selectedListRating = 0;
    this.cdr.detectChanges();

    this.gamesService.getGame(id).subscribe({
      next: (game) => {
        this.game = game;
        this.loading = false;
        this.cdr.detectChanges();

        this.userGamesService.getByIgdbId(igdbId).subscribe({
          next: (userGame) => {
            this.userGame = (userGame && userGame.id) ? userGame : null;
            if (this.userGame) {
              this.selectedStatus = this.userGame.status;
              this.selectedListRating = this.userGame.rating ?? 0;
            }
            this.cdr.detectChanges();
          }
        });

        this.loadReviews(igdbId);
      },
      error: () => {
        this.error = 'No se pudo cargar el juego';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  });
}

  openScreenshot(url: string): void {
    this.activeScreenshot = url;
    this.cdr.detectChanges();
  }

  setRating(star: number): void {
    this.newRating = star;
  }

  setListRating(star: number): void {
    this.selectedListRating = star;
  }

  setListRatingFromStar(star: number, half: boolean): void {
    this.selectedListRating = half ? star * 2 - 1 : star * 2;
  }

  hoverListRatingFromStar(star: number, half: boolean): void {
    this.hoverListRating = half ? star * 2 - 1 : star * 2;
  }

  getStarFill(star: number, rating: number): 'full' | 'half' | 'empty' {
    const value = this.hoverListRating || rating;
    if (value >= star * 2) return 'full';
    if (value >= star * 2 - 1) return 'half';
    return 'empty';
  }

  loadReviews(igdbId: string): void {
    this.reviewsService.getReviews(igdbId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.cdr.detectChanges();
      }
    });

    this.reviewsService.getMyReview(igdbId).subscribe({
      next: (review) => {
        this.myReview = (review && review.id) ? review : null;
        this.cdr.detectChanges();
      }
    });
  }

  submitReview(): void {
    if (!this.game || this.reviewLoading) return;
    if (this.newBody.trim().length < 10) {
      this.reviewError = 'La reseña debe tener al menos 10 caracteres';
      return;
    }

    this.reviewLoading = true;
    this.reviewError = '';

    this.reviewsService.create(
      String(this.game.id),
      this.game.name,
      this.newRating,
      this.newBody
    ).subscribe({
      next: (review) => {
        this.myReview = review;
        this.reviews = [review, ...this.reviews];
        this.newBody = '';
        this.newRating = 5;
        this.reviewLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.reviewError = err.error?.message || 'Error al publicar la reseña';
        this.reviewLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteReview(): void {
    if (!this.myReview) return;

    this.reviewsService.delete(this.myReview.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.myReview!.id);
        this.myReview = null;
        this.cdr.detectChanges();
      }
    });
  }

  saveToList(): void {
    if (!this.game || this.saving) return;
    this.saving = true;

    if (this.userGame) {
      this.userGamesService.updateStatus(
        this.userGame.id,
        this.selectedStatus,
        this.selectedListRating || undefined
      ).subscribe({
        next: (updated) => {
          this.userGame = updated;
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.userGamesService.add(
        String(this.game.id),
        this.game.name,
        this.game.cover,
        this.selectedStatus,
        this.selectedListRating || undefined
      ).subscribe({
        next: (userGame) => {
          this.userGame = userGame;
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  removeFromList(): void {
    if (!this.userGame || this.saving) return;
    this.saving = true;

    this.userGamesService.remove(this.userGame.id).subscribe({
      next: () => {
        this.userGame = null;
        this.selectedListRating = 0;
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}