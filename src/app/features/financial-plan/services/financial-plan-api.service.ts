import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import {
  ActiveFinancialPlan,
  AniRequestDraft,
  EstimatedDisbursement,
  FinancialPlanComponentDetail,
  FinancialPlanComponentOption,
  FinancialPlanDraft,
  FinancialPlanExchangeRate,
  FinancialPlanJustificationSummary,
  FinancialPlanPeriod,
  FinancialPlanSimulation,
  PotentialProcess,
} from '../models/financial-plan.model';

@Injectable({ providedIn: 'root' })
export class FinancialPlanApiService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/v3/financial-plans`;

  constructor(private readonly http: HttpClient) {}

  getActivePlan(projectBucketId: string): Observable<ActiveFinancialPlan> {
    return this.http.get<ActiveFinancialPlan>(
      `${this.basePath}/${projectBucketId}/active`
    );
  }

  getPreviousPlans(projectBucketId: string): Observable<ActiveFinancialPlan[]> {
    return this.http.get<ActiveFinancialPlan[]>(
      `${this.basePath}/${projectBucketId}/previous`
    );
  }

  requestAni(
    projectBucketId: string,
    draft: AniRequestDraft
  ): Observable<{ plan: ActiveFinancialPlan; aniAmount: number; aniMonthIndex: number }> {
    return this.http.post<{
      plan: ActiveFinancialPlan;
      aniAmount: number;
      aniMonthIndex: number;
    }>(`${this.basePath}/${projectBucketId}/ani`, draft);
  }

  getComponentDetail(
    projectBucketId: string,
    componentCode: string
  ): Observable<FinancialPlanComponentDetail> {
    return this.http.get<FinancialPlanComponentDetail>(
      `${this.basePath}/${projectBucketId}/components/${componentCode}`
    );
  }

  getDraft(projectBucketId: string): Observable<FinancialPlanDraft> {
    return this.http.get<FinancialPlanDraft>(`${this.basePath}/${projectBucketId}/draft`);
  }

  saveDraftInformation(
    projectBucketId: string,
    period: FinancialPlanPeriod,
    exchangeRates: FinancialPlanExchangeRate[]
  ): Observable<FinancialPlanDraft> {
    return this.http.put<FinancialPlanDraft>(
      `${this.basePath}/${projectBucketId}/draft/information`,
      { period, exchangeRates }
    );
  }

  getSimulation(projectBucketId: string): Observable<FinancialPlanSimulation> {
    return this.http.get<FinancialPlanSimulation>(
      `${this.basePath}/${projectBucketId}/simulation`
    );
  }

  saveExchangeRates(
    projectBucketId: string,
    exchangeRates: FinancialPlanExchangeRate[]
  ): Observable<{ exchangeRates: FinancialPlanExchangeRate[]; lastUpdatedOn: string }> {
    return this.http.put<{ exchangeRates: FinancialPlanExchangeRate[]; lastUpdatedOn: string }>(
      `${this.basePath}/${projectBucketId}/draft/exchange-rates`,
      { exchangeRates }
    );
  }

  saveComponentSelection(
    projectBucketId: string,
    componentCode: string,
    detail: FinancialPlanComponentDetail
  ): Observable<FinancialPlanComponentDetail> {
    return this.http.put<FinancialPlanComponentDetail>(
      `${this.basePath}/${projectBucketId}/components/${componentCode}`,
      detail
    );
  }

  getComponentOptions(projectBucketId: string): Observable<FinancialPlanComponentOption[]> {
    return this.http.get<FinancialPlanComponentOption[]>(
      `${this.basePath}/${projectBucketId}/components`
    );
  }

  getPotentialProcesses(projectBucketId: string): Observable<PotentialProcess[]> {
    return this.http.get<PotentialProcess[]>(
      `${this.basePath}/${projectBucketId}/potential-processes`
    );
  }

  saveSelectedProcesses(
    projectBucketId: string,
    codes: string[]
  ): Observable<PotentialProcess[]> {
    return this.http.put<PotentialProcess[]>(
      `${this.basePath}/${projectBucketId}/potential-processes/selection`,
      { codes }
    );
  }

  saveEstimatedDisbursement(
    projectBucketId: string,
    code: string,
    disbursement: EstimatedDisbursement
  ): Observable<PotentialProcess> {
    return this.http.put<PotentialProcess>(
      `${this.basePath}/${projectBucketId}/potential-processes/${code}/estimated-disbursement`,
      disbursement
    );
  }

  getJustification(projectBucketId: string): Observable<FinancialPlanJustificationSummary> {
    return this.http.get<FinancialPlanJustificationSummary>(
      `${this.basePath}/${projectBucketId}/simulation/justification`
    );
  }

  confirmSimulation(projectBucketId: string): Observable<ActiveFinancialPlan> {
    return this.http.post<ActiveFinancialPlan>(
      `${this.basePath}/${projectBucketId}/simulation/confirm`,
      {}
    );
  }
}
