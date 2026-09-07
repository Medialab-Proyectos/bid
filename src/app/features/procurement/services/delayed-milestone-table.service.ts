import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  DelayedMilestoneAmendmentsResponse,
  DelayedMilestoneContractsResponse,
  DelayedMilestoneProcessResponse,
} from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DelayedMilestoneTableService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}`;

  constructor(readonly http: HttpClient) {}

  getDelayedProcessMilestone(
    biddingProcessPlanId: string
  ): Observable<DelayedMilestoneProcessResponse> {
    const url = `${this.basePath}/api/v2/procurement-plans/${biddingProcessPlanId}/summaries/planned-milestones`;
    return this.http.get<DelayedMilestoneProcessResponse>(url);
  }
  getDelayedContractsMilestone(
    biddingProcessPlanId: string
  ): Observable<DelayedMilestoneContractsResponse> {
    const url = `${this.basePath}/api/v2/procurement-plans/${biddingProcessPlanId}/summaries/contracts-registered`;
    return this.http.get<DelayedMilestoneContractsResponse>(url);
  }
  getDelayedAmendmentsMilestone(
    biddingProcessPlanId: string
  ): Observable<DelayedMilestoneAmendmentsResponse> {
    const url = `${this.basePath}/api/v2/procurement-plans/${biddingProcessPlanId}/summaries/amendments-registered`;
    return this.http.get<DelayedMilestoneAmendmentsResponse>(url);
  }
}
