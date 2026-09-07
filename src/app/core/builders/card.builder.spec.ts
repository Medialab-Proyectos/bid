import { TestBed } from '@angular/core/testing';
import { CardBuilder } from './card.builder';

describe('Should build informational object', () => {
  let service: CardBuilder;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [CardBuilder],
    });

    service = TestBed.inject(CardBuilder);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
