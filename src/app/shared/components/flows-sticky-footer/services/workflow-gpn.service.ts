import { Injectable } from '@angular/core';
import { WorkflowModuleEnum } from '@core/enums';
import { WorkflowLaunchRequest } from '@core/models';
import { WorkflowApiService } from '@core/services/apis';
import { Observable } from 'rxjs';
import { WorkflowButtonAction } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkflowGPNService {
  constructor(private readonly workflowApiSvc: WorkflowApiService) {}

  public launch(
    request: WorkflowLaunchRequest,
    lang: string,
    mod: WorkflowModuleEnum
  ): Observable<any> {
    return this.workflowApiSvc.lauchWorkflow(request, lang, mod);
  }

  public triggerAction(
    action: WorkflowButtonAction,
    lang: string,
    mod: WorkflowModuleEnum
  ): Observable<any> {
    return this.workflowApiSvc.triggerStep(action.body, lang, mod);
  }
}
