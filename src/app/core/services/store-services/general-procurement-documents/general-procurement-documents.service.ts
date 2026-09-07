import { Injectable } from '@angular/core';
import {
  AppStateWithGeneralProcurementDocuments,
  GeneralProcurementDocumentsState,
} from '@core/store/general-procurement-documents/reducers/general-procurement-documents.reducer';
import * as actions from '@core/store/general-procurement-documents/actions/general-procurement-documents.action';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeneralProcurementDocumentsStoreService {
  constructor(
    private readonly store: Store<AppStateWithGeneralProcurementDocuments>
  ) {}

  get state$(): Observable<GeneralProcurementDocumentsState> {
    return this.store.pipe(select('generalProcurementDocuments'));
  }

  getGeneralProcurementDocumentsAction(
    projectBucketId: string,
    domain: number
  ): void {
    this.store.dispatch(
      actions.getProcurementDocuments({ projectBucketId, domain })
    );
  }

  deleteGeneralProcurementDocumentAction(documentId: string): void {
    this.store.dispatch(actions.deleteProcurementDocument({ documentId }));
  }

  changeDocumentStatus(documentId: string, status: number): void {
    this.store.dispatch(actions.changeStatus({ id: documentId, status }));
  }

  getState(): Observable<GeneralProcurementDocumentsState> {
    return this.state$;
  }
}
