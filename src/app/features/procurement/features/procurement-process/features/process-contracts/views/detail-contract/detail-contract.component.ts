import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ModeEnum,
  BiddingContractStatusesEnum,
  PermissionEnum,
  BiddingProcessPlanStatus,
} from '@core/enums';
import {
  BiddingContractDetail,
  DialogResponse,
  ModalOptions,
} from '@core/models';
import { BiddingContractApiService } from '@core/services/apis';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import {
  BiddingContractsStoreService,
  BiddingProcessPlanStoreService,
} from '@core/services/store-services';
import { AppStateWithUsrPreferences } from '@core/store';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { createContractsForm } from '../../components/contracts-form/contracts-form.form';
import { ContractsService } from '../../services/contracts.service';
import { VisibilityService } from '@core/services/view';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
@Component({
  selector: 'fi-detail-contract',
  templateUrl: './detail-contract.component.html',
})
export class DetailContractComponent implements OnInit, OnDestroy {
  private readonly subscription: Subscription = new Subscription();

  form: UntypedFormGroup = createContractsForm();
  formErrorCollection: string[] = [];
  public mode = ModeEnum.READ;
  hasPendingSignatureAmendment: boolean;

  public status: BiddingContractStatusesEnum = null;
  public modeEnum = ModeEnum;
  public statusEnum = BiddingContractStatusesEnum;
  isLoading: boolean;
  isAmendmentLoading: boolean;

  biddingContractId = '';
  procurementProcessId = '';
  visualCode = '';

  showAddAmentment: boolean;

  viewContractFormPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];
  deleteContractButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  terminateContractButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  completeContractButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  selectedLanguage: string;
  planInSync: boolean;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly contractsSvc: ContractsService,
    private readonly visibilitySvc: VisibilityService,
    private readonly router: Router,
    private readonly store: BiddingContractsStoreService,
    private readonly contractFormSvc: ContractFormCompleteService,
    private readonly translate: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly biddingContractApiService: BiddingContractApiService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService
  ) {}

  ngOnInit(): void {
    this.getCurrentLang();
    this.visibilitySvc.breadcrumbService.set(
      '@contractDetail',
      'BREADCRUMB.CONTRACT_DETAIL'
    );
    this.biddingContractId = this.activatedRoute.snapshot.params.contractId;
    this.procurementProcessId = this.activatedRoute.snapshot.params.processId;
    this.isLoading = true;
    this.getContractDetail();

    this.checkAmmendmentButtonVisibility();
    this.checkPlanStatus();
  }

  checkPlanStatus(): void {
    const sub = this.biddingStoreSvc
      .getOrLoadBiddingProcessPlan()
      .pipe(filter((data) => data.biddingPlanState.biddingProcessPlan !== null))
      .pipe(map((data) => data.biddingPlanState.biddingProcessPlan))
      .subscribe((data) => {
        this.planInSync = data.status === BiddingProcessPlanStatus.IN_SYNC;
      });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  combineRequests(): Observable<BiddingContractDetail> {
    const contractDetail = this.contractFormSvc.getContractDetail(
      this.biddingContractId,
      this.procurementProcessId
    );
    const hasPendingSignatureAmendment =
      this.biddingContractApiService.hasContractAmendmentUnderReview(
        this.biddingContractId
      );
    return forkJoin({ contractDetail, hasPendingSignatureAmendment }).pipe(
      map((data) => {
        data.contractDetail.hasPendingSignatureAmendment =
          data.hasPendingSignatureAmendment;
        return data.contractDetail;
      })
    );
  }

  getContractDetail(): void {
    const sub = this.combineRequests()
      .subscribe(
        (response: BiddingContractDetail) => {
          this.contractFormSvc.fillFormData(this.form, response, 'detail');
          this.visualCode = response.visualCode;
          this.status = response.contract.contractStatus;
          this.hasPendingSignatureAmendment =
            response.hasPendingSignatureAmendment;
        },
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      )
      .add(() => (this.isLoading = false));
    this.subscription.add(sub);
  }

  deleteContract(): void {
    const sub = this.contractsSvc
      .deleteContractLogic$(this.biddingContractId)
      .subscribe(
        () => {
          const message = this.translate.instant(
            'CONTRACT.DELETE_SUCCESS_TOAST'
          );
          this.notificationGlobalService.showSuccess(
            message,
            'right',
            'top',
            7000
          );
          this.navigateToContractsList();
        },
        () => {}
      );
    this.subscription.add(sub);
  }

  terminateContract(): void {
    const sub = this.contractsSvc
      .terminateContractModal()
      .subscribe((data: DialogResponse) => {
        if (data.result === ModalOptions.ACCEPT) {
          this.store.terminateContractAction(
            this.procurementProcessId,
            this.biddingContractId,
            this.selectedLanguage
          );
          this.navigateToContractsList();
        }
      });
    this.subscription.add(sub);
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.subscription.add(sub);
  }

  completeContract(): void {
    const sub = this.contractsSvc
      .completeContractModal()
      .subscribe((data: DialogResponse) => {
        if (data.result === ModalOptions.ACCEPT) {
          this.store.completeContractAction(
            this.procurementProcessId,
            this.biddingContractId,
            this.selectedLanguage
          );
          this.navigateToContractsList();
        }
      });

    this.subscription.add(sub);
  }

  navigateToContractsList(): void {
    this.router.navigate(['../../'], {
      relativeTo: this.activatedRoute,
    });
  }

  checkAmmendmentButtonVisibility(): void {
    this.isAmendmentLoading = true;
    this.biddingContractApiService
      .getAmendmentsLast(this.biddingContractId)
      .subscribe((data) => {
        if (
          data.status === BiddingContractStatusesEnum.PENDING_SIGNATURE ||
          data.status === BiddingContractStatusesEnum.AMENDMENT_UNDER_REV ||
          data.status === BiddingContractStatusesEnum.AMENDMENT_REVIEWED
        ) {
          this.showAddAmentment = false;
        } else {
          this.showAddAmentment = true;
        }
      })
      .add(() => (this.isAmendmentLoading = false));
  }
}
