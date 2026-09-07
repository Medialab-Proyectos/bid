import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TransactionsStoreService } from './transactions-store.service';

const mockProjectBalances = {
  projectBalances: {
    originalIDB: 0,
    currentIDB: 0,
    projectedAvailableBalance: 0,
    disbursedPercent: 0,
    lastDisbusementDate: '2021-07-27T16:51:08.681Z',
    cofinanced: 0,
    localCounterpart: 0,
    projectedAvailableBudgetContribution: 0,
    totalAmountPendingJustification: 0,
    minimumAmountPendingJustification: 0,
    toJustifyPercent: 0,
  },
  loaded: false,
  loading: false,
  error: null,
};

function getInitialState() {
  return {
    projectBalances: {
      projectBalances: {
        originalIDB: 0,
        currentIDB: 0,
        projectedAvailableBalance: 0,
        disbursedPercent: 0,
        lastDisbusementDate: '2021-07-27T16:51:08.681Z',
        cofinanced: 0,
        localCounterpart: 0,
        projectedAvailableBudgetContribution: 0,
        totalAmountPendingJustification: 0,
        minimumAmountPendingJustification: 0,
        toJustifyPercent: 0,
      },
      loaded: false,
      loading: false,
      error: null,
    },
  };
}

const initialState = getInitialState();

describe('TransactionStoreService', () => {
  let service: TransactionsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(TransactionsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an observable with the expected data', (done) => {
    service.projectBalances().subscribe((data) => {
      expect(data).toEqual(mockProjectBalances);
      done();
    });
  });
});
