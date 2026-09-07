import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { KendoKeysMessageService } from './kendo-keys-message.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { provideMockStore } from '@ngrx/store/testing';

const translateServiceMock = {
  instant: jest.fn(),
};

const initialState = {
  preferences: {
    default: 'en',
    preferredLanguage: 'en',
    favoriteOperations: [
      { operationNumber: 'operationNumber1', favoriteProjects: ['1', '2'] },
    ],
    selectedLanguage: {
      code: 'en',
      name: 'English',
    },
  },
  selectedLanguage: {
    code: 'en',
    name: 'English',
  },
  loaded: false,
  loading: false,
  error: null,
} as any;
describe('KendoKeysMessageService', () => {
  let service: KendoKeysMessageService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DialogModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        NotificationService,
        provideMockStore({ initialState }),

        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });
    service = TestBed.inject(KendoKeysMessageService);
    translateService = TestBed.inject(TranslateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('translateKey', () => {});
  it('should return the translated message for the given key', () => {
    const spy = jest
      .spyOn(translateService, 'instant')
      .mockReturnValue('Translated Message');

    const key = 'kendo.grid.noRecords';
    const expectedResult = 'Translated Message';

    expect(service.translateKey(key)).toEqual(expectedResult);
    expect(spy).toHaveBeenCalledWith(key);
  });

  it('should return an array of translated values', () => {
    const translateKeyMock = jest
      .spyOn(service, 'translateKey')
      .mockReturnValueOnce('Translated Value 1')
      .mockReturnValueOnce('Translated Value 2')
      .mockReturnValueOnce('Translated Value 3');

    const values = [
      'kendo.grid.noRecords',
      'kendo.grid.columnsReset',
      'kendo.grid.columnsApply',
    ];
    const expectedTranslatedValues = [
      'Translated Value 1',
      'Translated Value 2',
      'Translated Value 3',
    ];

    const translatedValues = service.translateValues(values);

    expect(translatedValues).toEqual(expectedTranslatedValues);
    expect(translateKeyMock).toHaveBeenCalledTimes(3);
    expect(translateKeyMock).toHaveBeenNthCalledWith(1, 'kendo.grid.noRecords');
    expect(translateKeyMock).toHaveBeenNthCalledWith(
      2,
      'kendo.grid.columnsReset'
    );
    expect(translateKeyMock).toHaveBeenNthCalledWith(
      3,
      'kendo.grid.columnsApply'
    );
  });

  it('should set the localeId and notify with rtl value when language exists', () => {
    const value = 'fr';

    service.language = value;
    expect(service.language).toBe(value);
  });
});
