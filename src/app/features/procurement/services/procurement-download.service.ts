import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProcurementDownloadService {
  constructor(readonly http: HttpClient) {}

  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}`;

  downloadRawData(biddingProcessPlanId: string): Observable<any> {
    const url = `${this.basePath}/api/v3/bidding-process-plan/${biddingProcessPlanId}/raw-data`;
    return this.http.get(url, {
      observe: 'response' as 'response',
      responseType: 'arraybuffer',
    });
  }
}
