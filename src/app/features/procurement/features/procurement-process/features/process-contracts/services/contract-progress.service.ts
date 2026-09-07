import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import {
  BiddingContractApiService,
  GeneralProcurementDocumentsApiService,
} from '@core/services/apis';
import { DocumentDomain } from '@core/enums';

export interface ContractProgress {
  contractExists: boolean;
  hasPaymentSchedule: boolean;
  hasDocuments: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ContractProgressService {
  private readonly contractApiSvc = inject(BiddingContractApiService);
  private readonly documentsApi = inject(GeneralProcurementDocumentsApiService);

  // Cache simple
  private progressCache = new Map<string, Observable<ContractProgress>>();

  getProgress(
    contractId: string,
    forceRefresh = false
  ): Observable<ContractProgress> {
    if (forceRefresh && this.progressCache.has(contractId)) {
      this.progressCache.delete(contractId);
    }

    if (this.progressCache.has(contractId)) {
      return this.progressCache.get(contractId)!;
    }

    const progress$ = forkJoin({
      contract: this.contractApiSvc.getContractByIdV2(contractId).pipe(
        map(() => true),
        catchError(() => of(false))
      ),
      paymentSchedule: this.contractApiSvc.getPaymentSchedule(contractId).pipe(
        map((schedule) => schedule && schedule.length > 0),
        catchError(() => of(false))
      ),
      documents: this.documentsApi
        .getGroups(DocumentDomain.BIDDINGCONTRACTDOCUMENTGROUP, contractId)
        .pipe(
          map(
            (groups) =>
              groups &&
              groups.length > 0 &&
              groups.some(
                (g) =>
                  g.fiduciaryProcessDocuments &&
                  g.fiduciaryProcessDocuments.length > 0
              )
          ),
          catchError(() => of(false))
        ),
    }).pipe(
      map(({ contract, paymentSchedule, documents }) => ({
        contractExists: contract,
        hasPaymentSchedule: paymentSchedule,
        hasDocuments: documents,
      })),
      shareReplay(1)
    );

    this.progressCache.set(contractId, progress$);
    return progress$;
  }

  invalidateCache(contractId: string): void {
    this.progressCache.delete(contractId);
  }

  canAccessStep(stepIndex: number, progress: ContractProgress): boolean {
    switch (stepIndex) {
      case 0:
        return true;
      case 1:
        return progress.contractExists;
      case 2:
        return progress.contractExists;
      case 3:
        return progress.contractExists && progress.hasDocuments;
      default:
        return false;
    }
  }
}
