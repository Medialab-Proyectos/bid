import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import {
  map,
  catchError,
  exhaustMap,
  tap,
  switchMap,
  toArray,
  mergeMap,
  take,
} from 'rxjs/operators';
import * as actions from '../actions/bidding-process-plan.actions';
import {
  BiddingProcessPlanService,
  WorkflowApiService,
} from '@core/services/apis';
import {
  GetBiddingProcessPlanResponseV3,
  GetBiddingProcurementProcessByIdResponse,
  GetBiddingProcurementProcessesByProcessPlanIdResponse,
} from '@core/models';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { AppState } from '@core/store';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { WorkflowIdEntityType } from '@core/enums';
import * as headerProcessActions from '../../visibility-header-process/actions/header-process.actions';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';

@Injectable()
export class BiddingProcessPlanEffects {
  constructor(
    readonly action$: Actions,
    readonly http: HttpClient,
    readonly biddingProcessPlanSvc: BiddingProcessPlanService,
    readonly workflowApiSvc: WorkflowApiService,
    readonly workflowSharedSvc: WorkflowSharedService,
    private readonly store: Store<AppState>,
    private readonly translate: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly biddingProcessPlanStore: BiddingProcessPlanStoreService
  ) {}

  getBiddingProcessPlan$ = createEffect(() => {
    let projectBucketId = '';

    return this.action$.pipe(
      ofType(actions.getBiddingProcessPlan),
      tap((data) => {
        projectBucketId = data.projectBucketId;
      }),
      exhaustMap(() => {
        return this.biddingProcessPlanSvc
          .getBiddingProcessPlan(projectBucketId)
          .pipe(
            map((response: GetBiddingProcessPlanResponseV3) => {
              this.store.dispatch(
                actions.getBiddingProcesses({
                  biddingProcessPlanId: response.id,
                })
              );
              return actions.getBiddingProcessPlanSuccess({
                biddingProcessPlan: {
                  ...response,
                  projectBucketId,
                  version: 0,
                },
              });
            })
          );
      })
    );
  });

  getBiddingProcesses$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.getBiddingProcesses),
      exhaustMap((action) => {
        return this.biddingProcessPlanSvc
          .getBiddingProcurementProcessesByProcessPlanId(
            action.biddingProcessPlanId
          )
          .pipe(
            switchMap(
              (res: GetBiddingProcurementProcessesByProcessPlanIdResponse) => {
                return from(res);
              }
            ),
            toArray()
          )
          .pipe(
            map((response) => {
              return actions.getBiddingProcessesSuccess({
                biddingProcessProcurementProcesses: response,
              });
            }),
            catchError(() => {
              return of(actions.getBiddingProcessesError());
            })
          );
      })
    );
  });

  getBiddingProcessById$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.getBiddingProcessById),
      switchMap((action) => {
        this.store.dispatch(
          headerProcessActions.setHeaderProcessSetLoading({ loading: true })
        );
        return this.biddingProcessPlanSvc
          .getBiddingProcessProcurementProcessesById(action.biddingProcessId)
          .pipe(
            map((response: GetBiddingProcurementProcessByIdResponse) => {
              this.store.dispatch(
                headerProcessActions.setHeaderProcessSetLoading({
                  loading: false,
                })
              );
              return actions.getBiddingProcessByIdSuccess({
                biddingProcessProcurementProcess:
                  response.biddingProcessProcurementProcess,
              });
            }),
            catchError((err) => {
              this.store.dispatch(
                headerProcessActions.setHeaderProcessSetLoading({
                  loading: false,
                })
              );
              return of(
                actions.getBiddingProcessPlanError({
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  ineligibilityProcurementProcess$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.ineligibilityProcurementProcess),
      exhaustMap((action) => {
        return this.biddingProcessPlanSvc
          .ineligibilityBiddingProcessProcurementProcess(
            action.comment,
            action.procurementProcessId
          )
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'PROCUREMENT_PROCESS.INELIGIBILITY_DECLARATION.SUCCESS'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.ineligibilityProcurementProcessSuccess({
                procurementProcessId: action.procurementProcessId,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'PROCUREMENT_PROCESS.INELIGIBILITY_DECLARATION.ERROR'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.ineligibilityProcurementStatusError({
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  unsuccessfulProcurementProcess$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.unsuccessfulProcurementProcess),
      exhaustMap((action) => {
        return this.biddingProcessPlanSvc
          .unsuccessfulBiddingProcessProcurementProcess(
            action.comment,
            action.procurementProcessId
          )
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'PROCUREMENT_PROCESS.UNSUCCESSFUL_DECLARATION.SUCCESS'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.unsuccessfulProcurementProcessSuccess({
                procurementProcessId: action.procurementProcessId,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'PROCUREMENT_PROCESS.UNSUCCESSFUL_DECLARATION.ERROR'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.unsuccessfulProcurementProcessError({
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  removeProcurementProcess$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.removeProcurementProcess),
      exhaustMap((action) => {
        return this.biddingProcessPlanSvc
          .deleteBiddingProcessProcurementProcess(action.id)
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'PROCUREMENT.PROCESS.DELETE_SUCCESS'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.removeProcurementProcessSuccess({
                biddingProcessId: action.id,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'PROCUREMENT.PROCESS.DELETE_ERROR'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.removeProcurementProcessError({
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  cancelProcurementProcess$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.cancelProcurementProcess),
      exhaustMap((action) => {
        return this.biddingProcessPlanSvc
          .cancelBiddingProcess(action.biddingProcessId, action.comment)
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'PROCUREMENT.PROCESS.CANCEL_SUCCESS'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.cancelProcurementProcessSuccess({
                biddingProcessId: action.biddingProcessId,
              });
            }),
            catchError(() => {
              const message = this.translate.instant(
                'PROCUREMENT.PROCESS.CANCEL_ERROR'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.cancelProcurementProcessError({
                  biddingProcessId: action.biddingProcessId,
                })
              );
            })
          );
      })
    );
  });

  reloadProcesses$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.reloadProcesses),
      mergeMap(() => {
        return this.store.pipe(
          take(1),
          map((state) => {
            const biddingPlanId =
              state.biddingProcessPlan.biddingProcessPlan.id;
            return actions.getBiddingProcesses({
              biddingProcessPlanId: biddingPlanId,
            });
          })
        );
      })
    );
  });

  requestApproval$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.requestApproval),
      exhaustMap((action) => {
        return this.workflowSharedSvc.getFirstRoleName().pipe(
          take(1),
          switchMap((roleName) => {
            let launch = action.launchReq;
            let newLaunch = { ...launch, role: roleName };
            return this.biddingProcessPlanSvc
              .requestApproval(newLaunch.entityTypeId, newLaunch)
              .pipe(
                map(() => {
                  this.workflowSharedSvc.loadActions({
                    body: {
                      idEntityType: WorkflowIdEntityType.PROCUREMENT_PLAN,
                      entityTypeId: newLaunch.entityTypeId,
                      projectBucketId: newLaunch.projectBucketId,
                    },
                    projectContractId: action.projectId,
                    instAcronym: newLaunch.instAcronym,
                  });
                  const message = this.translate.instant(
                    'PROCUREMENT.PROCESS.APPROVAL_SUCCESS'
                  );
                  this.biddingProcessPlanStore.reloadProcessesAction();
                  this.notificationGlobalService.showSuccess(message);
                  return actions.requestApprovalSuccess({
                    launchReq: newLaunch,
                    projectId: action.projectId,
                  });
                }),
                catchError((error) => {
                  const message = this.translate.instant(
                    'PROCUREMENT.PROCESS.APPROVAL_ERROR'
                  );
                  this.notificationGlobalService.showError(message);
                  return of(
                    actions.requestApprovalError({
                      payload: error,
                    })
                  );
                })
              );
          })
        );
      })
    );
  });

  updateStatus$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.updateProcurementStatus),
      exhaustMap((action) => {
        return this.biddingProcessPlanSvc
          .updateStatus(
            action.biddingProcessId,
            action.newStatus,
            action.countryCode
          )
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'PROCESS_DOC.DOC_BTNS.STATUS_UPDATE_SUCCESS'
              );
              this.notificationGlobalService.showSuccess(message);
              return actions.updateProcurementStatusSuccess({
                biddingProcessId: action.biddingProcessId,
                newStatus: action.newStatus,
                countryCode: action.countryCode,
              });
            }),
            catchError((error) => {
              const message = this.translate.instant(
                'PROCESS_DOC.DOC_BTNS.ERROR_SUBMIT_PACKAGE'
              );
              this.notificationGlobalService.showError(message);
              return of(
                actions.updateProcurementStatusError({
                  payload: error,
                })
              );
            })
          );
      })
    );
  });
}
