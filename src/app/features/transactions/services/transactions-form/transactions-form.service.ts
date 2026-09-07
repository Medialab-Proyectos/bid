import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs/operators';
import { FiTransactionsApiService } from '../fi-transactions-api/fi-transactions-api.service';
import { ProjectStoreService } from '@core/services/store-services';
import { SelectedProjectState } from '@core/store';
import { Currency, Project } from '@core/models';
import { CommonApiService } from '@core/services/apis';
import { TranslateService } from '@ngx-translate/core';
import { Totals } from '../../components/transaction-components/transaction-components.form';
import { FileSaverService } from 'ngx-filesaver';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  AvailableNumbers,
  Beneficiary,
  ExecutorBeneficiaries,
  GetTransactionComponentsResponse,
  RequestAndPartNumberValid,
  TransactionComponent,
  TransactionsCardsResponse,
} from '../../models';
import { TransactionsStatus, TransactionsTypes } from '../../enums';
import { HttpResponse } from '@angular/common/http';
import {
  LanguagesCode,
  WorkflowCommentStatusEnum,
  WorkflowEntityScreen,
  WorkflowIdEntityType,
  WorkflowModuleEnum,
} from '@core/enums';
import {
  WorkflowSharedService,
  WorkflowTransactionService,
} from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { UntypedFormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class TransactionsFormService {
  constructor(
    readonly workflowTransactionSvc: WorkflowTransactionService,
    readonly notificationService: NotificationGlobalService,
    readonly workflowSharedSvc: WorkflowSharedService,
    readonly projectStoreService: ProjectStoreService,
    readonly transactionsApi: FiTransactionsApiService,
    readonly fileSaverService: FileSaverService,
    readonly translate: TranslateService,
    readonly commonApi: CommonApiService
  ) {}

  contract: string;
  currentLanguage: string;
  pdfExtension = 'pdf';

  getApprovedCurrency(): Observable<string> {
    return this.projectStoreService.selectedProject().pipe(
      filter((res: SelectedProjectState) => res.selectedProject !== null),
      switchMap((res) => {
        this.contract = res.selectedProject.contract;
        return this.transactionsApi
          .getApprovedCurrency(res.selectedProject.projectBucketId)
          .pipe(map((approvedCurrency: string) => approvedCurrency));
      })
    );
  }

  loadCurrencies(): Observable<Currency[]> {
    return this.commonApi
      .getCurrencies()
      .pipe(map((currencies: Currency[]) => currencies));
  }

  sortComponentsByCodeAsc(
    components: TransactionComponent[]
  ): TransactionComponent[] {
    return components.sort((a, b) => {
      let aux = 0;
      if (a.code < b.code) {
        aux = -1;
      } else if (a.code > b.code) {
        aux = 1;
      }
      return aux;
    });
  }

  getComponentTotals(components: TransactionComponent[]): Totals {
    const totals: Totals = {
      amountsDistribute: {
        distributeCofinancing: 0,
        distributeIbd: 0,
        distributeLocalCounterpart: 0,
      },
      amountsProjectedAvailable: {
        distributeCofinancing: 0,
        distributeIbd: 0,
        distributeLocalCounterpart: 0,
      },
    };
    for (const component of components) {
      totals.amountsDistribute.distributeIbd +=
        component.amountsDistribute.distributeIbd;
      totals.amountsDistribute.distributeCofinancing +=
        component.amountsDistribute.distributeCofinancing;
      totals.amountsDistribute.distributeLocalCounterpart +=
        component.amountsDistribute.distributeLocalCounterpart;

      totals.amountsProjectedAvailable.distributeIbd +=
        component.amountsProjectedAvailable.distributeIbd;
      totals.amountsProjectedAvailable.distributeCofinancing +=
        component.amountsProjectedAvailable.distributeCofinancing;
      totals.amountsProjectedAvailable.distributeLocalCounterpart +=
        component.amountsProjectedAvailable.distributeLocalCounterpart;
    }
    return totals;
  }

  showErrorToast(msg: string): void {
    const message = this.translate.instant(msg);
    this.notificationService.showError(message);
  }

  showSuccessToast(msg: string): void {
    const message = this.translate.instant(msg);
    this.notificationService.showSuccess(message);
  }

  showTransacctionSuccessToast(
    msg: string,
    transactionType: TransactionsTypes,
    transactionNumber: string
  ): void {
    const message = this.translate.instant(msg, {
      transactionType,
      transactionNumber,
    });
    this.notificationService.showSuccess(message);
  }

  exportToPdf(
    transactionId: number,
    transactionNumber: string,
    transactionType: TransactionsTypes,
    requestNumber: number[]
  ): Observable<HttpResponse<ArrayBuffer>> {
    return this.transactionsApi.getActionReport(transactionId).pipe(
      tap((data: HttpResponse<ArrayBuffer>) => {
        const contentType = data.headers.get('Content-Type');
        const translateTitle = this.translate.instant(
          'TRANSACTION.DISBURSEMENT_FORM'
        );
        this.fileSaverService.save(
          new Blob([new Uint8Array(data.body).buffer], {
            type: contentType,
          }),
          requestNumber.length == 1
            ? `${transactionNumber.substring(2)} ${
                this.contract
              }-${translateTitle} -${transactionType} ${requestNumber}${this.handlePdfExtension(
                contentType
              )}`
            : `${transactionNumber.substring(2)} ${
                this.contract
              }-${translateTitle} -${transactionType} ${requestNumber[0]} - ${
                requestNumber[1]
              }${this.handlePdfExtension(contentType)}`
        );
      })
    );
  }

  handlePdfExtension(contentType: string) {
    if (contentType.includes(this.pdfExtension)) {
      return '.' + this.pdfExtension;
    }
    return '';
  }

  downloadAudit(
    transactionId: number,
    language: string,
    transactionNumber: string
  ) {
    let documentName: string;
    switch (language) {
      case LanguagesCode.SPANISH:
        documentName = 'Registro_de_Auditoria_';
        break;
      case LanguagesCode.ENGLISH:
        documentName = 'Audit_Trail_';
        break;
      case LanguagesCode.PORTUGUESE:
        documentName = 'trilha_de_auditoria_';
        break;
      case LanguagesCode.FRENCH:
        documentName = "piste_d'audit_";
        break;
      default:
        documentName = 'Audit_Trail_';
        break;
    }
    return this.transactionsApi.getDownloadAudit(transactionId, language).pipe(
      tap((data: HttpResponse<ArrayBuffer>) => {
        this.fileSaverService.save(
          new Blob([new Uint8Array(data.body).buffer], {
            type: data.headers.get('Content-Type'),
          }),
          `${documentName}${transactionNumber}`
        );
      })
    );
  }

  getTransactionComponents$(
    projectBucketId: string,
    transactionType: TransactionsTypes
  ): Observable<GetTransactionComponentsResponse> {
    return this.transactionsApi
      .getTransactionComponents(projectBucketId, transactionType)
      .pipe(map((response: GetTransactionComponentsResponse) => response));
  }

  getBeneficiaries$(projectBucketId: string): Observable<Beneficiary[]> {
    return this.transactionsApi
      .getBeneficiaries(projectBucketId)
      .pipe(map((res: ExecutorBeneficiaries) => res.beneficiaries));
  }

  loadWorkflowActions(
    transactionId: number,
    selectedProject: Project,
    transactionType: TransactionsTypes,
    transactionIdsATJ: number[] = []
  ): Observable<string> {
    if (!transactionId) {
      return of(String());
    }
    return this.workflowTransactionSvc.getTransactionGuid(transactionId).pipe(
      tap((transactionGuid) =>
        this.workflowSharedSvc.loadActions(
          {
            body: {
              entityTypeId: transactionGuid,
              projectBucketId: selectedProject.projectBucketId,
              idEntityType: WorkflowIdEntityType.FINANCIAL_TRANSACTION,
            },
            projectContractId: selectedProject.contract,
            instAcronym: selectedProject.executorAcronym,
          },
          {
            transactionId,
            operationNumber: selectedProject.operationNumber,
            transactionType,
            transactionIdsATJ,
          }
        )
      ),
      catchError(() => {
        this.showErrorToast('TRANSACTION.ERROR_LOAD_WORKFLOW');
        return throwError(String());
      })
    );
  }

  launchWorkflow(
    transactionId: number,
    selectedProject: Project,
    selectedLanguage: string,
    transactionType: TransactionsTypes,
    transactionIdsATJ: number[] = [],
    comment: string
  ): Observable<any> {
    return this.workflowTransactionSvc
      .launch(
        {
          entityTypeId: String(),
          isInternalVisibility: false,
          projectBucketId: selectedProject.projectBucketId,
          instAcronym: selectedProject.executorAcronym,
          businessRulesRequest: {
            factors: {
              workflowSection: WorkflowEntityScreen.FINANCIAL_TRANSACTION,
            },
          },
          workflowComment: {
            text: comment,
            visibility: true,
            status: WorkflowCommentStatusEnum.COMPLETED,
          },
        },
        transactionId,
        selectedProject.operationNumber,
        selectedLanguage,
        WorkflowModuleEnum.ONLINE_DISBURSEMENT,
        transactionType,
        transactionIdsATJ
      )
      .pipe(
        mergeMap((_) =>
          this.transactionsApi.generateAndSaveActionReport(transactionId).pipe(
            catchError((error) => {
              this.showErrorToast(
                'WORKFLOW.TOAST.GENERATE_SAVE_ACTION_REPORT.ERROR'
              );
              return throwError(error);
            })
          )
        ),
        catchError((_) => {
          this.showErrorToast('WORKFLOW.TOAST.LAUNCH.ERROR');
          return throwError(String());
        }),
        tap((_) => this.showSuccessToast('TRANSACTION.SUCCESS_LAUNCH_WORKFLOW'))
      );
  }

  checkPartNumbers(
    projectBucketId: string,
    requestNumber: number,
    partNumber: number,
    transactionId: number,
    formGroup: UntypedFormGroup,
    formControl: string
  ): Observable<RequestAndPartNumberValid> {
    return this.transactionsApi
      .transactionsPartRequestNumbervalidate(
        projectBucketId,
        requestNumber,
        partNumber,
        transactionId
      )
      .pipe(
        catchError((_) => {
          this.showErrorToast('TRANSACTION.ERRORS.PART_NUMBER_ERROR');
          return throwError(String());
        }),
        tap((data: RequestAndPartNumberValid) => {
          if (!data.requestAndPartNumberValid) {
            formGroup.get(formControl).setErrors({ invalidPartNumber: true });
          }
        })
      );
  }

  isExportToPdfVisible(transactionStatusId: TransactionsStatus): boolean {
    return (
      transactionStatusId === TransactionsStatus.EDRAFT ||
      transactionStatusId === TransactionsStatus.EPREV ||
      transactionStatusId === TransactionsStatus.EPVAL ||
      transactionStatusId === TransactionsStatus.EPAUT ||
      transactionStatusId === TransactionsStatus.EREJECT ||
      transactionStatusId === TransactionsStatus.EPENDINGAUTHONE ||
      transactionStatusId === TransactionsStatus.ERETURNED ||
      transactionStatusId === TransactionsStatus.ERETURNEDBYIDB
    );
  }

  areReqPartNumberOcupied(
    numbers: number[],
    formControlValue: number
  ): boolean {
    return numbers && numbers.length > 0
      ? numbers.includes(formControlValue)
      : false;
  }

  availableRequestAndPartNumber(
    projectBucketId: string
  ): Observable<AvailableNumbers> {
    return this.transactionsApi
      .availableRequestAndPartNumber(projectBucketId)
      .pipe(
        catchError((_) => {
          this.showErrorToast('TRANSACTION.LOAD_INFO_ERROR');
          return throwError(String());
        })
      );
  }

  canActivateTransaction(
    projectBucketId: string,
    transactionType: TransactionsTypes
  ) {
    let canActivate = false;
    let errorMsg = '';
    return this.transactionsApi
      .getProjectTransactionTypes(projectBucketId)
      .pipe(
        map((res: TransactionsCardsResponse) => {
          res.transactionsType.forEach((transaction) => {
            if (
              transactionType === transaction.type &&
              !transaction.errorMessage
            ) {
              canActivate = true;
            } else if (transactionType === transaction.type) {
              errorMsg = transaction.errorMessage;
            }
          });

          return { canActivate, errorMsg };
        })
      );
  }
}
