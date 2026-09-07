import { Injectable } from '@angular/core';
import { AppStateWithEnums, AppStateWithWorkflow } from '@core/store';
import { Store } from '@ngrx/store';
import * as workflowAction from '../workflow/actions/workflow.actions';

@Injectable({
  providedIn: 'root'
})
export class WorkflowStoreService {

  constructor(
    private readonly store: Store<AppStateWithEnums>,
    private readonly storeWorkflow: Store<AppStateWithWorkflow>
  ) { }

  getCurrentUser() {
    return this.store.select('contact');
  }

  getEnums() {
    return this.store.select('enums');
  }

  getWorkflow() {
    return this.storeWorkflow.select('projectWorkflow');
  }

  setStoreWorkflow(projectBucketId: string): void {
    this.storeWorkflow.dispatch(workflowAction.getWorkflow({projectBucketId}));
  }
  
  setStoreWorkflowInstitution(projectBucketId: string): void {
    this.storeWorkflow.dispatch(workflowAction.getWorkflowInstitution({projectBucketId}));
  }

  resetWorkflow() {
    this.storeWorkflow.dispatch(workflowAction.resetWorkflow());
  }
  
}
