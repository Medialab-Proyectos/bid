import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { of, throwError, Observable } from 'rxjs';
import {
  BiddingContractApiService,
  BiddingProcessPlanService,
} from '@core/services/apis';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { ProcurementContractsEffects } from './procurement-contracts.effects';
import * as actions from '../actions/procurement-contracts.action';
import { BiddingContractStatusesEnum } from '@core/enums';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { take } from 'rxjs/operators';

const translateServiceMock = {
  instant: jest.fn(),
};
const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

describe('ProcurementContractsEffects', () => {
  let actions$: Observable<any>;
  let effects: ProcurementContractsEffects;
  let biddingProcessPlanService: BiddingProcessPlanService;
  let translateService: TranslateService;
  let biddingContractApiService: BiddingContractApiService;
  let notificationGlobalService: NotificationGlobalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        ProcurementContractsEffects,
        BiddingContractApiService,
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
        TranslateStore,
        provideMockActions(() => actions$),
        provideMockStore(),
        Store,
      ],
    });

    effects = TestBed.inject(ProcurementContractsEffects);
    biddingProcessPlanService = TestBed.inject(BiddingProcessPlanService);
    translateService = TestBed.inject(TranslateService);
    biddingContractApiService = TestBed.inject(BiddingContractApiService);
    notificationGlobalService = TestBed.inject(NotificationGlobalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProcurementContracts$', () => {
    it('should dispatch getContractsSuccess action with correct parameters on successful API response', () => {
      const processId = 'your-process-id';
      const processCode = 'your-process-code';
      const contracts = [
        {
          biddingContractId: '',
          amendments: [],
          visualCode: '',
          code: '',
          parentId: '',
          biddingContractsAwarded: null,
          contractStatus: BiddingContractStatusesEnum.EXECUTION,
          contractType: 1,
          endDate: '',
          idbAmount: 1,
          nationality: '',
          startDate: '',
          version: 1,
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
        },
      ];
      const action = actions.getContracts({ processId, processCode });
      const completion = actions.getContractsSuccess({
        processId,
        contracts,
        processCode,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanService, 'getBiddingContracts')
        .mockReturnValue(of({ biddingContracts: contracts }));
      jest.spyOn(translateService, 'instant');
      return effects.getProcurementContracts$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            biddingProcessPlanService.getBiddingContracts
          ).toHaveBeenCalledWith(processId);
        });
    });

    it('should dispatch getContractsError action with correct parameters on API error', () => {
      const processId = 'your-process-id';
      const processCode = 'your-process-code';
      const error = new Error('API error');
      const action = actions.getContracts({ processId, processCode });
      const completion = actions.getContractsError({
        processId,
        payload: error,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanService, 'getBiddingContracts')
        .mockReturnValue(throwError(error));

      return effects.getProcurementContracts$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            biddingProcessPlanService.getBiddingContracts
          ).toHaveBeenCalledWith(processId);
        });
    });
  });

  describe('deleteContract$', () => {
    it('should dispatch deleteContractSuccess action and show success notification on successful contract deletion', () => {
      const contractId = 'your-contract-id';
      const processId = 'your-process-id';
      const isCopy = true;

      const action = actions.deleteContract({ contractId, processId, isCopy });
      const completion = actions.deleteContractSuccess({
        contractId,
        processId,
        isCopy,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingContractApiService, 'deleteContractV3')
        .mockReturnValue(of(null));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-success-message');
      jest.spyOn(notificationGlobalService, 'showSuccess').mockImplementation();

      return effects.deleteContract$.toPromise().then((resultAction) => {
        expect(biddingContractApiService.deleteContractV3).toHaveBeenCalledWith(
          contractId
        );
        expect(translateService.instant).toHaveBeenCalledWith(
          'CONTRACT.DELETE_SUCCESS_TOAST'
        );
        expect(notificationGlobalService.showSuccess).toHaveBeenCalledWith(
          'your-success-message',
          'right',
          'top',
          7000
        );
        expect(notificationGlobalService.showError).not.toHaveBeenCalled();
        expect(resultAction).toEqual(completion);
      });
    });

    it('should dispatch deleteContractError action with error payload and show error notification on failed contract deletion', () => {
      const contractId = 'your-contract-id';
      const processId = 'your-process-id';
      const isCopy = true;
      const error = new Error('your-error');

      const action = actions.deleteContract({ contractId, processId, isCopy });
      const completion = actions.deleteContractError({
        processId,
        payload: error,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingContractApiService, 'deleteContractV3')
        .mockReturnValue(throwError(error));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-error-message1');
      jest.spyOn(notificationGlobalService, 'showError').mockImplementation();

      return effects.deleteContract$.toPromise().then((resultAction) => {
        expect(biddingContractApiService.deleteContractV3).toHaveBeenCalledWith(
          contractId
        );
        expect(translateService.instant).toHaveBeenCalledWith(
          'CONTRACT.DELETE_ERROR_TOAST'
        );
        expect(notificationGlobalService.showError).toHaveBeenCalledWith(
          'your-error-message1',
          'right',
          'top',
          7000
        );
        expect(resultAction).toEqual(completion);
      });
    });
  });

  describe('terminateContract$', () => {
    it('should dispatch terminateContractSuccess action and show success notification on successful contract termination', () => {
      const contractId = 'your-contract-id';
      const processId = 'your-process-id';
      const lang = 'en';

      const action = actions.terminateContract({ contractId, processId, lang });
      const completion = actions.terminateContractSuccess({
        contractId,
        processId,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingContractApiService, 'terminateContract')
        .mockReturnValue(of(null));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-success-message');
      jest.spyOn(notificationGlobalService, 'showSuccess').mockImplementation();

      return effects.terminateContract$.toPromise().then((resultAction) => {
        expect(
          biddingContractApiService.terminateContract
        ).toHaveBeenCalledWith(contractId, lang);
        expect(translateService.instant).toHaveBeenCalledWith(
          'CONTRACT.TERMINATE_SUCCESS_TOAST'
        );
        expect(notificationGlobalService.showSuccess).toHaveBeenCalledWith(
          'your-success-message',
          'right',
          'top',
          7000
        );
        expect(notificationGlobalService.showError).not.toHaveBeenCalled();

        expect(resultAction).toEqual(completion);
      });
    });

    it('should dispatch terminateContractError action with error payload and show error notification on failed contract termination', () => {
      const contractId = 'your-contract-id';
      const processId = 'your-process-id';
      const lang = 'en';
      const error = new Error('your-error');

      const action = actions.terminateContract({ contractId, processId, lang });
      const completion = actions.terminateContractError({
        processId,
        payload: error,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingContractApiService, 'terminateContract')
        .mockReturnValue(throwError(error));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-error-message2');
      jest.spyOn(notificationGlobalService, 'showError').mockImplementation();

      return effects.terminateContract$.toPromise().then((resultAction) => {
        expect(
          biddingContractApiService.terminateContract
        ).toHaveBeenCalledWith(contractId, lang);
        expect(translateService.instant).toHaveBeenCalledWith(
          'CONTRACT.TERMINATE_ERROR_TOAST'
        );
        expect(notificationGlobalService.showError).toHaveBeenCalledWith(
          'your-error-message2',
          'right',
          'top',
          7000
        );
        expect(resultAction).toEqual(completion);
      });
    });
  });

  describe('completeContract$', () => {
    it('should dispatch completeContractSuccess action and show success notification on successful contract completion', () => {
      const contractId = 'your-contract-id';
      const processId = 'your-process-id';
      const lang = 'en';

      const action = actions.completeContract({ contractId, processId, lang });
      const completion = actions.completeContractSuccess({
        contractId,
        processId,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingContractApiService, 'completeContract')
        .mockReturnValue(of(null));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-success-message');
      jest.spyOn(notificationGlobalService, 'showSuccess').mockImplementation();

      return effects.completeContract$
        .pipe(take(1))
        .toPromise()
        .then((resultAction) => {
          expect(
            biddingContractApiService.completeContract
          ).toHaveBeenCalledWith(contractId, lang);
          expect(translateService.instant).toHaveBeenCalledWith(
            'CONTRACT.COMPLETE_SUCCESS_TOAST'
          );
          expect(notificationGlobalService.showSuccess).toHaveBeenCalledWith(
            'your-success-message',
            'right',
            'top',
            7000
          );
          expect(notificationGlobalService.showError).not.toHaveBeenCalled();

          expect(resultAction).toEqual(completion);
        });
    });

    it('should dispatch completeContractError action with error payload and show error notification on failed contract completion', () => {
      const contractId = 'your-contract-id';
      const processId = 'your-process-id';
      const lang = 'en';
      const error = new Error('your-error');

      const action = actions.completeContract({ contractId, processId, lang });
      const completion = actions.completeContractError({
        processId,
        payload: error,
      });

      actions$ = of(action);
      jest
        .spyOn(biddingContractApiService, 'completeContract')
        .mockReturnValue(throwError(error));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-error-message3');
      jest.spyOn(notificationGlobalService, 'showError').mockImplementation();

      return effects.completeContract$.toPromise().then((resultAction) => {
        expect(biddingContractApiService.completeContract).toHaveBeenCalledWith(
          contractId,
          lang
        );
        expect(translateService.instant).toHaveBeenCalledWith(
          'CONTRACT.COMPLETE_ERROR_TOAST'
        );
        expect(notificationGlobalService.showError).toHaveBeenCalledWith(
          'your-error-message3',
          'right',
          'top',
          7000
        );
        expect(resultAction).toEqual(completion);
      });
    });
  });
});
