import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { TranslateStore } from '@ngx-translate/core';
import { ProjectsBalancesEffects } from './project-Balances.effects';
import * as projectBalancesActions from '../actions/project-Balances.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { FiTransactionsApiService } from '../../../services';
import { TransactionHeaderBalances } from '../../../models';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('ProcurementContractsEffects', () => {
  let actions$: Observable<any>;
  let effects: ProjectsBalancesEffects;
  let fiTransactionsApiService: FiTransactionsApiService;
  let notificationGlobalService: NotificationGlobalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        ProjectsBalancesEffects,
        TranslateStore,
        provideMockActions(() => actions$),
        provideMockStore(),
        Store,
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
      ],
    });
    effects = TestBed.inject(ProjectsBalancesEffects);
    fiTransactionsApiService = TestBed.inject(FiTransactionsApiService);
    notificationGlobalService = TestBed.inject(NotificationGlobalService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactionsBalances$', () => {
    const projectBucketId = '12345';

    it('should dispatch getProjectBalancesSuccess action on success', () => {
      const balances: TransactionHeaderBalances = {
        originalIdb: 10,
        currentIdb: 10,
        availableBalance: 10,
        projectedAvailableBalance: 10,
        disbursedAmount: 10,
        disbursedPercent: 100,
        lastDisbursementDate: null,
        cofinanced: 10,
        cancellations: 10,
        budgetContributionProjectedAvailableBalance: 10,
        budgetContributionAvailableBalance: 10,
        localCounterpart: 10,
        totalAmountPendingJustification: 10,
        minimumAmountPendingJustification: 10,
        toJustifyPercent: 10,
        coFinancedDisbursed: 10,
        localCounterpartDisbursed: 10,
        cumulativeExtension: 1,
        currentDisbExpiration: '',
        financialPeriodDeadline: '',
        lastAdvanceOfFoundsANTDate: '',
        lastAdvanceOfFoundsANTAmount: 1,
        lastRequestNumber: 1,
        retroactiveFinancingInformation: {
          availRfAmount: 3,
          disbRfAmount: 4,
          hasRetroactiveFinancing: true,
          projAvailRfAmount: 3,
          projDisbRfAmount: 4,
          rfCurrentAmount: 5,
          rfOriginalAmount: 4,
        },
      };

      const action = projectBalancesActions.getProjectBalances({
        projectBucketId,
      });
      const completion = projectBalancesActions.getProjectBalancesSuccess({
        projectBalances: balances,
        projectBucketId,
      });

      jest
        .spyOn(fiTransactionsApiService, 'getProjectBalances')
        .mockReturnValueOnce(of(balances));

      actions$ = of(action);

      return effects.getTransactionsBalances$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            fiTransactionsApiService.getProjectBalances
          ).toHaveBeenCalledWith(projectBucketId);
        });
    });

    it('should dispatch getProjectBalancesError action on error', () => {
      const error = new Error('Error fetching project balances');
      const action = projectBalancesActions.getProjectBalances({
        projectBucketId,
      });
      const completion = projectBalancesActions.getProjectBalancesError({
        payload: error,
      });

      jest
        .spyOn(fiTransactionsApiService, 'getProjectBalances')
        .mockReturnValueOnce(throwError(error));

      const notificacionErrorSpy = jest
        .spyOn(notificationGlobalService, 'showError')
        .mockReturnValue();

      actions$ = of(action);

      return effects.getTransactionsBalances$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            fiTransactionsApiService.getProjectBalances
          ).toHaveBeenCalledWith(projectBucketId);

          expect(notificacionErrorSpy).toHaveBeenCalled();
        });
    });
  });
});
