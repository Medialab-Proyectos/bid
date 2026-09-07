import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkflowModuleEnum } from '@core/enums';
import {
  ErrorResponse,
  GetWorkflowDocumentResponse,
  PostWorkflowDocumentResponse,
  UpdateWorkflowDocument,
  WorkflowLastStepRequestBody,
  WorkflowLastStepResponse,
  WorkflowLaunchRequest,
  WorkflowTriggerRequestBody,
} from '@core/models';
import { ProcurementCommentGetResponse } from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { FileInfo } from '@progress/kendo-angular-upload';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { BiddingProcessDocumentPackagesApiService } from '../bidding-process-document-packages-api/bidding-process-document-packages-api.service';
import { REQUEST_IS_ENCODED } from '@core/utils/httpContexts';

@Injectable({ providedIn: 'root' })
export class WorkflowApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;
  constructor(
    readonly http: HttpClient,
    readonly documentsApi: BiddingProcessDocumentPackagesApiService
  ) {}

  getLastStep(
    body: WorkflowLastStepRequestBody
  ): Observable<WorkflowLastStepResponse> {
    return this.http.get<WorkflowLastStepResponse>(
      `${this.basePath}/api/v3/workflows/last-step?idEntityType=${body.idEntityType}&projectBucketId=${body.projectBucketId}&entityTypeId=${body.entityTypeId}`
    );
  }

  triggerStep(
    body: WorkflowTriggerRequestBody,
    lang: string,
    mod: WorkflowModuleEnum
  ): Observable<any | ErrorResponse> {
    const url = `${this.basePath}/api/step/trigger?lang=${lang}&wrkmod=${mod}`;
    return this.http.post<any>(url, body);
  }

  lauchWorkflow(
    request: WorkflowLaunchRequest,
    lang: string,
    mod: WorkflowModuleEnum
  ): Observable<any | ErrorResponse> {
    const url = `${this.basePath}/api/launch/workflow?lang=${lang}&wrkmod=${mod}`;
    return this.http.post<any>(url, request, { responseType: 'text' as any });
  }

  getComments(
    workflowInstanceId: string
  ): Observable<ProcurementCommentGetResponse | ErrorResponse> {
    const url = `${this.basePath}/api/workflows/comments`;
    return this.http.get<ProcurementCommentGetResponse>(url, {
      params: { workflowInstanceId },
    });
  }

  getDocuments(
    workflowInstanceExternalId: string
  ): Observable<GetWorkflowDocumentResponse[]> {
    const url = `${this.basePath}/api/workflowDocuments/documents?externalWorkflowInstance=${workflowInstanceExternalId}`;
    return this.http.get<GetWorkflowDocumentResponse[]>(url);
  }

  uploadWorkflowDocuments(
    workflowInstanceExternalId: string,
    file: FileInfo
  ): Observable<PostWorkflowDocumentResponse | ErrorResponse> {
    const url = `${this.basePath}/api/workflowDocuments?externalWorkflowInstance=${workflowInstanceExternalId}`;

    const formData = new FormData();
    const p = this.documentsApi.toBlob(file.rawFile);

    return from(p).pipe(
      mergeMap((blobb) => {
        formData.append('file', blobb, file.name);

        return this.http.post<any>(url, formData, {
          context: new HttpContext().set(REQUEST_IS_ENCODED, false),
        });
      })
    );
  }
  deleteWorkflowDocument(
    documentId: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/api/fiduciaryProcessDocuments/${documentId}?domain=6`;
    return this.http.delete<string>(url);
  }

  updateWorkflowDocument(
    documentId: string,
    body: UpdateWorkflowDocument
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/api/workflowDocuments/document?fiduciaryProcessdocumentId=${documentId}`;
    return this.http.put<string>(url, body);
  }

  putEzshareWorkflowDocuments(
    workflowInstanceExternalId: string,
    biddingProcessProcurementProcessId: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/api/workflowDocuments/documents/sendToEzShare?externalWorkflowInstance=${workflowInstanceExternalId}&biddingProcessProcurementProcessId=${biddingProcessProcurementProcessId}`;
    return this.http.put<string>(url, {});
  }
}
