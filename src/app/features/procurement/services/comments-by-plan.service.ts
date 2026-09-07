import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommentsByPlan } from '@core/models/commentsByPlan.model';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentsByPlanService {
  constructor(readonly http: HttpClient) {}

  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}`;

  getCommentsByPlan(projectBucketId: string): Observable<CommentsByPlan> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/biddingProcessProcurementProcesses/Comments`;
    return this.http.get<CommentsByPlan>(url);
  }
}
