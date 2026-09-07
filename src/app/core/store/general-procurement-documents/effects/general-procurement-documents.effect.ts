import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as actions from '../actions/general-procurement-documents.action';
import { GeneralProcurementDocumentResponse } from '@core/models';
import { GeneralProcurementDocumentsApiService } from '@core/services/apis';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { DocumentDomain } from '@core/enums';

@Injectable()
export class GeneralProcurementDocumentsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly gpnApi: GeneralProcurementDocumentsApiService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService
  ) {}

  getGeneralProcurementDocuments$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.getProcurementDocuments),
      concatMap((action) =>
        this.gpnApi
          .getGeneralProcurementDocuments(action.projectBucketId, action.domain)
          .pipe(
            map((response: GeneralProcurementDocumentResponse) => {
              return actions.getProcurementDocumentsSuccess({
                generalProcurementDocuments: response.fiduciaryProcessDocuments,
              });
            }),
            catchError(() =>
              of(
                actions.getProcurementDocumentsSuccess({
                  generalProcurementDocuments: [],
                })
              )
            )
          )
      )
    );
  });

  deleteGeneralProcurementDocument$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.deleteProcurementDocument),
      concatMap((action) =>
        this.gpnApi
          .deleteGeneralProcurementDocument(
            action.documentId,
            DocumentDomain.PROJECTBUCKET
          )
          .pipe(
            map(() => {
              const message = this.translate.instant('GPN.DELETE_SUCCESS');
              this.notificationGlobalService.showSuccess(
                message,
                'right',
                'top',
                7000
              );
              return actions.deleteProcurementDocumentSuccess({
                documentId: action.documentId,
              });
            }),
            catchError(() => {
              const message = this.translate.instant('GPN.DELETE_ERROR');
              this.notificationGlobalService.showError(
                message,
                'right',
                'top',
                7000
              );
              return of(actions.deleteProcurementDocumentError());
            })
          )
      )
    );
  });
}
