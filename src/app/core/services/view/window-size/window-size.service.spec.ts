import { TestBed } from '@angular/core/testing';

import { WindowSizeService } from '@core/services/view';

describe('WindowSizeService', () => {
  let service: WindowSizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: 'windowObject', useValue: window }],
    });
    service = TestBed.inject(WindowSizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
