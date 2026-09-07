import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { GeneralProcurementDocumentsStoreService } from '..';

describe('GeneralProcurementDocumentsService', () => {
  let service: GeneralProcurementDocumentsStoreService;
  class fakeService {}
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Store, useValue: fakeService }],
    });
    service = TestBed.inject(GeneralProcurementDocumentsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
