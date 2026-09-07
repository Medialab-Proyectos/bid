import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '@fiduciary-interface/environments/environment';
import { ActivitiesActiveResponse, ErrorResponse } from '@core/models';
import { ActivitiesRequest } from '@core/models/requests/activities-request.model';
import { GroupDescriptor } from '@progress/kendo-data-query';
@Injectable({
  providedIn: 'root',
})
export class ActivitiesApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  groups$: Observable<GroupDescriptor[]> = null;
  private boolSubject: Subject<GroupDescriptor[]>;

  constructor(private readonly httpClient: HttpClient) {
    this.boolSubject = new Subject<GroupDescriptor[]>();
    this.groups$ = this.boolSubject.asObservable();
  }

  setGroups(groups: GroupDescriptor[]) {
    this.boolSubject.next(groups);
  }

  getAllActivities(
    activities: ActivitiesRequest,
    page: number,
    size: number,
    orderBy?: string,
    orderType?: string
  ): Observable<ActivitiesActiveResponse | ErrorResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('index', (page + 1).toString());
    httpParams = httpParams.append('size', size.toString());
    if (orderType) {
      httpParams = httpParams.append('orderBy', orderBy.toString());
      httpParams = httpParams.append('orderType', orderType.toString());
    }
    const url = `${this.basePath}/api/v2/activities`;
    return this.httpClient.post<ActivitiesActiveResponse>(url, activities, {
      params: httpParams,
    });
  }
}
