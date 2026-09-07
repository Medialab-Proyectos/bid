import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BiddingProcessProcurementProcess } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilteredProcurementProcessService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}`;

  constructor(readonly http: HttpClient) {}

  getFilteredProcurementProcess(
    biddingProcessPlanId: string,
    processesIds: string[]
  ): Observable<BiddingProcessProcurementProcess[]> {
    const url = `${this.basePath}/api/biddingProcessProcurementProcesses`;
    const obj = {
      biddingProcessPlanId,
      processesIds,
    };
    return this.http
      .post<any>(url, obj)
      .pipe(map((data) => data.biddingProcessProcurementProcess));
  }
}
