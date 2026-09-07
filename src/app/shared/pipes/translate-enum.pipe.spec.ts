import { TranslateEnumPipe } from './translate-enum.pipe';
import { TranslateService } from '@ngx-translate/core';
import { EnumsStoreService } from '@core/services/store-services';
import { of } from 'rxjs';
import { Enums } from '../../core/models';

// Mock completo de TranslateService
jest.mock('@ngx-translate/core', () => ({
  TranslateService: jest.fn().mockImplementation(() => ({
    instant: jest.fn((key: string) => key),
    get: jest.fn((key: string) => of(key)),
    use: jest.fn(),
    setDefaultLang: jest.fn(),
    addLangs: jest.fn(),
    getBrowserLang: jest.fn(() => 'en'),
    onLangChange: of({}),
    onTranslationChange: of({}),
    onDefaultLangChange: of({}),
  })),
}));

// Mock completo de EnumsStoreService
jest.mock('@core/services/store-services', () => ({
  EnumsStoreService: jest.fn().mockImplementation(() => ({
    selectEnums: jest.fn(() => of({})),
    enumsObject: {},
    getEnums: jest.fn(() => of({})),
  })),
}));

describe('TranslateEnumPipe', () => {
  let pipe: TranslateEnumPipe;
  let translateService: TranslateService;
  let enumsStore: EnumsStoreService;

  beforeEach(() => {
    translateService = new TranslateService(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );
    enumsStore = new EnumsStoreService(null, null, null);
    pipe = new TranslateEnumPipe(translateService, enumsStore);
  });

  afterEach(() => {
    if (pipe) {
      pipe.ngOnDestroy();
    }
  });

  it('should create pipe', () => {
    expect(pipe).toBeTruthy();
  });

  describe('when store has no enums', () => {
    it('should show an empty string', () => {
      // Actualizamos el mock para este caso específico
      jest.spyOn(enumsStore, 'selectEnums').mockReturnValue(of(null));

      const value = pipe.transform(1, Enums.biddingProcessDocumentPackageCodes);

      expect(value).toBe('');
    });
  });
});
