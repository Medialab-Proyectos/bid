import { Injectable } from '@angular/core';
import { WorkflowDocument } from '@core/models';
import { AppStateWithWorkflowDocumentssState } from '@core/store';
import * as workflowActions from '@core/store/workflow-documents/actions/workflow-documents.actions';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class WorkflowDocumentsStoreService {
  constructor(
    readonly storeWorkflowDocs: Store<AppStateWithWorkflowDocumentssState>
  ) {}

  deleteWorkflowDocumentAction(
    workflowInstaceId: string,
    documentId: string
  ): void {
    this.storeWorkflowDocs.dispatch(
      workflowActions.deleteWorkflowDocument({
        instanceId: workflowInstaceId,
        workflowDocumentId: documentId,
      })
    );
  }

  addWorkflowDocumentAction(
    workflowInstaceId: string,
    workflowDocument: WorkflowDocument
  ): void {
    this.storeWorkflowDocs.dispatch(
      workflowActions.addWorkflowDocumentSuccess({
        instanceId: workflowInstaceId,
        workflowDocument,
      })
    );
  }

  updateWorkflowDocumentVisibilityAction(
    workflowInstaceId: string,
    workflowDocumentId: string,
    newVisibility: number
  ): void {
    this.storeWorkflowDocs.dispatch(
      workflowActions.updateWorkflowDocumentVisilibity({
        instanceId: workflowInstaceId,
        workflowDocumentId,
        newVisibility,
      })
    );
  }
}
