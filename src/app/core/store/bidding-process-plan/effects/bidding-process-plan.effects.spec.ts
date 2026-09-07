import * as getBiddingProcessPlanActions from '../actions/bidding-process-plan.actions';
import { BiddingProcessPlanService } from '@core/services/apis';
import { TestBed } from '@angular/core/testing';
import { BiddingProcessPlanEffects } from './bidding-process-plan.effects';
import { of, Observable, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ScannedActionsSubject,
  StateObservable,
  Store,
  ReducerManager,
  ActionsSubject,
  StoreModule,
} from '@ngrx/store';
import { NotificationService } from '@progress/kendo-angular-notification';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import {
  GetBiddingProcessPlanResponse,
  BiddingProcessProcurementProcess,
  GetBiddingProcurementProcessesByProcessPlanIdResponse,
  GetBiddingProcurementProcessByIdResponse,
} from '@core/models';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';

describe('getParticipants$', () => {
  let biddingProcessPlanSvc: BiddingProcessPlanService;
  let effects: BiddingProcessPlanEffects;
  let actions$: Observable<any>;
  let notificationService: NotificationGlobalService;
  let translateService: TranslateService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        MsalTestModule,
      ],
      providers: [
        BiddingProcessPlanEffects,
        NotificationService,
        Store,
        ReducerManager,
        StateObservable,
        ActionsSubject,
        BiddingProcessPlanService,
        WorkflowSharedService,
        { provide: ScannedActionsSubject, useValue: {} },
        provideMockStore({}),
        provideMockActions(() => actions$),
      ],
    });
    biddingProcessPlanSvc = TestBed.inject(BiddingProcessPlanService);
    effects = TestBed.inject(BiddingProcessPlanEffects);
    notificationService = TestBed.inject(NotificationGlobalService);
    translateService = TestBed.inject(TranslateService);
  });

  describe('getBiddingProcessPlan$', () => {
    it('should dispatch GetBiddingProcesses action and return BiddingProcessPlanSuccess action on success', async () => {
      const projectBucketId = '123';
      const response: GetBiddingProcessPlanResponse = {
        biddingProcessPlan: {
          id: 'id',
          projectBucketId: 'projectBucketId',
          version: 1,
          status: 1,
          approvedDate: '30/01/2000',
          approvedBy: 'xd',
        },
      };
      actions$ = of(
        getBiddingProcessPlanActions.getBiddingProcessPlan({ projectBucketId })
      );
      jest
        .spyOn(biddingProcessPlanSvc, 'getBiddingProcessPlan')
        .mockReturnValue(of(response));
      jest.spyOn(effects['store'], 'dispatch').mockImplementation();

      return effects.getBiddingProcessPlan$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(
          getBiddingProcessPlanActions.getBiddingProcessPlanSuccess({
            biddingProcessPlan: response.biddingProcessPlan,
          })
        );
        expect(effects['store'].dispatch).toHaveBeenCalledWith(
          getBiddingProcessPlanActions.getBiddingProcesses({
            biddingProcessPlanId: response.biddingProcessPlan.id,
          })
        );
      });
    });
  });

  describe('getBiddingProcesses$', () => {
    it('should dispatch getBiddingProcessesSuccess action with biddingProcessProcurementProcesses', async () => {
      const biddingProcessPlanId = 'your-bidding-process-plan-id';
      const procurementProcesses: BiddingProcessProcurementProcess[] = [
        {
          isMigrated: false,
          packagesUnderReview: false,
          biddingProcessPlanId: 'b4952feb-3947-4d10-bd3c-923d4adbbbd7',
          code: 'PN-L1095-P00127',
          description: 'CFI-6759-8',
          totalAcumulatedAmount: 0,
          sustainabilityDescription: '',
          totalComments: 0,
          advanceMilestone: {
            totalCompleted: 1,
            total: 10,
            delayed: true,
            currentMilestone: null,
          },
          componentName: 'Componente 1. Electrificación rural en red',
          bafo: null,
          sepaPeclaId: '',
          lots: null,
          category: {
            name: 'PROCT_WORKS',
            id: 5,
          },
          procurementMethod: {
            name: 'PROCT_CBSSTEWP',
            id: 79,
          },
          supervisionMethod: {
            name: 'ExPost',
            id: 1,
          },
          status: 7,
          sustainability: null,
          goodsReference: null,
          id: '49a2f749-2ed1-4fa3-8ebc-0abbf707a9fc',
          manualId: '',
          name: 'CFI-6759-8',
          projectAmount: {
            estimatedAmount: 666,
            localCounterpartAmount: 222,
            idbAmount: 222,
            cofinancedAmount: 222,
            costJustification: null,
          },
          subExecutor: '',
          justification: '',
          isUpdated: true,
          procurementProcessComments: [],
          order: 0,
        },
      ];
      const response: GetBiddingProcurementProcessesByProcessPlanIdResponse = {
        biddingProcessProcurementProcess: procurementProcesses,
      };

      const action = getBiddingProcessPlanActions.getBiddingProcesses({
        biddingProcessPlanId,
      });
      const completion =
        getBiddingProcessPlanActions.getBiddingProcessesSuccess({
          biddingProcessProcurementProcesses: procurementProcesses,
        });

      actions$ = of(action);
      jest
        .spyOn(
          biddingProcessPlanSvc,
          'getBiddingProcurementProcessesByProcessPlanId'
        )
        .mockReturnValue(of(response))
        .mockName('getBiddingProcurementProcessesByProcessPlanId');

      return effects.getBiddingProcesses$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(
          biddingProcessPlanSvc.getBiddingProcurementProcessesByProcessPlanId
        ).toHaveBeenCalledWith(biddingProcessPlanId);
      });
    });

    it('should dispatch getBiddingProcessesError action on error', async () => {
      const biddingProcessPlanId = 'your-bidding-process-plan-id';

      const action = getBiddingProcessPlanActions.getBiddingProcesses({
        biddingProcessPlanId,
      });
      const completion =
        getBiddingProcessPlanActions.getBiddingProcessesError();

      actions$ = of(action);
      jest
        .spyOn(
          biddingProcessPlanSvc,
          'getBiddingProcurementProcessesByProcessPlanId'
        )
        .mockReturnValue(throwError('Error'))
        .mockName('getBiddingProcurementProcessesByProcessPlanId');

      return effects.getBiddingProcesses$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(
          biddingProcessPlanSvc.getBiddingProcurementProcessesByProcessPlanId
        ).toHaveBeenCalledWith(biddingProcessPlanId);
      });
    });
  });

  describe('getBiddingProcessById$', () => {
    it('should dispatch getBiddingProcessByIdSuccess action with biddingProcessProcurementProcess', async () => {
      const biddingProcessId = 'your-bidding-process-id';
      const procurementProcess: BiddingProcessProcurementProcess = {
        isMigrated: false,
        packagesUnderReview: false,
        biddingProcessPlanId: 'b4952feb-3947-4d10-bd3c-923d4adbbbd7',
        code: 'PN-L1095-P00127',
        description: 'CFI-6759-8',
        totalAcumulatedAmount: 0,
        sustainabilityDescription: '',
        totalComments: 0,
        advanceMilestone: {
          totalCompleted: 1,
          total: 10,
          delayed: true,
          currentMilestone: null,
        },
        componentName: 'Componente 1. Electrificación rural en red',
        bafo: null,
        sepaPeclaId: '',
        lots: null,
        category: {
          name: 'PROCT_WORKS',
          id: 5,
        },
        procurementMethod: {
          name: 'PROCT_CBSSTEWP',
          id: 79,
        },
        supervisionMethod: {
          name: 'ExPost',
          id: 1,
        },
        status: 7,
        sustainability: null,
        goodsReference: null,
        id: '49a2f749-2ed1-4fa3-8ebc-0abbf707a9fc',
        manualId: '',
        name: 'CFI-6759-8',
        projectAmount: {
          estimatedAmount: 666,
          localCounterpartAmount: 222,
          idbAmount: 222,
          cofinancedAmount: 222,
          costJustification: null,
        },
        subExecutor: '',
        justification: '',
        isUpdated: true,
        procurementProcessComments: [],
        order: 0,
      };
      const response: GetBiddingProcurementProcessByIdResponse = {
        biddingProcessProcurementProcess: procurementProcess,
      };

      const action = getBiddingProcessPlanActions.getBiddingProcessById({
        biddingProcessId,
      });

      const completion =
        getBiddingProcessPlanActions.getBiddingProcessByIdSuccess({
          biddingProcessProcurementProcess: procurementProcess,
        });

      actions$ = of(action);
      jest
        .spyOn(
          biddingProcessPlanSvc,
          'getBiddingProcessProcurementProcessesById'
        )
        .mockReturnValue(of(response))
        .mockName('getBiddingProcessProcurementProcessesById');

      return effects.getBiddingProcessById$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(
          biddingProcessPlanSvc.getBiddingProcessProcurementProcessesById
        ).toHaveBeenCalledWith(biddingProcessId);
      });
    });

    it('should dispatch getBiddingProcessPlanError action on error', () => {
      const biddingProcessId = 'your-bidding-process-id';

      const action = getBiddingProcessPlanActions.getBiddingProcessById({
        biddingProcessId,
      });

      const completion =
        getBiddingProcessPlanActions.getBiddingProcessPlanError({
          payload: 'Error',
        });

      actions$ = of(action);
      jest
        .spyOn(
          biddingProcessPlanSvc,
          'getBiddingProcessProcurementProcessesById'
        )
        .mockReturnValue(throwError('Error'))
        .mockName('getBiddingProcessProcurementProcessesById');

      return effects.getBiddingProcessById$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(
          biddingProcessPlanSvc.getBiddingProcessProcurementProcessesById
        ).toHaveBeenCalledWith(biddingProcessId);
      });
    });
  });

  describe('removeProcurementProcess$', () => {
    it('should dispatch removeProcurementProcessSuccess action and show success notification', async () => {
      const id = 'your-id';

      const action = getBiddingProcessPlanActions.removeProcurementProcess({
        id,
      });
      const completion =
        getBiddingProcessPlanActions.removeProcurementProcessSuccess({
          biddingProcessId: id,
        });
      const successMessage = 'PROCUREMENT.PROCESS.DELETE_SUCCESS';

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanSvc, 'deleteBiddingProcessProcurementProcess')
        .mockReturnValue(of(undefined))
        .mockName('deleteBiddingProcessProcurementProcess');
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(successMessage)
        .mockName('translateService.instant');
      jest.spyOn(notificationService, 'showSuccess').mockImplementation();

      return effects.removeProcurementProcess$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            biddingProcessPlanSvc.deleteBiddingProcessProcurementProcess
          ).toHaveBeenCalledWith(id);
          expect(translateService.instant).toHaveBeenCalledWith(successMessage);
          expect(notificationService.showSuccess).toHaveBeenCalledWith(
            successMessage,
            'right',
            'top',
            7000
          );
        });
    });

    it('should dispatch removeProcurementProcessError action and show error notification on error', async () => {
      const id = 'your-id';
      const errorMessage = 'Error message';

      const action = getBiddingProcessPlanActions.removeProcurementProcess({
        id,
      });
      const completion =
        getBiddingProcessPlanActions.removeProcurementProcessError({
          payload: errorMessage,
        });
      const errorMessageKey = 'PROCUREMENT.PROCESS.DELETE_ERROR';

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanSvc, 'deleteBiddingProcessProcurementProcess')
        .mockReturnValue(throwError(errorMessage))
        .mockName('deleteBiddingProcessProcurementProcess');
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(errorMessageKey)
        .mockName('translateService.instant');
      jest.spyOn(notificationService, 'showError').mockImplementation();

      return effects.removeProcurementProcess$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            biddingProcessPlanSvc.deleteBiddingProcessProcurementProcess
          ).toHaveBeenCalledWith(id);
          expect(translateService.instant).toHaveBeenCalledWith(
            errorMessageKey
          );
          expect(notificationService.showError).toHaveBeenCalledWith(
            errorMessageKey,
            'right',
            'top',
            7000
          );
        });
    });
  });

  describe('cancelProcurementProcess$', () => {
    it('should dispatch cancelProcurementProcessSuccess action and show success notification', async () => {
      const biddingProcessId = 'your-id';

      const action = getBiddingProcessPlanActions.cancelProcurementProcess({
        biddingProcessId,
        comment: 'Test comment',
      });
      const completion =
        getBiddingProcessPlanActions.cancelProcurementProcessSuccess({
          biddingProcessId,
        });
      const successMessage = 'PROCUREMENT.PROCESS.CANCEL_SUCCESS';

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanSvc, 'cancelBiddingProcess')
        .mockReturnValue(of(undefined))
        .mockName('cancelBiddingProcess');
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(successMessage)
        .mockName('translateService.instant');
      jest.spyOn(notificationService, 'showSuccess').mockImplementation();

      return effects.cancelProcurementProcess$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            biddingProcessPlanSvc.cancelBiddingProcess
          ).toHaveBeenCalledWith(biddingProcessId, 'Test comment');
          expect(translateService.instant).toHaveBeenCalledWith(successMessage);
          expect(notificationService.showSuccess).toHaveBeenCalledWith(
            successMessage,
            'right',
            'top',
            7000
          );
        });
    });

    it('should dispatch cancelProcurementProcessError action and show error notification on error', async () => {
      const biddingProcessId = 'your-id';
      const errorMessage = 'Error message';

      const action = getBiddingProcessPlanActions.cancelProcurementProcess({
        biddingProcessId,
        comment: 'Test comment',
      });
      const completion =
        getBiddingProcessPlanActions.cancelProcurementProcessError({
          biddingProcessId,
        });
      const errorMessageKey = 'PROCUREMENT.PROCESS.CANCEL_ERROR';

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanSvc, 'cancelBiddingProcess')
        .mockReturnValue(throwError(errorMessage))
        .mockName('cancelBiddingProcess');
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(errorMessageKey)
        .mockName('translateService.instant');
      jest.spyOn(notificationService, 'showError').mockImplementation();

      return effects.cancelProcurementProcess$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(
            biddingProcessPlanSvc.cancelBiddingProcess
          ).toHaveBeenCalledWith(biddingProcessId, 'Test comment');
          expect(translateService.instant).toHaveBeenCalledWith(
            errorMessageKey
          );
          expect(notificationService.showError).toHaveBeenCalledWith(
            errorMessageKey,
            'right',
            'top',
            7000
          );
        });
    });
  });

  describe('updateStatus$', () => {
    it('should dispatch updateProcurementStatusSuccess action with correct parameters and show success notification', async () => {
      const biddingProcessId = 'your-bidding-process-id';
      const newStatus = 2;
      const countryCode = 'your-country-code';

      const action = getBiddingProcessPlanActions.updateProcurementStatus({
        biddingProcessId,
        newStatus,
        countryCode,
      });
      const completion =
        getBiddingProcessPlanActions.updateProcurementStatusSuccess({
          biddingProcessId,
          newStatus,
          countryCode,
        });

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanSvc, 'updateStatus')
        .mockReturnValue(of(null));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-success-message');
      jest.spyOn(notificationService, 'showSuccess').mockImplementation();
      jest.spyOn(notificationService, 'showError').mockImplementation();

      return effects.updateStatus$.toPromise().then((resultAction) => {
        expect(biddingProcessPlanSvc.updateStatus).toHaveBeenCalledWith(
          biddingProcessId,
          newStatus,
          countryCode
        );
        expect(translateService.instant).toHaveBeenCalledWith(
          'PROCESS_DOC.DOC_BTNS.STATUS_UPDATE_SUCCESS'
        );
        expect(notificationService.showSuccess).toHaveBeenCalledWith(
          'your-success-message'
        );
        expect(notificationService.showError).not.toHaveBeenCalled();
        expect(resultAction).toEqual(completion);
      });
    });

    it('should dispatch updateProcurementStatusError action with error payload and show error notification', () => {
      const biddingProcessId = 'your-bidding-process-id';
      const newStatus = 5;
      const countryCode = 'your-country-code';
      const error = new Error('your-error');

      const action = getBiddingProcessPlanActions.updateProcurementStatus({
        biddingProcessId,
        newStatus,
        countryCode,
      });
      const completion =
        getBiddingProcessPlanActions.updateProcurementStatusError({
          payload: error,
        });

      actions$ = of(action);
      jest
        .spyOn(biddingProcessPlanSvc, 'updateStatus')
        .mockReturnValue(throwError(error));
      jest
        .spyOn(translateService, 'instant')
        .mockReturnValue('your-error-message');
      jest.spyOn(notificationService, 'showSuccess').mockImplementation();
      jest.spyOn(notificationService, 'showError').mockImplementation();

      return effects.updateStatus$.toPromise().then((resultAction) => {
        expect(biddingProcessPlanSvc.updateStatus).toHaveBeenCalledWith(
          biddingProcessId,
          newStatus,
          countryCode
        );
        expect(translateService.instant).toHaveBeenCalledWith(
          'PROCESS_DOC.DOC_BTNS.ERROR_SUBMIT_PACKAGE'
        );
        expect(notificationService.showSuccess).not.toHaveBeenCalled();
        expect(notificationService.showError).toHaveBeenCalledWith(
          'your-error-message'
        );
        expect(resultAction).toEqual(completion);
      });
    });
  });
});
