import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { EnumsStoreService } from './enums-store.service';
import { AppState } from '@core/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const initialState: AppState = {
  enums: {
    enums: [
      {
        enumType: 'DocumentStatus',
        enumValues: ['DraftPendingUpload'],
      },
    ],
    loaded: true,
    loading: false,
    error: '',
  },
  projects: { projects: null, loaded: true, loading: false, error: false },
  permissions: {
    permissions: null,
    loaded: true,
    loading: false,
    error: false,
  },
  preferences: {
    preferences: null,
    loaded: true,
    loading: false,
    error: false,
  },
  contact: { contact: null, loaded: true, loading: false, error: false },
  translations: {
    translations: null,
    loaded: true,
    loading: false,
    error: false,
  },
  roles: { roles: null, loaded: true, loading: false, error: false },
} as any;

describe('EnumsStoreService', () => {
  let service: EnumsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
      imports: [MsalTestModule,HttpClientTestingModule],
    });
    service = TestBed.inject(EnumsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /* it('must return an array with the enums when there is a match', () => {
    const expectedArray = [
      {
        name: 'DraftPendingUpload',
        value: 'cnvg.fp.translation.enum.DocumentStatus.DraftPendingUpload',
      },
    ];
    expect(service.getEnum('DocumentStatus')).toEqual(expectedArray);
  });

  it('must return an empty array when there is no match', () => {
    expect(service.getEnum('testEnuma')).toEqual([]);
  }); */
});
