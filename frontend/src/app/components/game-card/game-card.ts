import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Game } from '../../services/games';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css'
})
export class GameCardComponent {
  @Input() game!: Game;
}