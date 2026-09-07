import { Inject, Injectable } from '@angular/core';
import {
  WorkflowLaunchModuleEnum,
  WorkflowLaunchNameEnum,
  WorkflowLaunchTableEnum,
  WorkflowModuleEnum,
  WorkflowStepEnum,
} from '@core/enums';
import {
  WorkflowLaunchRequest,
  WorkflowLaunchRequestSteps,
} from '@core/models';
import { WorkflowApiService } from '@core/services/apis';
import { RolesService } from '@core/services/app';
import { TransactionsTypes } from '@fiduciary-interface/app/features/transactions/enums';
import { GetTransactionGuidResponse } from '@fiduciary-interface/app/features/transactions/models/responses/transaction-guid-response.model';
import { FiTransactionsApiService } from '@fiduciary-interface/app/features/transactions/services/fi-transactions-api/fi-transactions-api.service';
import { TransactionStatusService } from '@fiduciary-interface/app/features/transactions/services/transaction-status/transaction-status.service';
import { TransactionsStoreService } from '@fiduciary-interface/app/features/transactions/store/services/transactions-store.service';
import {
  WorkflowConfig,
  WorkflowStep,
} from '@fiduciary-interface/app/features/workflow/models';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { environment } from '@fiduciary-interface/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { WorkflowButtonAction } from '../models';
import { PopupRequest } from '@azure/msal-browser';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { ProjectStoreService } from '@core/services/store-services';
import {
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';

@Injectable({
  providedIn: 'root',
})
export class WorkflowTransactionService {
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    private readonly workflowODApiSvc: WorkflowODApiService,
    private readonly workflowApiSvc: WorkflowApiService,
    private readonly transactionApi: FiTransactionsApiService,
    private readonly roleService: RolesService,
    private readonly transactionStatusService: TransactionStatusService,
    private readonly transactionStoreSvc: TransactionsStoreService,
    readonly storeProject: ProjectStoreService,
    readonly permissionSvc: PermissionService,
    private readonly msal: MsalService
  ) {}

  public launch(
    request: WorkflowLaunchRequest,
    transactionId: number,
    operationNumber: string,
    lang: string,
    mod: WorkflowModuleEnum,
    transactionType: TransactionsTypes,
    transactionIdsATJ: number[]
  ): Observable<any> {
    this.transactionStoreSvc.getProjectBalancesAction(request.projectBucketId);
    this.transactionApi.resetTransactionsTypes();
    return this.beforeLaunchInfo(
      request.projectBucketId,
      transactionId,
      operationNumber
    ).pipe(
      switchMap((data) =>
        this.getFirstRoleName().pipe(
          map((firstRoleName) =>
            this.buildLaunchRequest(request, data[0], data[1], firstRoleName)
          ),
          mergeMap((launchRequest) =>
            this.workflowApiSvc.lauchWorkflow(launchRequest, lang, mod)
          )
        )
      ),
      mergeMap((_) =>
        this.transactionWorkflowAfterAction(
          request.projectBucketId,
          transactionId,
          WorkflowStepEnum[WorkflowStepEnum.EnterAndSubmit],
          request.workflowComment.text,
          transactionType,
          transactionIdsATJ
        )
      )
    );
  }

  public triggerAction(
    action: WorkflowButtonAction,
    transactionId: number,
    lang: string,
    mod: WorkflowModuleEnum,
    transactionType: TransactionsTypes,
    transactionIdsATJ: number[]
  ): Observable<any> {
    const comment = action.body.workflowComment?.text;
    return this.checkMFA(action).pipe(
      mergeMap((_) => this.workflowApiSvc.triggerStep(action.body, lang, mod)),
      mergeMap((_) =>
        this.transactionWorkflowAfterAction(
          action.body.projectBucketId,
          transactionId,
          action.body.actionSelected,
          !!comment ? comment : String(),
          transactionType,
          transactionIdsATJ
        )
      ),
      mergeMap((_) => this.generateAndSaveActionReport(action, transactionId))
    );
  }

  public getTransactionGuid(transactionId: number): Observable<string> {
    return this.transactionApi.getTransactionGuid(transactionId).pipe(
      mergeMap((data: GetTransactionGuidResponse) => {
        if (!!data && !!data.fiduciaryId) {
          return of(data.fiduciaryId);
        }
        return throwError(String());
      }),
      catchError((error) => {
        this.notificationGlobalService.showError(
          this.translate.instant('WORKFLOW.TOAST.GET_TRANSACTION_GUID.ERROR')
        );
        return throwError(error);
      })
    );
  }

  private checkMFA(action: WorkflowButtonAction): Observable<any> {
    if (action.mandatoryMFA) {
      switch (action.id) {
        case WorkflowStepEnum.Authorize:
        case WorkflowStepEnum.FinalAuthorize:
          return this.raiseMFAPopup();
        default:
          return of(String());
      }
    }
    return of(String());
  }

  raiseMFAPopup(): Observable<any> {
    const userFlowRequest = {
      scopes: environment.adB2C.scopes,
      authority: environment.adB2C.authorityApprovalFlow,
      redirectStartPage: window.location.href,
    } as PopupRequest;

    return this.msal
      .loginPopup({
        ...this.msalGuardConfig.authRequest,
        ...userFlowRequest,
      } as PopupRequest)
      .pipe(
        catchError((error) => {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.TOAST.MFA_POPUP.ERROR')
          );
          return throwError(error);
        }),
        tap((_) =>
          this.notificationGlobalService.showSuccess(
            this.translate.instant('WORKFLOW.TOAST.MFA_POPUP.SUCCESS')
          )
        )
      );
  }

  private generateAndSaveActionReport(
    action: WorkflowButtonAction,
    transactionId: number
  ): Observable<any> {
    switch (action.id) {
      case WorkflowStepEnum.Validate:
      case WorkflowStepEnum.Review:
      case WorkflowStepEnum.Authorize:
      case WorkflowStepEnum.FinalAuthorize:
        return this.transactionApi
          .generateAndSaveActionReport(transactionId)
          .pipe(
            catchError((error) => {
              this.notificationGlobalService.showError(
                this.translate.instant(
                  'WORKFLOW.TOAST.GENERATE_SAVE_ACTION_REPORT.ERROR'
                )
              );
              return throwError(error);
            })
          );
      default:
        return of(String());
    }
  }

  private transactionWorkflowAfterAction(
    projectBucketId: string,
    transactionId: number,
    action: string,
    comment: string,
    transactionType: TransactionsTypes,
    transactionIdsATJ: number[]
  ): Observable<[any, any, any]> {
    return forkJoin([
      this.createAuditTrail(transactionId, action, comment),
      this.changeTransactionStatus(projectBucketId, action, transactionId),
      this.documentSync(transactionId, transactionType, transactionIdsATJ),
    ]);
  }

  private getWorkflowConfiguration(
    projectBucketId: string
  ): Observable<WorkflowConfig> {
    return this.workflowODApiSvc.getWorkflow(projectBucketId).pipe(
      mergeMap((config: WorkflowConfig) => {
        if (
          !!config &&
          !!config.workFlowConfig &&
          config.workFlowConfig.length > 0
        ) {
          return of(config);
        }
        return throwError(String());
      }),
      catchError((error) => {
        this.notificationGlobalService.showError(
          this.translate.instant('WORKFLOW.TOAST.GET_CONFIGURATION.ERROR')
        );
        return throwError(error);
      })
    );
  }

  private beforeLaunchInfo(
    projectBucketId: string,
    transactionId: number,
    operationNumber: string
  ): Observable<[WorkflowConfig, string, any]> {
    return forkJoin([
      this.getWorkflowConfiguration(projectBucketId),
      this.getTransactionGuid(transactionId),
      this.submitDocuments(transactionId, operationNumber),
    ]);
  }

  private submitDocuments(
    transactionId: number,
    operationNumber: string
  ): Observable<any> {
    return this.transactionApi
      .submitDocuments({
        transactionId,
        operationNumber,
      })
      .pipe(
        catchError((error) => {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.TOAST.SUBMIT_DOCUMENTS.ERROR')
          );
          return throwError(error);
        })
      );
  }

  private documentSync(
    transactionId: number,
    transactionType: TransactionsTypes,
    transactionIdsATJ: number[]
  ): Observable<any> {
    let body = {};

    if (transactionType === TransactionsTypes.ATJ) {
      body = { transactionIds: transactionIdsATJ };
    }

    return this.transactionApi.documentsSync(transactionId, body).pipe(
      catchError((error) => {
        this.notificationGlobalService.showError(
          this.translate.instant('WORKFLOW.TOAST.DOCUMENTS_SYNC.ERROR')
        );
        return throwError(error);
      })
    );
  }

  private createAuditTrail(
    transactionId: number,
    action: string,
    comment: string
  ): Observable<any> {
    return this.transactionApi
      .createAuditTrail({
        createAuditTrailListRequests: [
          {
            transactionId,
            action,
            comment,
            user: this.roleService.getContact()?.email,
          },
        ],
      })
      .pipe(
        catchError((error) => {
          this.notificationGlobalService.showError(
            this.translate.instant('WORKFLOW.TOAST.CREATE_AUDIT_TRAIL.ERROR')
          );
          return throwError(error);
        })
      );
  }

  private changeTransactionStatus(
    projectBucketId: string,
    action: string,
    transactionId: number
  ): Observable<any> {
    return this.getTransactionStatus(projectBucketId, action).pipe(
      mergeMap((transactionStatusId) =>
        this.transactionApi
          .changeTransactionStatus(transactionId, transactionStatusId)
          .pipe(
            tap((_) =>
              this.transactionStatusService.transactionStatusId.next(
                transactionStatusId
              )
            )
          )
      ),
      catchError((error) => {
        this.notificationGlobalService.showError(
          this.translate.instant(
            'WORKFLOW.TOAST.CHANGE_TRANSACTION_STATUS.ERROR'
          )
        );
        return throwError(error);
      })
    );
  }

  private getTransactionStatus(
    projectBucketId: string,
    action: string
  ): Observable<number> {
    return this.workflowODApiSvc
      .getTransactionStatus(projectBucketId, action)
      .pipe(
        mergeMap((response) => {
          if (response && !Number.isNaN(response.transactionStatusId)) {
            return of(response.transactionStatusId);
          }
          return throwError(String());
        }),
        catchError((error) => {
          this.notificationGlobalService.showError(
            this.translate.instant(
              'WORKFLOW.TOAST.GET_TRANSACTION_STATUS.ERROR'
            )
          );
          return throwError(error);
        })
      );
  }

  public getFirstRoleName(): Observable<string | null> {
    return this.storeProject.selectedProject().pipe(
      switchMap((data) => {
        let roles = this.permissionSvc.getRolesByContractNumber(
          data.selectedProject.contract
        );

        return of(roles[0]?.roleName ?? null);
      })
    );
  }

  private buildLaunchRequest(
    request: WorkflowLaunchRequest,
    config: WorkflowConfig,
    transactionGuid: string,
    firstRoleName: string
  ): WorkflowLaunchRequest {
    return {
      ...request,
      entityTypeId: transactionGuid,
      businessRulesRequest: {
        module: WorkflowLaunchModuleEnum.PROCUREMENT,
        name: WorkflowLaunchNameEnum.PROCUREMENT_WORKFLOW_TYPE,
        table: WorkflowLaunchTableEnum.TYPE_CONDITIONS,
        factors: {
          ...request.businessRulesRequest.factors,
          ...this.mapSteps(config.workFlowConfig),
        },
      },
      role: firstRoleName,
    };
  }

  private mapSteps(steps: WorkflowStep[]): WorkflowLaunchRequestSteps {
    return {
      secondStep: this.mapStep(steps, 2),
      thirdStep: this.mapStep(steps, 3),
      fourthStep: this.mapStep(steps, 4),
      fifthStep: this.mapStep(steps, 5),
    };
  }

  private mapStep(steps: WorkflowStep[], order: number): string {
    const step = steps.find((s) => s.order === order);
    return !!step ? WorkflowStepEnum[step.step] : undefined;
  }
}
