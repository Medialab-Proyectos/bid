import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UBOBiddersResponse } from '@core/models/responses/ubo-response.model';
import { UBOBiddersRequest, UBOData } from '@core/models/ubo.model';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UboApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;
  private uboDataCache$: Observable<UBOData> | null = null;

  constructor(private readonly httpClient: HttpClient) {}

  getUBOBidders(processId: string): Observable<UBOBiddersResponse> {
    const url = `${this.basePath}/api/v2/procurement-process/${processId}/property-effective/bidders`;
    return this.httpClient.get<UBOBiddersResponse>(url);
  }

  postUBOEmails(
    packageId: string,
    biddersRq: UBOBiddersRequest
  ): Observable<string> {
    const url = `${this.basePath}/api/v2/document-packages/${packageId}/property-effective/emails`;
    return this.httpClient.post<string>(url, biddersRq);
  }

  getUBO(): Observable<UBOData> {
    if (!this.uboDataCache$) {
      this.uboDataCache$ = this.httpClient
        .get<UBOData>('assets/json/uboRules.json')
        .pipe(shareReplay(1));
    }
    return this.uboDataCache$;
  }
}
