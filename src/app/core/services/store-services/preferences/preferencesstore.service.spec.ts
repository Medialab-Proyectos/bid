import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { PreferencesstoreService } from './preferencesstore.service';

describe('PreferencesstoreService', () => {
  let service: PreferencesstoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})],
    });
    service = TestBed.inject(PreferencesstoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
