import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AmendmentRequest,
  BiddingContractsAwarded,
  ErrorResponse,
  AmendmentLastResponse,
  ParticipantsAwardedResponseV2,
  BidderV3,
} from '@core/models';
import {
  BiddingContractsPutRequest,
  BiddingContractsRequest,
} from '@core/models/requests/bidding-contracts-request.model';
import {
  BiddingContractCurrenciesResponse,
  BiddingContractDocumentsResponse,
  BiddingContractApprovalCurrencyResponse,
  BiddingContractLocationsResponse,
  BiddingContractLotsResponse,
  BiddingContractResponse,
  BiddingContractSecuritiesResponse,
} from '@core/models/responses/bidding-contracts-response.model';
import { environment } from '@fiduciary-interface/environments/environment';
import { from, mergeMap, Observable } from 'rxjs';
import {
  ContractPaymentScheduleRequest,
  ContractPaymentScheduleResponse,
  ContractPostModel,
  ContractResponse,
} from '../../../../../features/procurement/features/procurement-process/features/process-contracts/rebrand-form/models';
import { FileSaverService } from 'ngx-filesaver';
import {
  REQUEST_IS_ENCODED,
  SHOULD_CACHE_REQUEST,
} from '../../../../utils/httpContexts';

@Injectable({
  providedIn: 'root',
})
export class BiddingContractApiService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/biddingContracts`;

  constructor(
    private readonly http: HttpClient,
    readonly fileSaverService: FileSaverService
  ) {}

  postBiddingContracts(
    biddingContractsRequest: BiddingContractsRequest
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}`;
    return this.http.post<string>(url, biddingContractsRequest);
  }

  putBiddingContracts(
    biddingContractsRequest: BiddingContractsPutRequest,
    biddingContractId: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}`;
    return this.http.put<string>(url, biddingContractsRequest);
  }

  postConfirmContract(
    biddingContractsRequest: BiddingContractsRequest,
    lang: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/confirm?lang=${lang}`;
    return this.http.post<string>(url, biddingContractsRequest);
  }

  putConfirmContract(
    biddingContractId: string,
    lang: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/confirm?lang=${lang}`;
    return this.http.put<string>(url, null);
  }

  terminateContract(
    biddingContractId: string,
    lang: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/statuses/terminated?lang=${lang}`;
    return this.http.put<string>(url, null);
  }

  hasContractAmendmentUnderReview(biddingContractId): Observable<boolean> {
    const url = `${this.basePath}/${biddingContractId}/amendmentsUnderReview`;
    return this.http.get<boolean>(url);
  }

  completeContract(
    biddingContractId: string,
    lang: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/complete?lang=${lang}`;
    return this.http.put<string>(url, null);
  }

  deleteContract(
    biddingContractId: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}`;
    return this.http.delete<string>(url);
  }

  deleteContractV3(
    biddingContractId: string
  ): Observable<string | ErrorResponse> {
    const baseUrl = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    const url = `${baseUrl}/v3/bidding-contracts/${biddingContractId}`;
    return this.http.delete<string>(url);
  }

  getContractAwardees(
    biddingContractId: string
  ): Observable<BiddingContractsAwarded[] | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/awardees`;
    return this.http.get<BiddingContractsAwarded[]>(url);
  }

  getBiddingContractLocations(
    biddingContractId: string
  ): Observable<BiddingContractLocationsResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/biddingContractLocations/locations`;
    return this.http.get<BiddingContractLocationsResponse>(url);
  }

  getBiddingContractCurrencies(
    biddingContractId: string
  ): Observable<BiddingContractCurrenciesResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/biddingContractCurrencies`;
    return this.http.get<BiddingContractCurrenciesResponse>(url);
  }

  getBiddingContractLots(
    biddingContractId: string
  ): Observable<BiddingContractLotsResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/biddingContractLots`;
    return this.http.get<BiddingContractLotsResponse>(url);
  }

  getBiddingContractSecurities(
    biddingContractId: string
  ): Observable<BiddingContractSecuritiesResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/biddingContractSecurities`;
    return this.http.get<BiddingContractSecuritiesResponse>(url);
  }

  getBiddingContractDocuments(
    biddingContractId: string
  ): Observable<BiddingContractDocumentsResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/biddingContractDocuments`;
    return this.http.get<BiddingContractDocumentsResponse>(url);
  }

  getContractById(
    biddingContractId: string
  ): Observable<BiddingContractResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}`;
    return this.http.get<BiddingContractResponse>(url);
  }

  getAmendmentsLast(
    biddingContractId: string
  ): Observable<AmendmentLastResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/amendments/last`;
    return this.http.get<AmendmentLastResponse>(url);
  }

  postAmendment(
    biddingContractId: string,
    amendmend: AmendmentRequest
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/amendments`;
    return this.http.post<string>(url, amendmend);
  }

  putAmendment(
    amendmentId: string,
    amendmend: AmendmentRequest
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePath}/amendments/${amendmentId}`;
    return this.http.put<unknown>(url, amendmend);
  }

  getAmendmentById(
    biddingContractId: string
  ): Observable<AmendmentLastResponse | ErrorResponse> {
    const url = `${this.basePath}/${biddingContractId}/amendment`;
    return this.http.get<AmendmentLastResponse>(url);
  }

  putConfirmAmendment(
    amendmentId: string,
    lang: string,
    isAmendmentForNonObjection: boolean
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePath}/amendments/${amendmentId}/confirm?lang=${lang}&isAmendmentForNonObjection=${isAmendmentForNonObjection}`;
    return this.http.put<unknown>(url, null);
  }

  putUpdateAmendmentStatus(
    amendmentId: string,
    status: number
  ): Observable<any | ErrorResponse> {
    const url = `${this.basePath}/amendments/status`;
    return this.http.put<unknown>(url, {
      id: amendmentId,
      biddingContractAmendmentStatusId: status,
    });
  }

  getAwardeedsV2(
    procurementProcess: string
  ): Observable<ParticipantsAwardedResponseV2> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.get<ParticipantsAwardedResponseV2>(
      `${basePath}/v3/procurement-processes/${procurementProcess}/participants/awarders`
    );
  }

  postContractV2(contract: ContractPostModel): Observable<string> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.post<string>(`${basePath}/v3/bidding-contracts`, contract);
  }

  putContractV2(contractId: string, contract: ContractPostModel) {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.put(
      `${basePath}/v3/bidding-contracts/${contractId}`,
      contract
    );
  }

  getContractByIdV2(contractId: string): Observable<ContractResponse> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.get<ContractResponse>(
      `${basePath}/v3/bidding-contracts/${contractId}`
    );
  }

  getPaymentScheduleTemplate(
    contractId: string
  ): Observable<HttpResponse<ArrayBuffer>> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.get(
      `${basePath}/v3/bidding-contracts/${contractId}/payment-schedules/template`,
      {
        observe: 'response',
        responseType: 'arraybuffer',
      }
    );
  }

  toBlob(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(
          new Blob([new Uint8Array(event.target.result as ArrayBuffer)], {
            type: file.type,
          })
        );
      };
      reader.readAsArrayBuffer(file);
    });
  }

  uploadFilledTemplate(contractId: string, file: any): Observable<unknown> {
    const url = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/v3/bidding-contracts/${contractId}/payment-schedules/template`;

    const formData = new FormData();
    const p = this.toBlob(file.rawFile);
    return from(p).pipe(
      mergeMap((blobb) => {
        formData.append('file', blobb, file.name);
        return this.http.post<any>(url, formData, {
          context: new HttpContext().set(REQUEST_IS_ENCODED, false),
        });
      })
    );
  }

  getPaymentSchedule(
    contractId: string
  ): Observable<ContractPaymentScheduleResponse[]> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.get<ContractPaymentScheduleResponse[]>(
      `${basePath}/v3/bidding-contracts/${contractId}/payment-schedules`
    );
  }

  postPaymentSchedule(
    contractId: string,
    request: ContractPaymentScheduleRequest[]
  ) {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.post(
      `${basePath}/v3/bidding-contracts/${contractId}/payment-schedules`,
      request
    );
  }

  deletePaymentSchedule(contractId: string) {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.delete(
      `${basePath}/v3/bidding-contracts/${contractId}/payment-schedules`
    );
  }

  getBidderInfoByIdV2(bidderId: string): Observable<BidderV3> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.get<BidderV3>(`${basePath}/v3/bidder/${bidderId}`);
  }

  putConfirmContractV3(contractId: string): Observable<any | ErrorResponse> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.put(
      `${basePath}/v3/bidding-contracts/${contractId}/confirm`,
      null
    );
  }

  getOperationConversion(
    operationId: string
  ): Observable<BiddingContractApprovalCurrencyResponse> {
    const basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api`;
    return this.http.get<BiddingContractApprovalCurrencyResponse>(
      `${basePath}/v3/bidding-contracts/approval-currency?contractNumber=${operationId}`,
      {
        context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
      }
    );
  }
}
