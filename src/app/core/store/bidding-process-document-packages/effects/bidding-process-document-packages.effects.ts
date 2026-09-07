import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from '../actions/bidding-process-document-packages.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { GetProcessDocumentPackageByProcurementIdResponse } from '@core/models';
import { BiddingProcessDocumentPackagesApiService } from '@core/services/apis';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { AdditionalDocPackagesService } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-additional-doc-packages/services/additional-doc-packages.service';
import { DocumentPackagesStatus } from '@core/enums';

@Injectable()
export class BiddingProcessDocumentPackagesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly documentsApi: BiddingProcessDocumentPackagesApiService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalSvc: NotificationGlobalService,
    readonly optionalPackageService: AdditionalDocPackagesService
  ) {}

  updateDescriptiongDoc$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateDescriptiongDoc),
      mergeMap((action) =>
        this.documentsApi
          .editBiddingProcessPackageDocument(
            action.relationalId,
            action.procurementProcessId,
            action.groupId,
            action.description
          )
          .pipe(
            map(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.DOCUMENT_TAB.UPDATE_DESCRIPTION.SUCCESS'
              );
              this.notificationGlobalSvc.showSuccess(msg);
              return actions.updateDescriptiongDocSuccess({
                relationalId: action.relationalId,
                packageId: action.packageId,
                groupId: action.groupId,
                description: action.description,
                procurementProcessId: action.procurementProcessId,
              });
            }),
            catchError(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.DOCUMENT_TAB.UPDATE_DESCRIPTION.ERROR'
              );
              this.notificationGlobalSvc.showError(msg);

              return of(
                actions.updateDescriptiongDocError({
                  relationalId: action.relationalId,
                })
              );
            })
          )
      )
    );
  });

  getBiddingProcessDocumentPackages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.getDocumentPackages),
      mergeMap((action) =>
        this.documentsApi
          .getBiddingProcessDocumentPackages(
            action.processId,
            action.isOptional
          )
          .pipe(
            map(
              (response: GetProcessDocumentPackageByProcurementIdResponse) => {
                return actions.getDocumentPackagesSuccess({
                  processId: action.processId,
                  biddingProcessDocumentPackages:
                    response.biddingProcessDocumentPackage,
                  lastBidValidityExtensionDate:
                    response.lastBidValidityExtensionDate
                      ? new Date(response.lastBidValidityExtensionDate)
                      : null,
                });
              }
            ),
            catchError(() =>
              of(
                actions.getDocumentPackagesSuccess({
                  processId: action.processId,
                  biddingProcessDocumentPackages: [],
                  lastBidValidityExtensionDate: null,
                })
              )
            )
          )
      )
    );
  });

  updateAcualDate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.changePackageActualDate),
      mergeMap((action) =>
        this.documentsApi
          .updateDocumentPackageActualDate(
            action.actualDate,
            action.packageId,
            action.lang
          )
          .pipe(
            map(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.DOCUMENT_TAB.ACTUAL_DATE_UPDATE.SUCCESS'
              );
              this.notificationGlobalSvc.showSuccess(msg);
              return actions.changePackageActualDateSuccess({
                actualDate: action.actualDate,
                packageId: action.packageId,
                processId: action.processId,
              });
            }),
            catchError(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.DOCUMENT_TAB.ACTUAL_DATE_UPDATE.ERROR'
              );
              this.notificationGlobalSvc.showError(msg);

              return of(
                actions.changePackageActualDateError({
                  prevDate: action.prevDate,
                  packageId: action.packageId,
                  processId: action.processId,
                })
              );
            })
          )
      )
    );
  });

  deletePackage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.deletePackage),
      mergeMap((action) =>
        this.documentsApi
          .updateStatus(
            action.biddingProcessDocumentPackageId,
            DocumentPackagesStatus.DELETED
          )
          .pipe(
            map(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.ADDITONAL_DOCUMENT_TAB.DELETE_ADDITIONAL_PACKAGE_SUCCESS'
              );
              this.notificationGlobalSvc.showSuccess(msg);
              return actions.deletePackageSuccess({
                processId: action.processId,
                biddingProcessDocumentPackageId:
                  action.biddingProcessDocumentPackageId,
              });
            }),
            catchError(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.ADDITONAL_DOCUMENT_TAB.DELETE_ADDITIONAL_PACKAGE_ERROR'
              );
              this.notificationGlobalSvc.showError(msg);
              return of(
                actions.deletePackageError({ processId: action.processId })
              );
            })
          )
      )
    );
  });

  updateBidValidityExtensionDate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateBidValidityExtensionDate),
      mergeMap((action) =>
        this.optionalPackageService
          .updateBidValidityExtensionDate(
            action.biddingProcessDocumentPackageId,
            action.bidValidityExtensionDate
          )
          .pipe(
            map(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.ADDITONAL_DOCUMENT_TAB.UPDATE_BID_VALIDITY_ADDITIONAL_PACKAGE_SUCCESS'
              );
              this.notificationGlobalSvc.showSuccess(msg);
              return actions.updateBidValidityExtensionDateSuccess({
                processId: action.processId,
                biddingProcessDocumentPackageId:
                  action.biddingProcessDocumentPackageId,
                bidValidityExtensionDate: action.bidValidityExtensionDate,
              });
            }),
            catchError(() => {
              const msg = this.translate.instant(
                'PROCESS_DOC.ADDITONAL_DOCUMENT_TAB.UPDATE_BID_VALIDITY_ADDITIONAL_PACKAGE_ERROR'
              );
              this.notificationGlobalSvc.showError(msg);
              return of(
                actions.updateBidValidityExtensionDateError({
                  processId: action.processId,
                })
              );
            })
          )
      )
    );
  });
}
