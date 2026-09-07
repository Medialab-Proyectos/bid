import { Injectable } from '@angular/core';
import {
  BiddingContractStatusesEnum,
  DocumentPackagesStatus,
  WorkflowProcurementActionEnum,
  WorkflowIdEntityType,
  WorkflowModuleEnum,
} from '@core/enums';
import { WorkflowTriggerRequestBody } from '@core/models';
import {
  BiddingContractApiService,
  BiddingProcessDocumentPackagesApiService,
  BiddingProcessPlanService,
  WorkflowApiService,
} from '@core/services/apis';
import {
  BiddingProcessPlanStoreService,
  BiddingProcessDocumentPackagesStoreService,
} from '@core/services/store-services';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { WorkflowButtonAction, WorkflowTriggerExtraInfo } from '../models';
import * as actions from '@core/store/bidding-process-plan/actions/bidding-process-plan.actions';

@Injectable({
  providedIn: 'root',
})
export class WorkflowProcurementService {
  constructor(
    private readonly workflowApi: WorkflowApiService,
    private readonly biddingProcessDocumentPackagesApi: BiddingProcessDocumentPackagesApiService,
    private readonly biddingProcessPlanStoreSvc: BiddingProcessPlanStoreService,
    private readonly biddingProcessDocumentPackagesStoreSvc: BiddingProcessDocumentPackagesStoreService,
    private readonly biddingContractApiSvc: BiddingContractApiService,
    private readonly biddingProcessPlanApi: BiddingProcessPlanService,
    private readonly store: Store<AppState>
  ) {}

  public triggerAction(
    action: WorkflowButtonAction,
    idEntityType: WorkflowIdEntityType,
    entityTypeId: string,
    extraInfo: WorkflowTriggerExtraInfo,
    lang: string,
    mod: WorkflowModuleEnum,
    projectBucketId?: string,
    canUploadWorkflowDocs = false,
    workflowInstaceId = null
  ): Observable<any> {
    return this.workflowApi
      .triggerStep(
        this.buildTriggerRequest(action, idEntityType, entityTypeId),
        lang,
        mod
      )
      .pipe(
        mergeMap((data) =>
          this.biddingProcessPlanStoreSvc.biddingProcessPlan().pipe(
            take(1),
            map((reduxData) => {
              if (
                canUploadWorkflowDocs &&
                workflowInstaceId !== null &&
                data?.WorkflowFinished
              ) {
                this.updateWorkflowDocumentsToEzShare(
                  workflowInstaceId,
                  reduxData?.selectedBiddingProcessProcurementProcess.id
                );
              }
            })
          )
        ),
        mergeMap((_) =>
          this.actionAfterTrigger(
            WorkflowProcurementActionEnum[
              WorkflowProcurementActionEnum[action.id]
            ],
            entityTypeId,
            idEntityType,
            extraInfo,
            projectBucketId
          )
        )
      );
  }

  updateWorkflowDocumentsToEzShare(
    externalWorkflowInstaceId: string,
    processId: string
  ): void {
    this.workflowApi
      .putEzshareWorkflowDocuments(externalWorkflowInstaceId, processId)
      .subscribe();
  }

  private buildTriggerRequest(
    action: WorkflowButtonAction,
    idEntityType: WorkflowIdEntityType,
    entityTypeId: string
  ): WorkflowTriggerRequestBody {
    const triggerReq: WorkflowTriggerRequestBody = action.body;

    switch (idEntityType) {
      case WorkflowIdEntityType.DOCUMENT_PACKAGE:
        triggerReq.packageId = entityTypeId;
        break;
      case WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT:
        triggerReq.biddingContract = entityTypeId;
    }
    return triggerReq;
  }

  private actionAfterTrigger(
    actionId: WorkflowProcurementActionEnum,
    entityId: string,
    type: WorkflowIdEntityType,
    extraInfo: WorkflowTriggerExtraInfo,
    projectBucketId?: string
  ): Observable<any> {
    switch (type) {
      case WorkflowIdEntityType.PROCUREMENT_PLAN:
        return this.biddingProcessPlanActions(
          actionId,
          entityId,
          projectBucketId
        );
      case WorkflowIdEntityType.DOCUMENT_PACKAGE:
        return this.documentPackagesActions(
          actionId,
          entityId,
          extraInfo?.processId,
          extraInfo?.docPackageStatus
        );
      case WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT:
        return this.contractAmendmentActions(actionId, entityId);
    }
    return of(true);
  }

  private getProcurementProcess(biddingProcessPlanId: string) {
    this.store.dispatch(
      actions.getBiddingProcesses({
        biddingProcessPlanId,
      })
    );
  }

  private biddingProcessPlanActions(
    actionId: WorkflowProcurementActionEnum,
    projectPlanId: string,
    projectBucketId?: string
  ): Observable<any> {
    switch (actionId) {
      case WorkflowProcurementActionEnum.APPROVE:
        return this.biddingProcessPlanApi.approvedAction(projectPlanId).pipe(
          tap((_) => {
            this.biddingProcessPlanStoreSvc.getBiddingProcessPlanAction(
              projectBucketId
            );
            this.getProcurementProcess(projectPlanId);
          })
        );
      case WorkflowProcurementActionEnum.RETURN_TO_RECEIVE:
      case WorkflowProcurementActionEnum.RETURN_WITH_COMMENTS:
        return this.biddingProcessPlanApi.returnAction(projectPlanId).pipe(
          tap((_) => {
            this.biddingProcessPlanStoreSvc.getBiddingProcessPlanAction(
              projectBucketId
            );
            this.getProcurementProcess(projectPlanId);
          })
        );
      default:
        return of(true);
    }
  }

  private documentPackagesActions(
    actionId: WorkflowProcurementActionEnum,
    packageId: string,
    processId: string,
    docPackageStatus: DocumentPackagesStatus
  ): Observable<any> {
    switch (actionId) {
      case WorkflowProcurementActionEnum.NON_OBJECTION:
      case WorkflowProcurementActionEnum.CONDITIONAL_NON_OBJECTION:
      case WorkflowProcurementActionEnum.APPROVED:
      case WorkflowProcurementActionEnum.CONDITIONAL_APPROVE:
      case WorkflowProcurementActionEnum.CONDITIONAL_APPROVAL:
        return this.biddingProcessDocumentPackagesApi
          .completion(packageId)
          .pipe(
            mergeMap((_) =>
              this.updatePackageStatus(
                packageId,
                actionId,
                processId,
                docPackageStatus
              )
            )
          );
      case WorkflowProcurementActionEnum.RETURN_TO_RECEIVE:
      case WorkflowProcurementActionEnum.RETURN_WITH_COMMENTS:
        return this.updatePackageStatus(
          packageId,
          actionId,
          processId,
          docPackageStatus
        );
      default:
        return of(true);
    }
  }

  private updatePackageStatus(
    packageId: string,
    actionId: WorkflowProcurementActionEnum,
    processId: string,
    docPackageStatus: DocumentPackagesStatus
  ): Observable<any> {
    return this.biddingProcessDocumentPackagesApi
      .updateStatus(packageId, this.getTargetStatus(actionId, docPackageStatus))
      .pipe(
        tap((_) => {
          if (!!processId) {
            this.biddingProcessDocumentPackagesStoreSvc.changeDocumentPackageStatusSuccessAction(
              processId,
              packageId,
              this.getTargetStatus(actionId, docPackageStatus)
            );

            this.biddingProcessPlanStoreSvc.getBiddingProcessByIdAction(
              processId
            );
          }
        })
      );
  }

  private contractAmendmentActions(
    actionId: WorkflowProcurementActionEnum,
    amendmentId: string
  ): Observable<any> {
    switch (actionId) {
      case WorkflowProcurementActionEnum.NON_OBJECTION:
        return this.biddingContractApiSvc.putUpdateAmendmentStatus(
          amendmentId,
          BiddingContractStatusesEnum.AMENDMENT_REVIEWED
        );
      case WorkflowProcurementActionEnum.RETURN_TO_RECEIVE:
      case WorkflowProcurementActionEnum.RETURN_WITH_COMMENTS:
        return this.biddingContractApiSvc.putUpdateAmendmentStatus(
          amendmentId,
          BiddingContractStatusesEnum.RETURNED_WITH_COMMENTS
        );
      default:
        return of(true);
    }
  }

  private getTargetStatus(
    actionId: WorkflowProcurementActionEnum,
    docPackageStatus: DocumentPackagesStatus
  ): number {
    switch (actionId) {
      case WorkflowProcurementActionEnum.NON_OBJECTION:
      case WorkflowProcurementActionEnum.CONDITIONAL_NON_OBJECTION:
      case WorkflowProcurementActionEnum.APPROVED:
      case WorkflowProcurementActionEnum.CONDITIONAL_APPROVE:
      case WorkflowProcurementActionEnum.CONDITIONAL_APPROVAL:
        if (docPackageStatus === DocumentPackagesStatus.UNDER_REVIEW) {
          return DocumentPackagesStatus.COMPLETE;
        } else if (
          docPackageStatus === DocumentPackagesStatus.AMENDMENT_UNDER_REV
        ) {
          return DocumentPackagesStatus.COMPLETE_AMENDMENT;
        }
        return docPackageStatus;
      case WorkflowProcurementActionEnum.RETURN_TO_RECEIVE:
      case WorkflowProcurementActionEnum.RETURN_WITH_COMMENTS:
        if (docPackageStatus === DocumentPackagesStatus.UNDER_REVIEW) {
          return DocumentPackagesStatus.RETURNED;
        } else if (
          docPackageStatus === DocumentPackagesStatus.AMENDMENT_UNDER_REV
        ) {
          return DocumentPackagesStatus.AMENDMENT_RETURNED;
        }
        return docPackageStatus;
      default:
        return docPackageStatus;
    }
  }
}
