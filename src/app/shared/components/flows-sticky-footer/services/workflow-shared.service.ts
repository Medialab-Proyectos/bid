import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  WorkflowIdEntityType,
  WorkflowModuleEnum,
  WorkflowProcurementActionEnum,
} from '@core/enums';
import { WorkflowLastStepRequest } from '@core/models/requests/workflow-request.model';
import {
  GetWorkflowDocumentResponse,
  WorkflowLastStepResponse,
} from '@core/models/responses/workflow-response.model';
import {
  BiddingProcessPlanService,
  WorkflowApiService,
} from '@core/services/apis';
import { RolesService } from '@core/services/app';
import { FormNameEnum } from '@fiduciary-interface/app/features/forms/enums/form-name';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { environment } from '@fiduciary-interface/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  filter,
  finalize,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  ProcurementComment,
  ProcurementCommentGetResponse,
} from '../../dialog-comments/models';
import {
  WorkflowButtonAction,
  WorkflowTriggerExtraInfo,
} from '../models/flow-sticky-footer.model';
import { WorkflowGPNService } from './workflow-gpn.service';
import { WorkflowProcurementService } from './workflow-procurement.service';
import { WorkflowTransactionService } from './workflow-transaction.service';
import {
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { ErrorResponse } from '@core/models';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import * as actions from '@core/store/bidding-process-plan/actions/bidding-process-plan.actions';

export interface workflowBtnActions {
  actions: WorkflowButtonAction[];
  workflowDocument: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class WorkflowSharedService {
  private readonly buttonActionsBH: BehaviorSubject<workflowBtnActions>;
  private lastStepBody: WorkflowLastStepRequest = null;
  private workflowInstanceId: string;
  private extraInfo: WorkflowTriggerExtraInfo;
  private roleId: string;
  public refreshDocuments: BehaviorSubject<boolean>;
  public actionUpdateDocument: BehaviorSubject<WorkflowButtonAction>;
  public stepWorkFlow: BehaviorSubject<WorkflowLastStepResponse>;
  public canUploadWorkflowDocs = false;

  constructor(
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly rolesService: RolesService,
    private readonly workflowApi: WorkflowApiService,
    private readonly translate: TranslateService,
    private readonly workflowProcurementSvc: WorkflowProcurementService,
    private readonly workflowTransactionSvc: WorkflowTransactionService,
    private readonly workflowGPNSvc: WorkflowGPNService,
    readonly projectStore: ProjectStoreService,
    readonly permissionSvc: PermissionService,
    readonly store: Store<AppState>,
    readonly biddingProcessPlanStoreSvc: BiddingProcessPlanStoreService,
    readonly biddingProcessPlanSvc: BiddingProcessPlanService
  ) {
    this.buttonActionsBH = new BehaviorSubject<workflowBtnActions>({
      actions: [],
      workflowDocument: false,
    });
    this.refreshDocuments = new BehaviorSubject<boolean>(false);
    this.actionUpdateDocument = new BehaviorSubject<WorkflowButtonAction>(null);
    this.stepWorkFlow = new BehaviorSubject<WorkflowLastStepResponse>(null);
  }

  public loadActions(
    stepReq: WorkflowLastStepRequest,
    extra?: WorkflowTriggerExtraInfo,
    formBidding?: string
  ): void {
    this.workflowApi
      .getLastStep(stepReq.body)
      .pipe(
        mergeMap((data: WorkflowLastStepResponse) => {
          this.canUploadWorkflowDocs = data.workflowDocument;
          return this.verifyUsersOrRoles(data, formBidding);
        }),
        map((data: WorkflowLastStepResponse) => {
          return {
            btns: this.validateData(stepReq, data, extra, formBidding),
            workflowDocument: data?.workflowDocument,
          };
        })
      )
      .subscribe(
        (data) => {
          this.setButtonActions(data.btns, data.workflowDocument);
        },
        (err) => this.checkErr(err)
      );
  }

  private mapLastStepResponse(
    data: WorkflowLastStepResponse
  ): WorkflowButtonAction[] {
    return data.nextActions
      .map((b) => {
        return {
          id: Number(b.id),
          text: b.name,
          order: b.order,
          idEntityType: this.lastStepBody.body.idEntityType,
          mandatoryComment: b.requireComments,
          mandatoryMFA: b.requireMFA,
          body: {
            projectBucketId: this.lastStepBody.body.projectBucketId,
            instAcronym: this.lastStepBody.instAcronym,
            roleId: this.roleId,
            workflowInstanceId: this.workflowInstanceId,
            actionSelected: b.name,
          },
          loading: false,
        } as WorkflowButtonAction;
      })
      .sort((a, b) => b.order + a.order);
  }

  private verifyRoles(
    data: WorkflowLastStepResponse,
    userRoles: string[]
  ): WorkflowLastStepResponse {
    let hasRole = false;
    if (!!data && !!data.nextActors && !!userRoles) {
      const matchingRoles = data.nextActors.filter((r) =>
        userRoles.some((ur) => ur === r)
      );
      hasRole = matchingRoles.length > 0;
      if (hasRole) {
        this.roleId = String(matchingRoles[0]);
      }
    }
    hasRole = environment.permissionsByPass ? true : hasRole;
    return hasRole ? data : null;
  }

  private verifyUser(
    data: WorkflowLastStepResponse
  ): Observable<WorkflowLastStepResponse> {
    return this.getRoles().pipe(
      map((roles) => {
        let userLoggedExistsOnList = false;
        if (!!data && !!data.nextUsers) {
          userLoggedExistsOnList = data.nextUsers.some(
            (email) =>
              email.trim().toUpperCase() ===
              this.rolesService.getContact()?.email.trim().toUpperCase()
          );
        }
        userLoggedExistsOnList = environment.permissionsByPass
          ? true
          : userLoggedExistsOnList;
        this.roleId = roles[0];
        return userLoggedExistsOnList ? data : null;
      })
    );
  }

  getRoles() {
    return this.store.select('roles').pipe(
      map((data) => {
        const roles = data.rolesResponse.roles.map((r) => r.roleIdCode);
        return roles;
      }),
      filter((roles) => roles.length !== 0)
    );
  }

  private verifyUsersOrRoles(
    data: WorkflowLastStepResponse,
    formBidding?: string
  ): Observable<WorkflowLastStepResponse> {
    if (!!data && data.nextUsers?.length > 0) {
      return this.verifyUser(data);
    }
    if (formBidding === FormNameEnum.GPN) {
      this.setStepWorkFlow(data);
    }
    return this.getRoles().pipe(
      map((roles: string[]) => this.verifyRoles(data, roles))
    );
  }

  private validateData(
    stepReq: WorkflowLastStepRequest,
    data: WorkflowLastStepResponse,
    extra: WorkflowTriggerExtraInfo,
    formBidding: string
  ): WorkflowButtonAction[] {
    if (
      !!data &&
      !!data.nextActions &&
      !!data.nextActors &&
      !!data.workflowInstanceId
    ) {
      this.lastStepBody = stepReq;
      this.workflowInstanceId = data.workflowInstanceId;
      this.extraInfo = { ...extra };
      if (formBidding === FormNameEnum.GPN) {
        this.setStepWorkFlow(data);
      }
      return this.mapLastStepResponse(data);
    }
    return [];
  }

  public triggerAction(
    action: WorkflowButtonAction,
    lang: string,
    mod: WorkflowModuleEnum
  ): void {
    switch (action.idEntityType) {
      case WorkflowIdEntityType.PROCUREMENT_PLAN:
        if (action.id === WorkflowProcurementActionEnum.APPROVE) {
          this.approvedPlan(action);
        } else {
          this.triggerProcurementAction(
            action,
            lang,
            mod,
            this.lastStepBody.body.projectBucketId
          );
        }
        break;
      case WorkflowIdEntityType.DOCUMENT_PACKAGE:
      case WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT:
        this.triggerProcurementAction(
          action,
          lang,
          mod,
          this.lastStepBody.body.projectBucketId
        );

        break;
      case WorkflowIdEntityType.FINANCIAL_TRANSACTION:
        this.triggerTransactionAction(action, lang, mod);
        break;
      case WorkflowIdEntityType.PROJECT_BUCKET:
        this.triggerGPNAction(action, lang, mod);
    }
  }

  private getProcurementProcess(biddingProcessPlanId: string) {
    this.store.dispatch(
      actions.getBiddingProcesses({
        biddingProcessPlanId,
      })
    );
  }

  private approvedPlan(action: WorkflowButtonAction) {
    const approvalData = {
      projectBucketId: this.lastStepBody.body.projectBucketId,
      instAcronym: this.lastStepBody.instAcronym,
      roleId: action.body.roleId,
      workflowInstanceId: action.body.workflowInstanceId,
      actionSelected: action.body.actionSelected,
      workflowComment: action.body.workflowComment,
    };
    const entityTypeId = this.lastStepBody.body.entityTypeId;
    const projectBucketId = this.lastStepBody.body.projectBucketId;
    this.biddingProcessPlanSvc
      .approvedPlanV2(entityTypeId, approvalData)
      .pipe(
        tap(() => {
          this.biddingProcessPlanStoreSvc.getBiddingProcessPlanAction(
            projectBucketId
          );
          this.getProcurementProcess(entityTypeId);
        }),
        finalize(() => {
          this.loadActions(this.lastStepBody, this.extraInfo);
        })
      )
      .subscribe({
        next: () => {
          this.notificationGlobalService.showSuccess(
            this.translate.instant('WORKFLOW.TOAST.TRIGGER_ACTION_SUCCESS')
          );
        },
        error: (error) => {
          this.notificationGlobalService.showError(error, 'right', 'top', 7000);
        },
      });
  }

  private triggerProcurementAction(
    action: WorkflowButtonAction,
    lang: string,
    mod: WorkflowModuleEnum,
    projectBucketId?: string
  ): void {
    this.triggerSubscribe(
      this.workflowProcurementSvc.triggerAction(
        action,
        this.lastStepBody.body.idEntityType,
        this.lastStepBody.body.entityTypeId,
        this.extraInfo,
        lang,
        mod,
        projectBucketId,
        this.canUploadWorkflowDocs,
        this.workflowInstaceId
      )
    );
  }

  private triggerTransactionAction(
    action: WorkflowButtonAction,
    lang: string,
    mod: WorkflowModuleEnum
  ): void {
    this.triggerSubscribe(
      this.workflowTransactionSvc.triggerAction(
        action,
        this.extraInfo.transactionId,
        lang,
        mod,
        this.extraInfo.transactionType,
        this.extraInfo.transactionIdsATJ
      )
    );
  }

  private triggerGPNAction(
    action: WorkflowButtonAction,
    lang: string,
    mod: WorkflowModuleEnum
  ): void {
    this.triggerSubscribe(
      this.workflowGPNSvc.triggerAction(action, lang, mod),
      action
    );
  }

  private triggerSubscribe(
    observable: Observable<any>,
    action?: WorkflowButtonAction
  ): void {
    observable
      .subscribe(
        (_) => {
          this.notificationGlobalService.showSuccess(
            this.translate.instant('WORKFLOW.TOAST.TRIGGER_ACTION_SUCCESS')
          );
          this.setActionUpdateDocument(action);
          this.setRefrechDocument(true);
          this.biddingProcessPlanStoreSvc.reloadProcessesAction();
        },
        (_) =>
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.TOAST.TRIGGER_ACTION_ERROR')
          )
      )
      .add(() => {
        this.loadActions(this.lastStepBody, this.extraInfo);
      });
  }

  public getComments(): Observable<ProcurementComment[]> {
    return this.workflowApi.getComments(this.workflowInstanceId).pipe(
      map((data: ProcurementCommentGetResponse) => {
        if (!!data && !!data.comments) {
          return data.comments;
        }
        return [];
      })
    );
  }

  public getDocuments(): Observable<
    GetWorkflowDocumentResponse[] | ErrorResponse
  > {
    return this.workflowApi.getDocuments(this.workflowInstanceId);
  }

  public checkErr(err): void {
    let msg = err?.message;
    if (err instanceof HttpErrorResponse) {
      msg = err.error.detail;
    }
    this.notificationGlobalService.showError(msg);
  }

  public getFirstRoleName(): Observable<string | null> {
    return this.projectStore.selectedProject().pipe(
      switchMap((data) => {
        let roles = this.permissionSvc.getRolesByContractNumber(
          data.selectedProject.contract
        );

        return of(roles[0]?.roleName ?? null);
      })
    );
  }

  public getButtonActions$(): Observable<workflowBtnActions> {
    return this.buttonActionsBH.asObservable();
  }

  public setButtonActions(
    actions: WorkflowButtonAction[],
    workflowDocument: boolean
  ): void {
    this.buttonActionsBH.next({ actions, workflowDocument });
  }

  public getRefrechDocument$(): Observable<boolean> {
    return this.refreshDocuments.asObservable();
  }

  public setRefrechDocument(refresh: boolean): void {
    this.refreshDocuments.next(refresh);
  }

  public getActionUpdateDocument$(): Observable<WorkflowButtonAction> {
    return this.actionUpdateDocument.asObservable();
  }

  public setActionUpdateDocument(action: WorkflowButtonAction): void {
    this.actionUpdateDocument.next(action);
  }

  public getStepWorkFlow$(): Observable<WorkflowLastStepResponse> {
    return this.stepWorkFlow.asObservable();
  }

  public setStepWorkFlow(data: WorkflowLastStepResponse): void {
    this.stepWorkFlow.next(data);
  }

  get workflowInstaceId(): string {
    return this.workflowInstanceId;
  }
}
