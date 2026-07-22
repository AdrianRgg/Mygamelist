import { TestBed } from '@angular/core/testing';

import { Friendship } from './friendship';

describe('Friendship', () => {
  let service: Friendship;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Friendship);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
