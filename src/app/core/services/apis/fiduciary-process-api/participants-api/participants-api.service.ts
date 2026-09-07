import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import {
  ErrorResponse,
  ParticipantAddRequest,
  GetParticipantsResponse,
  ParticipantsAwardedResponse,
  SettingsParticipantsResponse,
} from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class ParticipantsApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  constructor(private readonly httpClient: HttpClient) {}

  getParticipantsSettings(
    countryCode: string,
    categoryId: number,
    procurementMethodId: number,
    packageCodeId: number
  ): Observable<SettingsParticipantsResponse> {
    const url = `${this.basePath}/api/v2/settings/participants?countryCode=${countryCode}&categoryId=${categoryId}&procurementMethodId=${procurementMethodId}&packageCodeId=${packageCodeId}`;
    return this.httpClient.get<SettingsParticipantsResponse>(url);
  }

  getParticipants(
    procurementProcessId: string
  ): Observable<GetParticipantsResponse | ErrorResponse> {
    const url = `${this.basePath}/api/v2/procurement-process/${procurementProcessId}/participants`;
    return this.httpClient.get<GetParticipantsResponse>(url);
  }

  createParticipant(
    participant: ParticipantAddRequest,
    biddingProcessProcurementProcessId: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/api/v2/procurement-process/${biddingProcessProcurementProcessId}/participants`;
    return this.httpClient.post<string>(url, participant);
  }

  updateParticipant(
    participant: ParticipantAddRequest,
    biddingProcessParticipantId: string,
    biddingProcessProcurementProcessId: string
  ): Observable<ParticipantAddRequest | ErrorResponse> {
    const url = `${this.basePath}/api/v2/procurement-process/${biddingProcessProcurementProcessId}/participants/${biddingProcessParticipantId}`;
    return this.httpClient.put<ParticipantAddRequest>(
      url,
      this.getParticipantRequest(participant)
    );
  }

  deleteParticipant(
    biddingProcessParticipantId: string,
    procurementProcessId: string
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePath}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessParticipants/${biddingProcessParticipantId}`;
    return this.httpClient.delete<unknown>(url);
  }

  private getParticipantRequest(
    participant: ParticipantAddRequest
  ): ParticipantAddRequest {
    return {
      biddingProcessBidderId: participant.biddingProcessBidderId,
      result: participant.result,
      weighedTechScore: participant.weighedTechScore,
      weighedFinancialScore: participant.weighedFinancialScore,
      totalScore: participant.totalScore,
      amount: participant.amount,
      currency: participant.currency,
      amountUsd: participant.amountUsd,
      rejectedReason: participant.rejectedReason,
      justificationEligibility: participant.justificationEligibility,
    };
  }

  getAwardedParticipants(
    procurementProcessId: string
  ): Observable<ParticipantsAwardedResponse | ErrorResponse> {
    const url = `${this.basePath}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessParticipantsAwarded`;
    return this.httpClient.get<ParticipantsAwardedResponse>(url);
  }
}
