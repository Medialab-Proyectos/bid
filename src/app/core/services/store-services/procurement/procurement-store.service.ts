import { Injectable } from '@angular/core';
import {
  AppStateWithHeaderProcess,
  AppStateWithBiddingProcessPlan,
  HeaderProcessState,
  BiddingProcessPlanState,
  AppState,
  EnumState,
  SelectedProjectState,
} from '@core/store';
import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as actions from '@core/store/bidding-process-plan/actions/bidding-process-plan.actions';
import { filter, map, tap } from 'rxjs/operators';
import {
  BiddingProcessProcurementProcess,
  Enums,
  SelectedFilterForBiddingProcess,
  WorkflowLaunchRequest,
} from '@core/models';
import { FiTransactionsApiService } from '@fiduciary-interface/app/features/transactions/services/fi-transactions-api/fi-transactions-api.service';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services/workflow-api/workflow-api.service';
import { DelayedMilestoneTableTypeEnum } from '@core/enums';

@Injectable({
  providedIn: 'root',
})
export class BiddingProcessPlanStoreService {
  constructor(
    private readonly biddingProcessPlanStore: Store<AppStateWithBiddingProcessPlan>,
    private readonly storeProcessHeader: Store<AppStateWithHeaderProcess>,
    private readonly store: Store<AppState>,
    private readonly transactionApiSvc: FiTransactionsApiService,
    private readonly workflowApiSvc: WorkflowODApiService
  ) {}

  /**
   * @return {Observable<BiddingProcessPlanState>} returns an observable with the bidding process Plan
   */
  public biddingProcessPlan(): Observable<BiddingProcessPlanState> {
    return this.biddingProcessPlanStore.pipe(select('biddingProcessPlan'));
  }

  public getOrLoadBiddingProcessPlan() {
    return this.store.pipe(
      select(selectProcurementProcess),
      filter((state) => state !== undefined),
      tap((state) => {
        const planState = state.biddingPlanState;
        const projectBucketId =
          state.projectState?.selectedProject?.projectBucketId;

        if (projectBucketId) {
          const isAlreadyLoaded =
            planState.biddingProcessPlan?.projectBucketId === projectBucketId;

          if (!isAlreadyLoaded && !planState.loading) {
            this.resetShareReplayCache();
            this.getBiddingProcessPlanAction(projectBucketId);
          }
        }

        return state;
      })
    );
  }

  public getBiddingProcessPlanAction(projectBucketId: string): void {
    this.biddingProcessPlanStore.dispatch(
      actions.getBiddingProcessPlan({ projectBucketId })
    );
  }

  public getBiddingProcessesAction(biddingProcessPlanId: string): void {
    this.biddingProcessPlanStore.dispatch(
      actions.getBiddingProcesses({ biddingProcessPlanId })
    );
  }

  public getBiddingProcessByIdAction(biddingProcessId: string): void {
    this.biddingProcessPlanStore.dispatch(
      actions.getBiddingProcessById({ biddingProcessId })
    );
  }

  public reloadProcessesAction(): void {
    this.biddingProcessPlanStore.dispatch(actions.reloadProcesses());
  }

  public getOrLoadSelectedBiddingProcessById(
    biddingProcessId: string
  ): Observable<BiddingProcessPlanState> {
    return this.biddingProcessPlan().pipe(
      map((data: BiddingProcessPlanState) => {
        const isRequestedProcessAlreadyLoaded =
          data?.selectedBiddingProcessProcurementProcess?.id ===
          biddingProcessId;
        if (
          !isRequestedProcessAlreadyLoaded &&
          !data.isSelectedProcessLoading
        ) {
          this.getBiddingProcessByIdAction(biddingProcessId);
        }

        const newState = { ...data } as BiddingProcessPlanState;

        if (!isRequestedProcessAlreadyLoaded) {
          newState.selectedBiddingProcessProcurementProcess = null;
        }
        return newState;
      })
    );
  }

  /**
   * @return {Observable<HeaderProcessState>} returns an observable with the header process
   */
  public headerProcess(): Observable<HeaderProcessState> {
    return this.storeProcessHeader.pipe(select('headerProcess'));
  }

  cancelProcessAction(biddingProcessId: string, comment: string): void {
    this.biddingProcessPlanStore.dispatch(
      actions.cancelProcurementProcess({ biddingProcessId, comment })
    );
  }

  removeProcessAction(biddingProcessId: string): void {
    this.biddingProcessPlanStore.dispatch(
      actions.removeProcurementProcess({ id: biddingProcessId })
    );
  }

  ineligibilityProcessAction(
    comment: string,
    procurementProcessId: string
  ): void {
    this.biddingProcessPlanStore.dispatch(
      actions.ineligibilityProcurementProcess({ comment, procurementProcessId })
    );
  }
  declareUnsuccessfulProcessAction(
    comment: string,
    procurementProcessId: string
  ): void {
    this.biddingProcessPlanStore.dispatch(
      actions.unsuccessfulProcurementProcess({ comment, procurementProcessId })
    );
  }

  requestApprovalAction(
    launchReq: WorkflowLaunchRequest,
    projectId: string,
    lang: string
  ): void {
    this.biddingProcessPlanStore.dispatch(
      actions.requestApproval({ launchReq, projectId, lang })
    );
  }

  setFilteredProcess(
    filteredProcess: BiddingProcessProcurementProcess[],
    selectedOpt: SelectedFilterForBiddingProcess
  ): void {
    this.biddingProcessPlanStore.dispatch(
      actions.setFilteredProcurementProcess({
        filteredBiddingProcessProcurementProcesses: filteredProcess,
        selectedOpt,
      })
    );
  }

  updateProcurementStatusAction(
    biddingProcessId: string,
    countryCode: string,
    newStatus: number
  ): void {
    this.biddingProcessPlanStore.dispatch(
      actions.updateProcurementStatus({
        biddingProcessId,
        countryCode,
        newStatus,
      })
    );
  }

  resetBiddingProcessPlan(): void {
    this.biddingProcessPlanStore.dispatch(actions.resetBiddingProcessPlan());
  }

  resetShareReplayCache(): void {
    this.transactionApiSvc.resetTransactions();
    this.transactionApiSvc.resetTransactionsTypes();
    this.workflowApiSvc.resetConfiguration();
  }

  completeProcurementProcessAction(
    biddingProcessId: string,
    newStatus: number
  ): void {
    this.biddingProcessPlanStore.dispatch(
      actions.completeContractsSuccess({
        biddingProcessId,
        newStatus,
      })
    );
  }

  resetSelectedFilterBiddingProcess(): void {
    this.biddingProcessPlanStore.dispatch(
      actions.resetSelectedFilterForBiddingProcess()
    );
  }
  setSelectedFilterBiddingProcess(
    selectedRow: number,
    selectedCol: number,
    selectedTableType: DelayedMilestoneTableTypeEnum
  ): void {
    this.biddingProcessPlanStore.dispatch(
      actions.setSelectedFilterForBiddingProcess({
        selectedRow,
        selectedCol,
        selectedTableType,
      })
    );
  }
}

const selectProcurementProcess = createSelector(
  (state: AppState) => state.enums,
  (state: AppState) => state.selectedProject,
  (state: AppState) => state.biddingProcessPlan,
  (
    enumState: EnumState,
    projectState: SelectedProjectState,
    biddingPlanState: BiddingProcessPlanState
  ) => {
    const areProcessStatusesLoaded =
      enumState.enumsLoaded[Enums.biddingProcessProcurementProcessStatuses];
    const areBiddingPlanStatusesLoaded =
      enumState.enumsLoaded[Enums.biddingProcessPlanStatuses];
    const areBiddingCategoriesLoaded =
      enumState.enumsLoaded[Enums.biddingProcessProcurementProcessCategories];
    const areSupervisionMethodsLoaded =
      enumState.enumsLoaded[
        Enums.biddingProcessProcurementProcessSupervisionMethods
      ];
    const areProcurementMethodsLoaded =
      enumState.enumsLoaded[
        Enums.biddingProcessProcurementProcessProcurementMethods
      ];

    const areEnumsLoaded =
      areProcessStatusesLoaded &&
      areBiddingPlanStatusesLoaded &&
      areBiddingCategoriesLoaded &&
      areSupervisionMethodsLoaded &&
      areProcurementMethodsLoaded;

    if (!projectState.loading && areEnumsLoaded) {
      return {
        projectState,
        biddingPlanState,
        enumState,
      };
    }

    return undefined;
  }
);
