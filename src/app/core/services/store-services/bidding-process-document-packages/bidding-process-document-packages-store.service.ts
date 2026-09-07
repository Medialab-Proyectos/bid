import { filter, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  BiddingProcessDocumentGroup,
  FiduciaryProcessDocument,
} from '@core/models';
import {
  AppStateWithBiddingProcessDocumentPackages,
  BiddingProcessDocumentPackagesState,
} from '@core/store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as actions from '../../../store/bidding-process-document-packages/actions/bidding-process-document-packages.actions';

@Injectable({
  providedIn: 'root',
})
export class BiddingProcessDocumentPackagesStoreService {
  constructor(
    private readonly store: Store<AppStateWithBiddingProcessDocumentPackages>
  ) {}

  private get state$(): Observable<BiddingProcessDocumentPackagesState> {
    return this.store.pipe(select('biddingProcessDocumentPackages'));
  }

  getDocumentPackagesByProcess(processId: string) {
    return this.state$.pipe(
      filter((state) =>
        Boolean(state.biddingProcessDocumentPackagesByProcess[processId])
      ),
      map((state) => state.biddingProcessDocumentPackagesByProcess[processId])
    );
  }

  public getDocumentPackagesAction(
    processId: string,
    isOptional: boolean
  ): void {
    this.store.dispatch(actions.getDocumentPackages({ processId, isOptional }));
  }

  public getDocumentGroupsAction(
    processId: string,
    biddingProcessDocumentPackageId: string,
    biddingProcessDocumentGroups: BiddingProcessDocumentGroup[]
  ): void {
    this.store.dispatch(
      actions.getDocumentGroupsSuccess({
        processId,
        biddingProcessDocumentPackageId,
        biddingProcessDocumentGroups,
      })
    );
  }

  public deleteDocument(
    processId: string,
    biddingProcessDocumentPackageId: string,
    fiduciaryProcessDocument: FiduciaryProcessDocument,
    uploadFile: boolean
  ): void {
    this.store.dispatch(
      actions.removeFiduciaryProcessDocumentsSuccess({
        processId,
        biddingProcessDocumentPackageId,
        fiduciaryProcessDocument,
        uploadFile,
      })
    );
  }

  public addDescriptionToExistingDoc(
    procurementProcessId: string,
    packageId: string,
    groupCode: number,
    docId: string,
    newDescription: string
  ): void {
    this.store.dispatch(
      actions.addDescriptionExistingDoc({
        procurementProcessId,
        packageId,
        groupCode,
        docId,
        newDescription,
      })
    );
  }

  public addDocumentPackagesAction(
    processId: string,
    biddingProcessDocumentPackageId: string,
    fiduciaryProcessDocuments: FiduciaryProcessDocument[],
    groupId = null
  ): void {
    this.store.dispatch(
      actions.addFiduciaryProcessDocumentsSuccess({
        processId,
        biddingProcessDocumentPackageId,
        fiduciaryProcessDocuments,
        groupId,
      })
    );
  }

  public addedDescriptionNotUploadedDoc(
    processId: string,
    biddingProcessDocumentPackageId: string,
    fiduciaryProcessDocument: FiduciaryProcessDocument
  ): void {
    this.store.dispatch(
      actions.addDescriptionNotUploadDoc({
        processId,
        biddingProcessDocumentPackageId,
        fiduciaryProcessDocument,
      })
    );
  }

  changeDocumentPackageStatusAction(processId: string, packageId: string): void {
    this.store.dispatch(actions.changePackageStatus({ processId, packageId }));
  }

  changeDocumentPackageStatusErrorAction(processId: string, packageId: string): void {
    this.store.dispatch(
      actions.changePackageStatusError({ processId, packageId })
    );
  }

  changeDocumentPackageStatusSuccessAction(
    processId: string,
    packageId: string,
    status: number
  ): void{
    this.store.dispatch(
      actions.changePackageStatusSuccess({ processId, packageId, status })
    );
  }

  changeResultConfigAction(processId: string, packageId: string): void {
    this.store.dispatch(actions.changeResultConfig({ processId, packageId }));
  }

  changeResultConfigActionSuccess(
    processId: string,
    packageId: string,
    groupId: string,
    fileId: string,
    result: number
  ): void {
    this.store.dispatch(
      actions.changeResultConfigSuccess({
        processId,
        packageId,
        groupId,
        fileId,
        result,
      })
    );
  }

  changeResultConfigActionError(processId: string, packageId: string): void {
    this.store.dispatch(
      actions.changeResultConfigError({ processId, packageId })
    );
  }

  /**
   * Action that updates the Actual date of the package
   * @param actualDate
   * @param packageId
   * @param processId
   */
  changeDocumentPackageStatusActualDateAction(
    prevDate: Date,
    actualDate: Date,
    packageId: string,
    processId: string,
    lang: string
  ): void {
    this.store.dispatch(
      actions.changePackageActualDate({
        prevDate,
        actualDate,
        packageId,
        processId,
        lang,
      })
    );
  }
}
