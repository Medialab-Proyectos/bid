import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { REQUEST_IS_ENCODED } from '@core/utils/httpContexts';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { buildExecutorSituation } from './payment-record-situation.builder';
import {
  CommitmentDetail,
  ExpenditureStatementType,
  ExecutorSituation,
  GeneratedStatement,
  ProjectComponent,
  StatementCandidates,
  CommitmentPayment,
  CommitmentPaymentsResponse,
  AccumulatedPaymentRequest,
  CommitmentFundingTotals,
  CurrencyCeiling,
  ExchangeRatePayment,
  ExchangeRateSettings,
  GenerateStatementRequest,
  ImportValidationResult,
  ManualPaymentRequest,
  PreviousStatement,
  StatementComponentDetail,
  StatementDraft,
  PaymentMechanismRequest,
  PaymentExchangeRate,
  PaymentRecordSummary,
  PlannedPayment,
} from '../models/payment-record.model';

@Injectable({ providedIn: 'root' })
export class PaymentRecordApiService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/v3/payment-records`;

  constructor(private readonly http: HttpClient) {}

  getSummary(projectBucketId: string): Observable<PaymentRecordSummary> {
    return this.http.get<PaymentRecordSummary>(
      `${this.basePath}/${projectBucketId}/commitments`
    );
  }

  /**
   * Reads what has already been reported and hands it back as a position:
   * what can be claimed, what is waiting on the Bank, and what is stuck and
   * why. There is no dedicated endpoint for this -- it adds no data of its
   * own, so it is built by re-reading the same commitments, payments and
   * statements the rest of the module already fetches, not by asking the
   * back end for a new shape.
   */
  getSituation(projectBucketId: string): Observable<ExecutorSituation> {
    return this.getSummary(projectBucketId).pipe(
      switchMap((summary) => {
        const commitments = summary.commitments ?? [];

        const details$ = commitments.length
          ? forkJoin(commitments.map((c) => this.getCommitment(c.id)))
          : of([] as CommitmentDetail[]);

        const payments$ = commitments.length
          ? forkJoin(commitments.map((c) => this.getPayments(c.id)))
          : of([] as CommitmentPaymentsResponse[]);

        // A statement never being reachable should not stop the rest of the
        // position from showing -- the cycle measure that depends on it just
        // falls back to zero instead of taking the whole screen down.
        const previousStatements$ = this.getPreviousStatements(
          projectBucketId
        ).pipe(catchError(() => of([] as PreviousStatement[])));

        // No draft in progress is the ordinary case, not an error worth
        // failing the rest of the position over -- the back end answers it
        // as a 404, so an empty set is what "nothing to exclude" looks like.
        const draftPaymentIds$ = this.getCurrentStatementDraft(
          projectBucketId
        ).pipe(
          switchMap((draft) => this.draftPaymentIds(projectBucketId, draft)),
          catchError(() => of(new Set<string>()))
        );

        return forkJoin({
          details: details$,
          payments: payments$,
          previousStatements: previousStatements$,
          draftPaymentIds: draftPaymentIds$,
        }).pipe(
          map(({ details, payments, previousStatements, draftPaymentIds }) =>
            buildExecutorSituation(
              summary,
              details,
              payments,
              previousStatements,
              draftPaymentIds
            )
          )
        );
      })
    );
  }

  /**
   * Every payment id a statement draft already holds, whichever shape it
   * takes: picked by hand for a direct payment (`draft.payments` already has
   * them), or grouped by component for the rest -- where the draft itself
   * only carries a count per row, and the actual ids only come out once each
   * component is opened, so this opens all of them.
   */
  private draftPaymentIds(
    projectBucketId: string,
    draft: StatementDraft
  ): Observable<Set<string>> {
    if (draft?.payments?.length) {
      return of(new Set(draft.payments.map((payment) => payment.id)));
    }

    const rows = draft?.rows ?? [];
    if (!rows.length) {
      return of(new Set<string>());
    }

    return forkJoin(
      rows.map((row) =>
        this.getStatementComponent(projectBucketId, row.componentCode)
      )
    ).pipe(
      map((components) => {
        const ids = new Set<string>();
        components.forEach((component) =>
          component.selectedPaymentIds?.forEach((id) => ids.add(id))
        );
        return ids;
      }),
      catchError(() => of(new Set<string>()))
    );
  }

  getCommitment(commitmentId: string): Observable<CommitmentDetail> {
    return this.http.get<CommitmentDetail>(
      `${this.basePath}/commitments/${encodeURIComponent(commitmentId)}`
    );
  }

  getPayments(commitmentId: string): Observable<CommitmentPaymentsResponse> {
    return this.http.get<CommitmentPaymentsResponse>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payments`
    );
  }

  /** Payment schedule rows the user can pull into the report. */
  getPlannedPayments(commitmentId: string): Observable<PlannedPayment[]> {
    return this.http.get<PlannedPayment[]>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/planned-payments`
    );
  }

  addPayments(
    commitmentId: string,
    payments: PlannedPayment[]
  ): Observable<CommitmentPaymentsResponse> {
    return this.http.post<CommitmentPaymentsResponse>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payments`,
      { payments }
    );
  }

  updatePayment(
    payment: CommitmentPayment
  ): Observable<CommitmentPaymentsResponse> {
    return this.http.put<CommitmentPaymentsResponse>(
      `${this.basePath}/payments/${encodeURIComponent(payment.id)}`,
      payment
    );
  }

  deletePayment(paymentId: string): Observable<CommitmentPaymentsResponse> {
    return this.http.delete<CommitmentPaymentsResponse>(
      `${this.basePath}/payments/${encodeURIComponent(paymentId)}`
    );
  }

  /** Registers one payment typed by hand. */
  addManualPayment(
    commitmentId: string,
    payment: ManualPaymentRequest
  ): Observable<CommitmentPaymentsResponse> {
    return this.http.post<CommitmentPaymentsResponse>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payments/manual`,
      payment
    );
  }

  /**
   * Reports the accumulated financial progress of the contract as a lump sum
   * per component, for agencies that will not enter payment by payment.
   */
  addAccumulatedPayment(
    commitmentId: string,
    request: AccumulatedPaymentRequest
  ): Observable<CommitmentPaymentsResponse> {
    return this.http.post<CommitmentPaymentsResponse>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payments/accumulated`,
      request
    );
  }

  /** How much room is left in each currency of the contract. */
  getCurrencyCeilings(
    commitmentId: string
  ): Observable<CurrencyCeiling[]> {
    return this.http.get<CurrencyCeiling[]>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/currency-ceilings`
    );
  }

  /** Blank spreadsheet with the expected columns and their validations. */
  downloadImportTemplate(commitmentId: string): Observable<Blob> {
    return this.http.get(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payments/import/template`,
      { responseType: 'blob' }
    );
  }

  /**
   * Uploads the filled spreadsheet. The back end parses and validates it and
   * answers with the rows, the duplicates and the blocking errors.
   *
   * The body must travel as multipart, so it opts out of the base64 encoding
   * `EncodeInterceptor` applies to every other POST.
   */
  importPayments(
    commitmentId: string,
    file: File
  ): Observable<ImportValidationResult> {
    const body = new FormData();
    body.append('file', file, file.name);

    return this.http.post<ImportValidationResult>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payments/import`,
      body,
      { context: new HttpContext().set(REQUEST_IS_ENCODED, false) }
    );
  }

  /** Registers the rows the user kept from the imported file. */
  confirmImportedPayments(
    commitmentId: string,
    rowNumbers: number[]
  ): Observable<CommitmentPaymentsResponse> {
    return this.http.post<CommitmentPaymentsResponse>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payments/import/confirm`,
      { rowNumbers }
    );
  }

  /** Amounts already reported on the commitment, by source of funds. */
  getFundingTotals(
    commitmentId: string
  ): Observable<CommitmentFundingTotals> {
    return this.http.get<CommitmentFundingTotals>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/funding-totals`
    );
  }

  /**
   * Reclassifies how the selected payments were funded, which is what decides
   * whether they can travel in a reimbursement or in a justification.
   */
  savePaymentMechanism(
    commitmentId: string,
    request: PaymentMechanismRequest
  ): Observable<CommitmentPaymentsResponse> {
    return this.http.put<CommitmentPaymentsResponse>(
      `${this.basePath}/commitments/${encodeURIComponent(
        commitmentId
      )}/payment-mechanism`,
      request
    );
  }

  /** Components and outputs of the loan, used to charge each payment. */
  getComponents(projectBucketId: string): Observable<ProjectComponent[]> {
    return this.http.get<ProjectComponent[]>(
      `${this.basePath}/${projectBucketId}/components`
    );
  }

  /**
   * Payments that may enter a statement of expenditures: reported as paid,
   * inside the date range, not yet justified nor already carried by another
   * statement, and matching the reimbursement classification of the type.
   */
  getStatementCandidates(
    projectBucketId: string,
    transactionType: ExpenditureStatementType,
    dateFrom: string,
    dateTo: string
  ): Observable<StatementCandidates> {
    const params = new HttpParams()
      .set('transactionType', transactionType)
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);

    return this.http.get<StatementCandidates>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/candidates`,
      { params }
    );
  }

  /**
   * Builds the statement for a type and a period: the amounts by component,
   * broken down by source of funds, with the balance each component is left
   * with once the Bank approves it.
   */
  getStatementDraft(
    projectBucketId: string,
    transactionType: ExpenditureStatementType,
    dateFrom: string,
    dateTo: string
  ): Observable<StatementDraft> {
    const params = new HttpParams()
      .set('transactionType', transactionType)
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);

    return this.http.get<StatementDraft>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/draft`,
      { params }
    );
  }

  /**
   * The statement in progress, if there is one. Used to pick it back up after
   * the user came out of the detail of a component.
   */
  getCurrentStatementDraft(
    projectBucketId: string
  ): Observable<StatementDraft> {
    return this.http.get<StatementDraft>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/draft/current`
    );
  }

  /**
   * Direct payments are chosen by hand: nothing has been paid yet, so there is
   * no date range to sweep.
   */
  setStatementPayments(
    projectBucketId: string,
    transactionType: ExpenditureStatementType,
    paymentIds: string[]
  ): Observable<StatementDraft> {
    return this.http.post<StatementDraft>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/draft/payments`,
      { transactionType, paymentIds }
    );
  }

  /** The payments charged to one component, so the user can drop some. */
  getStatementComponent(
    projectBucketId: string,
    componentCode: string
  ): Observable<StatementComponentDetail> {
    return this.http.get<StatementComponentDetail>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/draft/components/${encodeURIComponent(
        componentCode
      )}`
    );
  }

  /** Keeps the payments the user left ticked and recalculates the totals. */
  saveStatementComponent(
    projectBucketId: string,
    componentCode: string,
    paymentIds: string[]
  ): Observable<StatementDraft> {
    return this.http.put<StatementDraft>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/draft/components/${encodeURIComponent(
        componentCode
      )}`,
      { paymentIds }
    );
  }

  /** Saves the statement without sending it, so it can be picked up later. */
  saveStatementDraft(projectBucketId: string): Observable<StatementDraft> {
    return this.http.put<StatementDraft>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/draft`,
      {}
    );
  }

  /**
   * Payments of the loan a direct payment may point at. Unlike the other
   * types, these have not been paid yet: the Bank is the one who will pay.
   */
  getPickablePayments(
    projectBucketId: string
  ): Observable<CommitmentPayment[]> {
    return this.http.get<CommitmentPayment[]>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/pickable`
    );
  }

  /** Statements already generated, for the "previous" tab. */
  getPreviousStatements(
    projectBucketId: string
  ): Observable<PreviousStatement[]> {
    return this.http.get<PreviousStatement[]>(
      `${this.basePath}/${projectBucketId}/expenditure-statements`
    );
  }

  /** Every payment the draft carries, used to build the spreadsheet. */
  getStatementPayments(
    projectBucketId: string
  ): Observable<StatementComponentDetail[]> {
    return this.http.get<StatementComponentDetail[]>(
      `${this.basePath}/${projectBucketId}/expenditure-statements/draft/payments`
    );
  }

  /** Creates the transaction that carries the selected payments. */
  generateStatement(
    projectBucketId: string,
    request: GenerateStatementRequest
  ): Observable<GeneratedStatement> {
    return this.http.post<GeneratedStatement>(
      `${this.basePath}/${projectBucketId}/expenditure-statements`,
      request
    );
  }

  getExchangeRates(projectBucketId: string): Observable<ExchangeRateSettings> {
    return this.http.get<ExchangeRateSettings>(
      `${this.basePath}/${projectBucketId}/exchange-rates`
    );
  }

  /**
   * Every payment of the loan a new rate could apply to -- every commitment,
   * never a `JUSTIFIED` one: once the Bank has approved the statement that
   * carries it, the amount is final and a later rate change cannot reopen it.
   */
  getExchangeRatePayments(
    projectBucketId: string
  ): Observable<ExchangeRatePayment[]> {
    return this.http.get<ExchangeRatePayment[]>(
      `${this.basePath}/${projectBucketId}/exchange-rate-payments`
    );
  }

  /** Saving rates recalculates the equivalent amount of `paymentIds` only. */
  saveExchangeRates(
    projectBucketId: string,
    rates: PaymentExchangeRate[],
    paymentIds: string[]
  ): Observable<ExchangeRateSettings> {
    return this.http.put<ExchangeRateSettings>(
      `${this.basePath}/${projectBucketId}/exchange-rates`,
      { rates, paymentIds }
    );
  }
}
