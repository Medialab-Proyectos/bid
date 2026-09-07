import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { LocalStorageService } from './localStorage.service';

const initialState = {
  preferences: {
    selectedLanguage: {
      code: 'en',
    },
  },
};

describe('LocalstorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: provideMockStore({ initialState }),
    });
    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get currentLanguage', () => {
    it('should return _currentLanguage value', () => {
      service.currentLanguage = 'en';
      expect(service.currentLanguage).toBe('en');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should set selectedLanguage and currentLanguage with the value from the store', () => {
      service.getCurrentLang();
      expect(service.currentLanguage).toBe('');
    });
  });
});
