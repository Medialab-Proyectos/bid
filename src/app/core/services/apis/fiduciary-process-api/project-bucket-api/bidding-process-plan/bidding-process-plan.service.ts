import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@fiduciary-interface/environments/environment';
import {
  CreateBiddingProcessRequest,
  ErrorResponse,
  GetBiddingProcurementProcessesByProcessPlanIdResponse,
  GetBiddingProcessPlanResponseV3,
  GetBiddingProcurementProcessByIdResponse,
  GetBiddingProcurementProcessCommentResponse,
  BiddingContractsResponse,
  GetBiddingProcurementProcessMilestonesResponse,
  AddComment,
  WorkflowLaunchRequest,
} from '@core/models';
import { map, Observable } from 'rxjs';
import { GetBiddingProcessComponentResponse } from '@core/models/responses/bidding-process-component-response.model';
import { AppovedPlanResponse } from '@fiduciary-interface/app/features/procurement/models';
import { CommentsDomain } from '@fiduciary-interface/app/shared/components/dialog-comments/models/comments-domain.enum';
import { DocumentPackageProcessDetail } from '@core/models/responses/biddingProcess-document-package.model';

@Injectable({
  providedIn: 'root',
})
export class BiddingProcessPlanService {
  private readonly apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  constructor(readonly http: HttpClient) {}

  getBiddingProcessPlan(
    projectBucketId: string
  ): Observable<GetBiddingProcessPlanResponseV3 | ErrorResponse> {
    const url = `${this.apiUrl}/api/v3/procurement-plans/active?projectBucketId=${projectBucketId}`;
    return this.http.get<GetBiddingProcessPlanResponseV3>(url);
  }

  getBiddingProcurementProcessesByProcessPlanId(
    biddingProcessPlanId: string
  ): Observable<GetBiddingProcurementProcessesByProcessPlanIdResponse> {
    const url = `${this.apiUrl}/api/v3/procurement-processes/${biddingProcessPlanId}`;
    return this.http
      .get<GetBiddingProcurementProcessesByProcessPlanIdResponse>(url)
      .pipe(
        map((data: GetBiddingProcurementProcessesByProcessPlanIdResponse) => {
          return data.map((p) => {
            const comments = p.comments ?? [];
            return {
              ...p,
              totalComments: comments.length,
              marked: comments.some((c) => c.marked),
            };
          });
        })
      );
  }

  getBiddingProcessProcurementProcessesById(
    procurementProcessId: string
  ): Observable<GetBiddingProcurementProcessByIdResponse | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}`;
    return this.http.get<GetBiddingProcurementProcessByIdResponse>(url);
  }

  createBiddingProcessProcurementProcess(
    projectBucketId: string,
    biddingProcess: CreateBiddingProcessRequest
  ): Observable<string | ErrorResponse> {
    const url = `${this.apiUrl}/api/projectBuckets/${projectBucketId}/biddingProcessProcurementProcesses`;
    return this.http.post<string>(url, biddingProcess);
  }

  ineligibilityBiddingProcessProcurementProcess(
    comment: string,
    procurementProcessId: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/ineligibility`;
    return this.http.put<string>(url, { comment });
  }

  deleteBiddingProcessProcurementProcess(
    procurementProcessId: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}`;
    return this.http.delete<string>(url);
  }

  getBiddingContracts(
    procurementProcessId: string
  ): Observable<BiddingContractsResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingContracts`;
    return this.http.get<BiddingContractsResponse>(url);
  }

  getBiddingProcessComponents(
    procurementProcessId: string
  ): Observable<GetBiddingProcessComponentResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/outputs`;
    return this.http.get<GetBiddingProcessComponentResponse>(url);
  }

  getBiddingComments(
    procurementProcessId: string
  ): Observable<GetBiddingProcurementProcessCommentResponse | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessProcurementProcessComments`;
    return this.http.get<GetBiddingProcurementProcessCommentResponse>(url);
  }

  getProcessMilestones(
    procurementProcessId: string
  ): Observable<
    GetBiddingProcurementProcessMilestonesResponse | ErrorResponse
  > {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessMilestones`;
    return this.http.get<GetBiddingProcurementProcessMilestonesResponse>(url);
  }

  getDocumentPackages(
    biddingProcessProcurementProcessId: string
  ): Observable<DocumentPackageProcessDetail> {
    const url = `${this.apiUrl}/api/v2/procurement-process/${biddingProcessProcurementProcessId}/document-packages?isOptional=false`;
    return this.http.get<DocumentPackageProcessDetail>(url);
  }

  updateProcessProcurementProcess(
    biddingProcessProcurementProcessId: string,
    biddingProcess: CreateBiddingProcessRequest
  ): Observable<string | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${biddingProcessProcurementProcessId}`;
    return this.http.put<string>(url, biddingProcess);
  }

  updateProcessProcurementProcessComments(
    domain: CommentsDomain,
    biddingProcessProcurementProcessId: string,
    biddingProcessComments: AddComment[]
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.apiUrl}/api/comments?domain=${domain}&parentId=${biddingProcessProcurementProcessId}`;

    return this.http.post<string>(url, biddingProcessComments);
  }

  cancelBiddingProcess(
    biddingProcessId: string,
    comment: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.apiUrl}/api/v2/procurement-process/${biddingProcessId}/cancel`;
    return this.http.put<string>(url, { comment });
  }

  updateStatus(
    biddingProcessId: string,
    newStatus: number,
    countryCode: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${biddingProcessId}/status`;
    return this.http.put<string>(url, {
      statusId: newStatus,
      countryCode,
    });
  }

  requestApproval(
    biddingProcessPlanId: string,
    request: WorkflowLaunchRequest
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.apiUrl}/api/v2/procurement-plans/${biddingProcessPlanId}/approval`;
    return this.http.put<string>(url, request);
  }

  getApprovedPlans(
    projectBucketId: string
  ): Observable<AppovedPlanResponse | ErrorResponse> {
    const url = `${this.apiUrl}/api/projectBuckets/${projectBucketId}/biddingProcessPlans/approved`;
    return this.http.get<AppovedPlanResponse>(url);
  }

  returnAction(biddingProcessPlanId: string): Observable<any | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessPlans/${biddingProcessPlanId}/return`;
    return this.http.put<any>(url, null);
  }

  approvedAction(
    biddingProcessPlanId: string
  ): Observable<any | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessPlans/${biddingProcessPlanId}/approved`;
    return this.http.put<any>(url, null);
  }

  approvedPlanV2(biddingProcessPlanId: string, body: any) {
    const url = `${this.apiUrl}/api/v2/procurement-plans/${biddingProcessPlanId}/approved`;
    return this.http.put<any>(url, body);
  }

  updateBidValidityDate(
    procurementProcessId: string,
    actualDate: Date
  ): Observable<string> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/bidValidityDate`;
    return this.http.put<string>(url, actualDate);
  }

  unsuccessfulBiddingProcessProcurementProcess(
    comment: string,
    procurementProcessId: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/unsuccessful`;
    return this.http.put<string>(url, { comment });
  }
}
