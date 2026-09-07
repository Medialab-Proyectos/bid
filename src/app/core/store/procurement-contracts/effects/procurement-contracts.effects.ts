import { Injectable } from '@angular/core';
import {
  BiddingContractApiService,
  BiddingProcessPlanService,
} from '@core/services/apis';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import * as actions from '../actions/procurement-contracts.action';

@Injectable()
export class ProcurementContractsEffects {
  constructor(
    readonly action$: Actions,
    readonly biddingProcessPlanService: BiddingProcessPlanService,
    private readonly binddingContractsApi: BiddingContractApiService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService
  ) {}

  getProcurementContracts$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.getContracts),
      exhaustMap((action) => {
        return this.biddingProcessPlanService
          .getBiddingContracts(action.processId)
          .pipe(
            map((response) => {
              return actions.getContractsSuccess({
                processId: action.processId,
                contracts: response.biddingContracts,
                processCode: action.processCode,
              });
            }),
            catchError((err) =>
              of(
                actions.getContractsError({
                  processId: action.processId,
                  payload: err,
                })
              )
            )
          );
      })
    );
  });

  deleteContract$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.deleteContract),
      exhaustMap((action) => {
        const deleteObservable = action.isCopy
          ? this.binddingContractsApi.deleteContractV3(action.contractId)
          : this.binddingContractsApi.deleteContract(action.contractId);
        return deleteObservable.pipe(
          map(() => {
            const message = this.translate.instant(
              'CONTRACT.DELETE_SUCCESS_TOAST'
            );
            this.notificationGlobalService.showSuccess(
              message,
              'right',
              'top',
              7000
            );
            return actions.deleteContractSuccess({
              processId: action.processId,
              contractId: action.contractId,
              isCopy: action.isCopy,
            });
          }),
          catchError((err) => {
            const message = this.translate.instant(
              'CONTRACT.DELETE_ERROR_TOAST'
            );
            this.notificationGlobalService.showError(
              message,
              'right',
              'top',
              7000
            );
            return of(
              actions.deleteContractError({
                processId: action.processId,
                payload: err,
              })
            );
          })
        );
      })
    );
  });

  terminateContract$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.terminateContract),
      exhaustMap((action) => {
        return this.binddingContractsApi
          .terminateContract(action.contractId, action.lang)
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'CONTRACT.TERMINATE_SUCCESS_TOAST'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.terminateContractSuccess({
                processId: action.processId,
                contractId: action.contractId,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'CONTRACT.TERMINATE_ERROR_TOAST'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.terminateContractError({
                  processId: action.processId,
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  completeContract$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.completeContract),
      exhaustMap((action) => {
        return this.binddingContractsApi
          .completeContract(action.contractId, action.lang)
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'CONTRACT.COMPLETE_SUCCESS_TOAST'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.completeContractSuccess({
                processId: action.processId,
                contractId: action.contractId,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'CONTRACT.COMPLETE_ERROR_TOAST'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.completeContractError({
                  processId: action.processId,
                  payload: err,
                })
              );
            })
          );
      })
    );
  });
}
