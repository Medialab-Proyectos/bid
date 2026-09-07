import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services';
import * as workflowAction from '../actions/workflow.actions';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

@Injectable()
export class WorkflowEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly workflowService: WorkflowODApiService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService
  ) {}

  showErrorToast(literal: string) {
    const message = this.translate.instant(literal);
    this.notificationGlobalService.showError(message);
  }

  getWorkflow$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(workflowAction.getWorkflow),
      exhaustMap((data) =>
        this.workflowService.getWorkflow(data.projectBucketId).pipe(
          map((response) =>
            workflowAction.getWorkflowSuccess({ projectWorkflow: response })
          ),
          catchError((error) => {
            this.showErrorToast(
              this.translate.instant(
                'TRANSACTION.WORKFLOWCONFIGURATION.GET.ERROR'
              )
            );
            return of(workflowAction.getWorkflowError({ payload: error }));
          })
        )
      )
    );
  });

  getWorkflowInstitutions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(workflowAction.getWorkflowInstitution),
      exhaustMap((data) =>
        this.workflowService.getWorkflowInstitutions(data.projectBucketId).pipe(
          map((response) =>
            workflowAction.getWorkflowInstitutionSuccess({
              workflowInstitution: response,
            })
          ),
          catchError((error) => {
            this.showErrorToast(
              this.translate.instant(
                'TRANSACTION.WORKFLOWCONFIGURATION.INSTITUTION.GET.ERROR'
              )
            );
            return of(
              workflowAction.getWorkflowInstitutionError({ payload: error })
            );
          })
        )
      )
    );
  });
}
