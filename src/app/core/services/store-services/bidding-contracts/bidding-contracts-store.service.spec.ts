import { TestBed } from '@angular/core/testing';
import { procurementContractsInitialState } from '../../../store/procurement-contracts/reducers/procurement-contracts.reducers';
import { provideMockStore } from '@ngrx/store/testing';

import { BiddingContractsStoreService } from './bidding-contracts-store.service';

describe('BiddingContractsStoreService', () => {
  let service: BiddingContractsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(BiddingContractsStoreService);
    (service as any).store.dispatch = jest.fn();
  });

  it('should get state', () => {
    service.state$.subscribe((state) => {
      expect(state).toEqual(initialState.procurementContracts);
    });
  });

  it('should call contracts by process action', () => {
    service.getContractsByProcessAction('process-id-1', '');
    expect((service as any).store.dispatch).toHaveBeenCalled();
  });

  it('should call delete contract action', () => {
    service.deleteContractAction('process-id-1', null, true);
    expect((service as any).store.dispatch).toHaveBeenCalled();
  });
});

const initialState = {
  procurementContracts: { ...procurementContractsInitialState },
};
