import { TestBed } from '@angular/core/testing';

import { UserGames } from './user-games';

describe('UserGames', () => {
  let service: UserGames;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserGames);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
