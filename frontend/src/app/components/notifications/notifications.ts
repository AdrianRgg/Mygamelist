import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FriendshipService, PendingRequest } from '../../services/friendship';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  open = false;
  pending: PendingRequest[] = [];

  constructor(private friendshipService: FriendshipService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadPending();
  }

  loadPending(): void {
    this.friendshipService.getPending().subscribe({
      next: (pending) => {
        this.pending = pending;
        this.cdr.detectChanges();
      }
    });
  }

  accept(id: number): void {
    this.friendshipService.accept(id).subscribe({
      next: () => {
        this.pending = this.pending.filter(p => p.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  reject(id: number): void {
    this.friendshipService.reject(id).subscribe({
      next: () => {
        this.pending = this.pending.filter(p => p.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.loadPending();
  }
}