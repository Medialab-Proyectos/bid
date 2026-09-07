import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable, of, throwError } from 'rxjs';
import {
  AssignedUser,
  GetTransactionStatus,
  WorkflowConfig,
  WorkflowInstitution,
  WorkflowStep,
  WorkflowActive,
  EntityTypes,
} from '@fiduciary-interface/app/features/workflow/models';
import { ProjectStoreService } from '@core/services/store-services/project/project-store.service';
import { filter, mergeMap } from 'rxjs/operators';
import { IdentityType } from '../../models/workflow-active.model';

@Injectable({
  providedIn: 'root',
})
export class WorkflowODApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;

  constructor(
    private readonly http: HttpClient,
    readonly projectStore: ProjectStoreService
  ) {}

  configuration$: Observable<WorkflowConfig>;
  getWorkflow(projectBucketId: string): Observable<WorkflowConfig> {
    if (!this.configuration$) {
      this.configuration$ = this.http.get<WorkflowConfig>(
        `${this.config.endpoint}/api/workFlowOD/${projectBucketId}/configuration`
      );
    }
    return this.configuration$;
  }

  resetConfiguration(): void {
    this.configuration$ = null;
  }

  createWorkflow(
    projectBucketId: string,
    executorAcronym: string
  ): Observable<WorkflowConfig> {
    return this.http.post(
      `${this.config.endpoint}/api/workFlowOD/${projectBucketId}/configuration`,
      { executorAcronym }
    );
  }

  getWorkflowActive(): Observable<EntityTypes> {
    return this.projectStore.selectedProject().pipe(
      filter((data) => !!data && !!data.selectedProject),
      mergeMap((data) =>
        this.getAllWorkflowActive({
          projectBucketId: data.selectedProject.projectBucketId,
          idEntityType: IdentityType.FINANCIALTRANSACTION,
        })
      )
    );
  }

  getWorkflowData(): Observable<WorkflowStep[]> {
    return this.projectStore.selectedProject().pipe(
      filter((data) => !!data && !!data.selectedProject),
      mergeMap((data) => {
        return this.createWorkflow(
          data.selectedProject.projectBucketId,
          data.selectedProject.executorAcronym
        );
      }),
      mergeMap((response) => {
        if (!!response && !!response.workFlowConfig) {
          return of(response.workFlowConfig);
        }
        return throwError('');
      })
    );
  }

  updateWorkflow(
    projectBucketId: string,
    data: WorkflowConfig,
    lang: string
  ): Observable<any> {
    return this.http.put(
      `${this.config.endpoint}/api/workFlowOD/${projectBucketId}/configuration/${lang}`,
      data
    );
  }

  getWorkflowInstitutions(
    projectBucketId: string
  ): Observable<WorkflowInstitution> {
    return this.http.get<WorkflowInstitution>(
      `${this.config.endpoint}/api/workFlowOD/${projectBucketId}/institutions`
    );
  }

  getWorkflowAssignedUsers(
    projectBucket: string,
    institutionCode: string
  ): Observable<{ users: AssignedUser[] }> {
    return this.http.get<{ users: AssignedUser[] }>(
      `${this.config.endpoint}/api/workFlowOD/${encodeURIComponent(
        projectBucket
      )}/institutions/${encodeURIComponent(institutionCode)}/users`
    );
  }

  getTransactionStatus(
    projectBucketId: string,
    action: string
  ): Observable<GetTransactionStatus> {
    return this.http.get<GetTransactionStatus>(
      `${this.config.endpoint}/api/workFlowOD/${projectBucketId}/action/${action}/status`
    );
  }

  getAllWorkflowActive(data: WorkflowActive): Observable<EntityTypes> {
    return this.http.post<EntityTypes>(
      `${this.config.endpoint}/api/workflow/getAllWorkflowActive`,
      data
    );
  }
}
