import { TestBed } from '@angular/core/testing';
import { PersistTransactionEditService } from './persist-transaction-edit.service';

describe('PersistTransactionEditService', () => {
  let service: PersistTransactionEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersistTransactionEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
