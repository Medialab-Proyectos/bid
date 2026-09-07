import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorResponse } from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import { ParticipantNoaResponse } from '../../models/response/participant-noa-response.model';

@Injectable({
  providedIn: 'root',
})
export class NoaParticipantService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  constructor(private readonly httpClient: HttpClient) {}

  getNoaParticipants(
    biddingProcessProcurementProcessId: string
  ): Observable<ParticipantNoaResponse | ErrorResponse> {
    const url = `${this.basePath}/api/biddingDocuments/${biddingProcessProcurementProcessId}/noaParticipants`;
    return this.httpClient.get<ParticipantNoaResponse>(url);
  }
}
