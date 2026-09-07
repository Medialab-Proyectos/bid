import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as actions from '@core/store/bidding-process-plan/actions/bidding-process-plan.actions';
import { WorkflowLaunchRequest } from '@core/models';
import { WorkflowEntityScreen } from '@core/enums';
import { Observable } from 'rxjs';

function getInitialState() {
  return {};
}

const initialState = getInitialState();

describe('BiddingProcessPlanStoreService', () => {
  let service: BiddingProcessPlanStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({ initialState })],
    });
    service = TestBed.inject(BiddingProcessPlanStoreService);
    (service as any).biddingProcessPlanStore.dispatch = jest.fn();
  });

  it('should call cancel action', () => {
    service.cancelProcessAction('process-id-1', 'test comment');

    expect(
      (service as any).biddingProcessPlanStore.dispatch
    ).toHaveBeenCalled();
  });

  it('should dispatch removeProcurementProcess action with the correct id', () => {
    const biddingProcessId = '123';

    service.removeProcessAction(biddingProcessId);
    const dispatchSpy = jest.spyOn(
      service['biddingProcessPlanStore'],
      'dispatch'
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.removeProcurementProcess({ id: biddingProcessId })
    );
  });

  it('should dispatch requestApproval action with the correct parameters', () => {
    const launchReq: WorkflowLaunchRequest = {
      entityTypeId: 'entityTypeId',
      isInternalVisibility: false,
      projectBucketId: 'projectBucketId',
      instAcronym: 'instAcronym',
      packageId: 'packageId',
      biddingContract: 'biddingContract',
      businessRulesRequest: {
        module: 'module',
        table: 'table',
        name: 'name',
        factors: { workflowSection: WorkflowEntityScreen.PROCUREMENT_PLAN },
      },
      role: 'role',
      workflowComment: {
        status: '',
        text: '',
        visibility: true,
      },
    };
    const projectId = '123';
    const lang = 'en';
    const dispatchSpy = jest.spyOn(
      service['biddingProcessPlanStore'],
      'dispatch'
    );
    service.requestApprovalAction(launchReq, projectId, lang);

    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.requestApproval({ launchReq, projectId, lang })
    );
  });

  it('should dispatch updateProcurementStatus action with the correct parameters', () => {
    const biddingProcessId = '123';
    const countryCode = 'US';
    const newStatus = 2;

    service.updateProcurementStatusAction(
      biddingProcessId,
      countryCode,
      newStatus
    );
    const dispatchSpy = jest.spyOn(
      service['biddingProcessPlanStore'],
      'dispatch'
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.updateProcurementStatus({
        biddingProcessId,
        countryCode,
        newStatus,
      })
    );
  });

  it('should dispatch resetBiddingProcessPlan action', () => {
    service.resetBiddingProcessPlan();
    const dispatchSpy = jest.spyOn(
      service['biddingProcessPlanStore'],
      'dispatch'
    );
    expect(dispatchSpy).toHaveBeenCalledWith(actions.resetBiddingProcessPlan());
  });

  it('should call the reset methods of TransactionApiService and WorkflowApiService', () => {
    const resetTransactionsSpy = jest
      .spyOn(service['transactionApiSvc'], 'resetTransactions')
      .mockReturnValue();
    const resetTransactionsTypesSpy = jest
      .spyOn(service['transactionApiSvc'], 'resetTransactionsTypes')
      .mockReturnValue();
    const resetConfigurationSpy = jest
      .spyOn(service['workflowApiSvc'], 'resetConfiguration')
      .mockReturnValue();

    service.resetShareReplayCache();

    expect(resetTransactionsSpy).toHaveBeenCalled();
    expect(resetTransactionsTypesSpy).toHaveBeenCalled();
    expect(resetConfigurationSpy).toHaveBeenCalled();
  });

  it('should dispatch completeContractsSuccess action with the correct parameters', () => {
    const biddingProcessId = '123';
    const newStatus = 2;
    const dispatchSpy = jest
      .spyOn(service['biddingProcessPlanStore'], 'dispatch')
      .mockReturnValue();

    service.completeProcurementProcessAction(biddingProcessId, newStatus);

    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.completeContractsSuccess({
        biddingProcessId,
        newStatus,
      })
    );
  });

  it('should dispatch reloadProcesses action', () => {
    const dispatchSpy = jest
      .spyOn(service['biddingProcessPlanStore'], 'dispatch')
      .mockReturnValue();

    service.reloadProcessesAction();

    expect(dispatchSpy).toHaveBeenCalledWith(actions.reloadProcesses());
  });

  it('should dispatch getBiddingProcesses action with the correct parameters', () => {
    const biddingProcessPlanId = '123';
    const dispatchSpy = jest
      .spyOn(service['biddingProcessPlanStore'], 'dispatch')
      .mockReturnValue();

    service.getBiddingProcessesAction(biddingProcessPlanId);

    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.getBiddingProcesses({
        biddingProcessPlanId,
      })
    );
  });

  it('should dispatch getBiddingProcessPlan action with the correct parameters', () => {
    const projectBucketId = '123';
    const dispatchSpy = jest
      .spyOn(service['biddingProcessPlanStore'], 'dispatch')
      .mockReturnValue();

    service.getBiddingProcessPlanAction(projectBucketId);

    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.getBiddingProcessPlan({
        projectBucketId,
      })
    );
  });

  it('should dispatch getBiddingProcessById action with the correct parameters', () => {
    const biddingProcessId = '123';
    const dispatchSpy = jest
      .spyOn(service['biddingProcessPlanStore'], 'dispatch')
      .mockReturnValue();

    service.getBiddingProcessByIdAction(biddingProcessId);

    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.getBiddingProcessById({
        biddingProcessId,
      })
    );
  });

  it('should return the headerProcess state', () => {
    const spy = jest.spyOn(service['storeProcessHeader'], 'pipe');

    const result = service.headerProcess();

    expect(spy).toBeCalled();
    expect(result).toBeInstanceOf(Observable);
  });
});
