import { inject, Injectable } from '@angular/core';
import {
  BiddingContractByProcess,
  Currency,
  DialogResponse,
  ErrorResponse,
  FiduciaryProcessDocument,
  ModalOptions,
  Project,
  ProjectTask,
  ProjectTaskResponse,
} from '@core/models';
import { CommonApiService, ProjectsApiService } from '@core/services/apis';
import { BiddingContractApiService } from '@core/services/apis/fiduciary-process-api/bidding-contracts-api/bidding-contracts-api.service';
import {
  BiddingContractsStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import {
  DialogReturn,
  ModalService,
} from '@fiduciary-interface/app/shared/services/modal.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { filter, map, mergeMap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContractsService {
  private readonly fiModalSvc = inject(ModalService);
  private readonly binddingContractsApi = inject(BiddingContractApiService);
  private readonly translate = inject(TranslateService);
  private readonly notificationGlobalService = inject(
    NotificationGlobalService
  );
  private readonly store = inject(BiddingContractsStoreService);
  private readonly commonApiSvc = inject(CommonApiService);
  private readonly projectSvc = inject(ProjectsApiService);
  private readonly projectStoreSvc = inject(ProjectStoreService);

  private documentsSubject = new BehaviorSubject<FiduciaryProcessDocument[]>(
    []
  );
  public documentsToUpload$: Observable<FiduciaryProcessDocument[]> =
    this.documentsSubject.asObservable();

  setDocumentsToUpload(docs: FiduciaryProcessDocument[]) {
    this.documentsSubject.next(docs);
  }

  private readonly modalTerminateTitle =
    'CONTRACT.MODAL_TERMINATE_CONTRACT.TITLE';
  private readonly modalCompleteTitle =
    'CONTRACT.MODAL_COMPLETE_CONTRACT.TITLE';
  private readonly modalDeleteTitle = 'CONTRACT.MODAL_DELETE_CONTRACT.TITLE';

  terminateContractModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      this.modalTerminateTitle,
      [
        { text: 'CONTRACT.MODAL_TERMINATE_CONTRACT.CANCEL' },
        {
          text: 'CONTRACT.MODAL_TERMINATE_CONTRACT.TERMINATE_CONTRACT',
          cssClass: 'k-primary',
        },
      ],
      [{ key: 'CONTRACT.MODAL_TERMINATE_CONTRACT.CONTENT1', bold: false }]
    );
  }

  hasExistingContracts(): boolean {
    return true;
  }

  completeContractModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      this.modalCompleteTitle,
      [
        { text: 'CONTRACT.MODAL_COMPLETE_CONTRACT.CANCEL' },
        {
          text: 'CONTRACT.MODAL_COMPLETE_CONTRACT.COMPLETE_CONTRACT',
          cssClass: 'k-primary',
        },
      ],
      [{ key: 'CONTRACT.MODAL_COMPLETE_CONTRACT.CONTENT1', bold: false }]
    );
  }

  public terminateContract(
    contractId: string,
    lang: string
  ): Observable<string | ErrorResponse> {
    return this.binddingContractsApi.terminateContract(contractId, lang);
  }

  terminateToastSuccess() {
    const message = this.translate.instant('CONTRACT.TERMINATE_SUCCESS_TOAST');
    this.notificationGlobalService.showSuccess(message, 'right', 'top', 7000);
  }

  deleteToastSuccess() {
    const message = this.translate.instant('CONTRACT.DELETE_SUCCESS_TOAST');
    this.notificationGlobalService.showSuccess(message, 'right', 'top', 7000);
  }

  deleteContractModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      this.modalDeleteTitle,
      [
        { text: 'CONTRACT.MODAL_DELETE_CONTRACT.CANCEL' },
        {
          text: 'CONTRACT.MODAL_DELETE_CONTRACT.DELETE_CONTRACT',
          cssClass: 'k-primary',
        },
      ],
      [{ key: 'CONTRACT.MODAL_DELETE_CONTRACT.CONTENT1', bold: false }]
    );
  }

  public deleteContract(
    contractId: string
  ): Observable<string | ErrorResponse> {
    return this.binddingContractsApi.deleteContract(contractId);
  }

  public deleteErrorMessage() {
    const message = this.translate.instant('CONTRACT.DELETE_ERROR_TOAST');
    this.notificationGlobalService.showError(message, 'right', 'top', 7000);
  }

  public terminateErrorMessage() {
    const message = this.translate.instant('CONTRACT.TERMINATE_ERROR_TOAST');
    this.notificationGlobalService.showError(message, 'right', 'top', 7000);
  }

  terminateContractLogic(
    contract: BiddingContractByProcess,
    procurementProcessId: string,
    lang: string
  ) {
    this.terminateContractModal().subscribe((data: DialogResponse) => {
      if (data.result === ModalOptions.ACCEPT) {
        this.store.terminateContractAction(
          procurementProcessId,
          contract.biddingContractId,
          lang
        );
      }
    });
  }

  completeContractLogic(
    contract: BiddingContractByProcess,
    procurementProcessId: string,
    lang: string
  ) {
    this.completeContractModal().subscribe((data: DialogResponse) => {
      if (data.result === ModalOptions.ACCEPT) {
        this.store.completeContractAction(
          procurementProcessId,
          contract.biddingContractId,
          lang
        );
      }
    });
  }

  deleteContractLogic(
    biddingContractId: string,
    procurementProcessId: string,
    isCopy: boolean
  ) {
    this.deleteContractModal().subscribe((data: DialogResponse) => {
      if (data.result === ModalOptions.ACCEPT) {
        this.store.deleteContractAction(
          procurementProcessId,
          biddingContractId,
          isCopy
        );
      }
    });
  }

  deleteContractLogic$(biddingContractId: string) {
    return this.deleteContractModal().pipe(
      mergeMap((data: DialogResponse) => {
        if (data.result === ModalOptions.ACCEPT) {
          return this.binddingContractsApi.deleteContract(biddingContractId);
        } else {
          return throwError(new Error('Cancel'));
        }
      })
    );
  }

  /**
   * Preloads all required data contracts for the selected project.
   * Returns an observable with currencies and project components.
   */
  preloadAllDataContracts(): Observable<{
    project: Project;
    currencies: Currency[];
    components: ProjectTask[];
  }> {
    return this.projectStoreSvc.selectedProject().pipe(
      filter((sp) => Boolean(sp && sp.selectedProject)),
      map((r) => r.selectedProject),
      switchMap((data) => {
        return forkJoin({
          project: of(data),
          currencies: this.commonApiSvc
            .getCurrencies()
            .pipe(filter((res): res is Currency[] => Array.isArray(res))),
          components: this.projectSvc
            .getProjectTasks(data.id, 1)
            .pipe(map((pt: ProjectTaskResponse) => pt.projectTasks)),
        });
      })
    );
  }

  preloadSecondStep() {
    return this.projectStoreSvc.selectedProject().pipe(
      filter((sp) => Boolean(sp && sp.selectedProject)),
      map((r) => r.selectedProject.id),
      switchMap(() => {
        return forkJoin({
          currencies: this.commonApiSvc
            .getCurrencies()
            .pipe(filter((res): res is Currency[] => Array.isArray(res))),
        });
      })
    );
  }
}
