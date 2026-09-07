import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import * as actions from '../actions/workflow-documents.actions';
import { WorkflowApiService } from '@core/services/apis';
import { of } from 'rxjs';
import { UpdateWorkflowDocument } from '@core/models';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

@Injectable()
export class WorkflowDocumentsEffects {
  constructor(
    readonly action$: Actions,
    readonly workflowApi: WorkflowApiService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService
  ) {}

  deleteWorkflowDocument$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.deleteWorkflowDocument),
      exhaustMap((action) => {
        return this.workflowApi
          .deleteWorkflowDocument(action.workflowDocumentId)
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'WORKFLOW.ADD_DOCUMENT.DELETE_DOCUMENT.SUCCESS'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.deleteWorkflowDocumentSuccess({
                instanceId: action.instanceId,
                workflowDocumentId: action.workflowDocumentId,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'WORKFLOW.ADD_DOCUMENT.DELETE_DOCUMENT.ERROR'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.deleteWorkflowDocumentError({
                  instanceId: action.instanceId,
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  updateDescriptionWorkflowDocument = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.updateWorkflowDocumentNewDescription),
      exhaustMap((action) => {
        const docId: string = action.docId;
        const description: string = action.newDescription;
        return this.workflowApi
          .updateWorkflowDocument(docId, { description })
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'WORKFLOW.ADD_DOCUMENT.UPDATE_DOCUMENT_DESCRIPTION.SUCCESS'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.updateWorkflowDocumentNewDescriptionSuccess({
                instanceId: action.instanceId,
                docId: action.docId,
                newDescription: action.newDescription,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'WORKFLOW.ADD_DOCUMENT.UPDATE_DOCUMENT_VISIBLITY.ERROR'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.updateWorkflowDocumentNewDescriptionError({
                  instanceId: action.instanceId,
                  payload: err,
                })
              );
            })
          );
      })
    );
  });

  updateWorkflowDocumentVisibility$ = createEffect(() => {
    return this.action$.pipe(
      ofType(actions.updateWorkflowDocumentVisilibity),
      exhaustMap((action) => {
        const updateVisibility: UpdateWorkflowDocument = {
          visibility: action.newVisibility,
        };
        return this.workflowApi
          .updateWorkflowDocument(action.workflowDocumentId, updateVisibility)
          .pipe(
            map(() => {
              const message = this.translate.instant(
                'WORKFLOW.ADD_DOCUMENT.UPDATE_DOCUMENT_VISIBLITY.SUCCESS'
              );
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.updateWorkflowDocumentVisilibitySuccess({
                instanceId: action.instanceId,
                workflowDocumentId: action.workflowDocumentId,
                newVisibility: action.newVisibility,
              });
            }),
            catchError((err) => {
              const message = this.translate.instant(
                'WORKFLOW.ADD_DOCUMENT.UPDATE_DOCUMENT_VISIBLITY.ERROR'
              );
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(
                actions.updateWorkflowDocumentVisilibityError({
                  instanceId: action.instanceId,
                  payload: err,
                })
              );
            })
          );
      })
    );
  });
}
