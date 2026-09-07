import { DocumentsANI } from './../../models/responses/documents-ani.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { ErrorResponse } from '@core/models';
import {
  GetTransactionComponentsResponse,
  AnjTransactionRequest,
  TransactionGetResponse,
  BeneficiaryDetails,
  ExecutorBeneficiaries,
  TransactionSaveResponse,
  AntTransactionRequest,
  TransactionAntResponse,
  TransactionsCardsResponse,
  TransactionHeaderBalances,
  AuditTrailsGetResponse,
  TransactionAnjGetResponse,
  TransactionByIdGetResponse,
  TransactionDocumentGroupResponse,
  TransactionAudiTrailCreateRequest,
  InstitutionExist,
  RequestAndPartNumberValid,
  AvailableNumbers,
  AniHeaderDetail,
  ChangeTransactionStageResponse,
  PendingTransaction,
} from '../../models';
import { TransactionRequest } from '../../models/request/transaction-request.model';
import { GetTransactionGuidResponse } from '../../models/responses/transaction-guid-response.model';
import { TransactionSubmitDocumentRequest } from '../../models/request/transaction-submit-doc-request.model';
import { TransactionsTypes } from '../../enums';
import { Store } from '@ngrx/store';
import { AppStateWithUsrPreferences } from '@core/store';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FiTransactionsApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;
  currentLanguage = '';
  preferedLanguage = '';

  constructor(
    private readonly httpClient: HttpClient,
    readonly userPreferences: Store<AppStateWithUsrPreferences>
  ) {
    this.userPreferences.select('preferences').subscribe((res) => {
      this.currentLanguage = res.preferences?.preferredLanguage;
      this.preferedLanguage = res.preferences?.preferredLanguage;
    });
  }

  getProjectBalances(
    projectBucketId: string
  ): Observable<TransactionHeaderBalances | ErrorResponse> {
    return this.httpClient.get<TransactionHeaderBalances>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/balances`
    );
  }

  transactions$: Observable<TransactionGetResponse | ErrorResponse>;
  getProjectTransactions(
    projectBucketId: string
  ): Observable<TransactionGetResponse | ErrorResponse> {
    if (!this.transactions$) {
      this.transactions$ = this.httpClient.get<TransactionGetResponse>(
        `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions`
      );
    }
    return this.transactions$;
  }

  resetTransactions(): void {
    this.transactions$ = null;
  }

  transactionsTypes$: Observable<TransactionsCardsResponse | ErrorResponse>;
  getProjectTransactionTypes(
    projectBucketId: string
  ): Observable<TransactionsCardsResponse | ErrorResponse> {
    if (!this.transactionsTypes$) {
      this.transactionsTypes$ = this.httpClient
        .get<TransactionsCardsResponse>(
          `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/types`
        )
        .pipe(shareReplay());
    }
    return this.transactionsTypes$;
  }

  resetTransactionsTypes(): void {
    this.transactionsTypes$ = null;
  }

  getTransactionComponents(
    projectBucketId: string,
    transactionType: string
  ): Observable<GetTransactionComponentsResponse | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/components`;
    return this.httpClient.get<GetTransactionComponentsResponse>(url);
  }

  hasPendingTransactions(projectBucketId: string): Observable<boolean> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/pending`;
    return this.httpClient
      .get(url)
      .pipe(map((arr: PendingTransaction[]) => arr.length > 0));
  }

  getApprovedCurrency(
    projectBucketId: string
  ): Observable<string | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/approvedCurrencies`;
    return this.httpClient.get<string>(url, { responseType: 'text' as 'json' });
  }

  getBeneficiaries(
    projectBucketId: string,
    searchText?: string,
    transactionType?: TransactionsTypes,
    pageNumber?: number,
    pageSize?: number
  ): Observable<ExecutorBeneficiaries | ErrorResponse> {
    const attrs = [];

    if (searchText) {
      attrs.push(`?searchText=${searchText}`);
    }
    if (pageNumber) {
      attrs.push(`&pageNumber=${pageNumber}`);
    }
    if (pageSize) {
      attrs.push(`&pageSize=${pageSize}`);
    }
    if (transactionType) {
      attrs.push(`&transactionType=${transactionType}`);
    }
    return this.httpClient.get<ExecutorBeneficiaries>(
      `${
        this.basePath
      }/api/projectBuckets/${projectBucketId}/beneficiaries${attrs.join('')}`
    );
  }

  getBeneficiaryDetail(
    projectBucketId: string,
    beneficiaryId: string
  ): Observable<BeneficiaryDetails | ErrorResponse> {
    return this.httpClient.get<BeneficiaryDetails>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/beneficiaries/${beneficiaryId}`
    );
  }

  saveNewAntTransaction(
    projectBucketId: string,
    ant: AntTransactionRequest
  ): Observable<TransactionSaveResponse | ErrorResponse> {
    return this.httpClient.post<TransactionSaveResponse>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/ant`,
      ant
    );
  }

  updateAntTransaction(
    projectBucketId: string,
    transactionId: number,
    request: AntTransactionRequest
  ): Observable<unknown | ErrorResponse> {
    return this.httpClient.put<unknown>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/ant`,
      request
    );
  }

  getAntTransactionById(
    projectBucketId: string,
    transactionId: number
  ): Observable<TransactionAntResponse | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/ant`;
    return this.httpClient.get<TransactionAntResponse>(url);
  }

  getAnjTransactionById(
    projectBucketId: string,
    transactionId: number
  ): Observable<TransactionAnjGetResponse | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/anj`;
    return this.httpClient.get<TransactionAnjGetResponse>(url);
  }

  updateAnjTransaction(
    projectBucketId: string,
    transactionId: number,
    request: AnjTransactionRequest
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/anj`;
    return this.httpClient.put<TransactionSaveResponse>(url, request);
  }

  saveAnjTransaction(
    projectBucketId: string,
    request: AnjTransactionRequest
  ): Observable<TransactionSaveResponse | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/anj`;
    return this.httpClient.post<TransactionSaveResponse>(url, request);
  }

  deleteTransaction(
    projectBucketId: string,
    transactionId: number
  ): Observable<unknown | ErrorResponse> {
    return this.httpClient.delete<unknown>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionId}`
    );
  }

  getAuditTrails(
    projectBucketId: string,
    transactionId: number
  ): Observable<AuditTrailsGetResponse | ErrorResponse> {
    return this.httpClient.get<AuditTrailsGetResponse>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/AuditTrail/${this.currentLanguage}`
    );
  }

  getActionReport(
    transactionId: number
  ): Observable<HttpResponse<ArrayBuffer>> {
    const url = `${this.basePath}/api/v2/transactions/disbursement-report`;
    const options = {
      responseType: 'arraybuffer' as const,
      observe: 'response' as const,
    };
    return this.httpClient.post(
      url,
      {
        requiresUpload: false,
        transactionId,
      },
      options
    ) as Observable<HttpResponse<ArrayBuffer>>;
  }

  getTransactionById(
    projectBucketId: string,
    transactionId: number,
    transactionType: string
  ): Observable<TransactionByIdGetResponse | ErrorResponse> {
    return this.httpClient.get<TransactionByIdGetResponse>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/${transactionId}`
    );
  }

  postTransactionById(
    projectBucketId: string,
    transactionType: string,
    request: TransactionRequest
  ): Observable<TransactionSaveResponse | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionType}`;
    return this.httpClient.post<TransactionSaveResponse>(url, request);
  }

  updateTransactionById(
    projectBucketId: string,
    transactionId: number,
    transactionType: string,
    request: TransactionRequest
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/${transactionId}`;
    return this.httpClient.put<unknown>(url, request);
  }

  getDocumentGroups(
    transactionId: number,
    type: string
  ): Observable<TransactionDocumentGroupResponse | ErrorResponse> {
    const url = `${this.basePath}/api/transactions/${type}/${transactionId}/transactionsDocumentGroups`;
    return this.httpClient.get<TransactionDocumentGroupResponse>(url);
  }

  createAuditTrail(
    request: TransactionAudiTrailCreateRequest
  ): Observable<boolean | ErrorResponse> {
    return this.httpClient.post<boolean>(
      `${this.basePath}/api/transaction/CreateAuditTrails`,
      request
    );
  }

  changeTransactionStatus(
    transactionId: number,
    transactionStatusId: number
  ): Observable<ChangeTransactionStageResponse | ErrorResponse> {
    return this.httpClient.post(
      `${this.basePath}/api/transactions/changeTransactionStage?transactionId=${transactionId}&transactionStatusId=${transactionStatusId}`,
      null
    );
  }

  getTransactionGuid(
    transactionId: number
  ): Observable<GetTransactionGuidResponse | ErrorResponse> {
    return this.httpClient.get<GetTransactionGuidResponse>(
      `${
        this.basePath
      }/api/transactions/GetGuidByOriginalId?originalId=${String(
        transactionId
      )}`
    );
  }

  submitDocuments(request: TransactionSubmitDocumentRequest): Observable<any> {
    return this.httpClient.put<any>(
      `${this.basePath}/api/transactions/submitDocuments`,
      request
    );
  }

  documentsSync(transactionId: number, body: any): Observable<any> {
    return this.httpClient.post<any>(
      `${this.basePath}/api/transactions/${transactionId}/documentsSyncs`,
      body,
      { responseType: 'text' as any }
    );
  }

  checkIfInstitutionExist(
    institutionSapId: string
  ): Observable<InstitutionExist | ErrorResponse> {
    const url = `${this.basePath}/api/transactions/checkIfInstitutionExist/${institutionSapId}`;
    return this.httpClient.get<InstitutionExist>(url);
  }

  transactionsPartRequestNumbervalidate(
    projectBucketId: string,
    requestNumber: number,
    partNumber: number,
    transactionId: number
  ): Observable<RequestAndPartNumberValid | ErrorResponse> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/requestNumber/${requestNumber}/partNumber/${partNumber}/validate`;
    return this.httpClient.get<RequestAndPartNumberValid>(
      typeof transactionId !== 'undefined'
        ? `${url}?transactionId=${transactionId}`
        : url
    );
  }

  generateAndSaveActionReport(
    transactionId: number
  ): Observable<HttpResponse<ArrayBuffer>> {
    const url = `${this.basePath}/api/v2/transactions/disbursement-report`;
    const options = {
      responseType: 'arraybuffer' as const,
      observe: 'response' as const,
    };
    return this.httpClient.post(
      url,
      {
        requiresUpload: true,
        transactionId,
      },
      options
    ) as Observable<HttpResponse<ArrayBuffer>>;
  }

  availableRequestAndPartNumber(
    projectBucketId: string
  ): Observable<AvailableNumbers> {
    return this.httpClient.get<AvailableNumbers>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/availableRequestAndPartNumber`
    );
  }

  getDownloadAudit(
    transactionId: number,
    lang: string
  ): Observable<HttpResponse<ArrayBuffer>> {
    const url = `${this.basePath}/api/transactions/${transactionId}/auditTrailReport/${lang}`;
    return this.httpClient.get(url, {
      responseType: 'arraybuffer',
      observe: 'response',
    });
  }

  getAniHeaderDetail(
    projectBucketId: string,
    transactionType: TransactionsTypes
  ): Observable<AniHeaderDetail> {
    return this.httpClient.get<AniHeaderDetail>(
      `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/actionsContent`
    );
  }

  transactionAddDocumentGroup(
    transactionId: number,
    transactionType: TransactionsTypes,
    documents: DocumentsANI[]
  ): Observable<unknown | ErrorResponse> {
    const url = `${this.basePath}/api/transactions/${transactionId}/${transactionType}/addDocumentGroup`;
    return this.httpClient.post<unknown>(url, documents);
  }

  getDisbursementReport(
    projectBucketId: string
  ): Observable<HttpResponse<ArrayBuffer>> {
    const url = `${this.basePath}/api/projectBuckets/${projectBucketId}/transactions/DisbursementSummaryReport/${this.preferedLanguage}`;
    return this.httpClient.get(url, {
      responseType: 'arraybuffer',
      observe: 'response',
    });
  }
}
