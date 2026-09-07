import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import {
  AppStateWithCurrencies,
  BiddingProcessPlanState,
  SelectedProjectState,
} from '@core/store';
import * as currenciesActions from '@core/store/currencies/actions/currencies.actions';
import { BiddingContractApiService } from '@core/services/apis';
import {
  BiddingContractsStoreService,
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { VisibilityService } from '@core/services/view';
import { createAddAmendmentForm } from '../../components/add-amendment-form/add-amendment-form.form';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import {
  BiddingContractByProcess,
  BiddingContractResponse,
  BiddingProcessProcurementProcess,
  Currency,
} from '@core/models';
import {
  BiddingContractStatusesEnum,
  BiddingProcessPlanStatus,
  ModeAmendmentEnum,
  PermissionEnum,
} from '@core/enums';
import { AmendmentLastResponse } from '@core/models/responses/amendments-response.model';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { filter } from 'rxjs/operators';
import { FillFormService } from '../../services/fill-form.service';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';

@Component({
  templateUrl: './add-amendment.component.html',
})
export class AddAmendmentComponent implements OnInit, OnDestroy {
  readonly subscriptions = new Subscription();

  form: UntypedFormGroup = createAddAmendmentForm();

  originalContract: BiddingContractResponse;
  mode: string = this.activatedRoute.snapshot.params.mode;
  processId: string = this.activatedRoute.snapshot.params.processId;
  contractId: string = this.activatedRoute.snapshot.params.contractId;
  amendmentRouteId: string = this.activatedRoute.snapshot.params.amendmentId;
  projectBucketId: string;
  instAcronym: string;
  projectContractId: string;
  visualCode: string;
  procurementProcess: BiddingProcessProcurementProcess;
  amendment: AmendmentLastResponse = {
    id: '',
    version: 0,
    name: '',
    status: 0,
    object: '',
    signatureDate: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    idbAmount: 0,
    localCounterpartAmount: 0,
    cofinancedAmount: 0,
    controlNumber: '',
    contractType: 0,
    hasAdvancedPayment: true,
    conflictResolutionMethod: 0,
    applicableLaw: '',
    liquidatedDamage: {
      liquidatedDamagePercentage: 0,
      liquidatedDamageMaximumPercentage: 0,
      liquidatedDamagePaymentFrecuency: 0,
      liquidatedDamageType: 0,
    },
    bonus: {
      bonusPercentage: 0,
      bonusMaximumPercentage: 0,
      bonusPaymentFrecuency: 0,
      bonusType: 0,
    },
    currencies: [
      {
        currency: '',
        totalAmount: 0,
        usdEquivalentAmount: 0,
        id: '',
      },
    ],
    biddingContractLots: [
      {
        name: '',
        units: 0,
        amount: 0,
        id: '',
      },
    ],
    securities: [
      {
        securityType: null,
        currency: '',
        amount: 0,
        usdEquivalentAmount: 0,
        expirationDate: new Date(),
        id: '',
      },
    ],
  };
  currency: Currency;

  contracts: BiddingContractByProcess[];
  selectedContract: BiddingContractByProcess;

  isContractLoading = true;
  isLoading = true;
  showDeleteButton: boolean;
  planInSync: boolean;

  viewAmendmentPermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  deleteButtonPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  constructor(
    private readonly visibilityService: VisibilityService,
    readonly biddingProcessPlanStoreService: BiddingProcessPlanStoreService,
    readonly biddingContractApiService: BiddingContractApiService,
    private readonly activatedRoute: ActivatedRoute,
    readonly router: Router,
    private readonly store: Store<AppStateWithCurrencies>,
    private readonly translate: TranslateService,
    private readonly permissionSvc: PermissionService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    private readonly storeProject: ProjectStoreService,
    readonly biddingContractstore: BiddingContractsStoreService,
    readonly fillAmenmendtForm: FillFormService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard
  ) {}

  ngOnInit(): void {
    this.visibilityService.setVisiblityProcessHeader(false);
    this.visibilityService.breadcrumbService.set(
      '@amendmentDetail',
      'BREADCRUMB.AMENDMENT_DETAIL'
    );
    this.loadProcess();
    this.store.dispatch(currenciesActions.getCurrencies());
    this.getContractByProcess();
    this.checkPermission();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProcess(): void {
    this.biddingProcessPlanStoreService.getBiddingProcessByIdAction(
      this.processId
    );
    this.subscriptions.add(
      combineLatest([
        this.getOrLoadSelectedBiddingProcessById(),
        this.getSelectedProject(),
      ]).subscribe((data) => {
        this.planInSync =
          data[0].biddingProcessPlan?.status ===
          BiddingProcessPlanStatus.IN_SYNC;

        this.procurementProcess =
          data[0].selectedBiddingProcessProcurementProcess;
        this.projectBucketId = data[1].selectedProject.projectBucketId;
        this.projectContractId = data[1].selectedProject.contract;
        this.instAcronym = data[1].selectedProject.executorAcronym;
        this.setCode(this.procurementProcess.code);
        this.loadContracts();
        this.getAmendment();
      })
    );
  }

  private getOrLoadSelectedBiddingProcessById(): Observable<BiddingProcessPlanState> {
    return this.biddingProcessPlanStoreService
      .getOrLoadSelectedBiddingProcessById(this.processId)
      .pipe(
        filter(
          (data: BiddingProcessPlanState) =>
            !!data.selectedBiddingProcessProcurementProcess
        )
      );
  }

  private getSelectedProject(): Observable<SelectedProjectState> {
    return this.storeProject
      .selectedProject()
      .pipe(filter((data: SelectedProjectState) => !!data.selectedProject));
  }

  setCode(code: string): void {
    this.isContractLoading = true;
    this.biddingContractApiService
      .getContractById(this.contractId)
      .subscribe((data: BiddingContractResponse) => {
        this.originalContract = data;
        if (data) {
          if (Number(data.code) < 10) {
            this.visualCode = `${code}-C0${data.code}`;
          } else {
            this.visualCode = `${code}-C${data.code}`;
          }
        }
      })
      .add(() => (this.isContractLoading = false));
  }

  getAmendment(): void {
    switch (this.mode) {
      case ModeAmendmentEnum.READ:
        this.getAmendmentById();
        break;
      case ModeAmendmentEnum.UPDATE:
      case ModeAmendmentEnum.CREATE:
        this.getAmendmentLast();
        break;
      default:
        break;
    }
  }

  getAmendmentById(): void {
    this.isLoading = true;
    this.biddingContractApiService
      .getAmendmentById(this.amendmentRouteId)
      .subscribe((data: AmendmentLastResponse) => {
        this.setAmendmentData(data);
      })
      .add(() => (this.isLoading = false));
  }

  getAmendmentLast(): void {
    this.isLoading = true;
    this.biddingContractApiService
      .getAmendmentsLast(this.contractId)
      .subscribe((data: AmendmentLastResponse) => {
        this.setAmendmentData(data);
      })
      .add(() => (this.isLoading = false));
  }

  setAmendmentData(data: AmendmentLastResponse): void {
    if (data) {
      this.amendment = data;
      if (
        this.mode === ModeAmendmentEnum.READ ||
        this.mode === ModeAmendmentEnum.UPDATE
      ) {
        this.fillAmenmendtForm.fillFormValues(this.form, this.amendment);
      }
      this.checkDeleteStatus(data.status);
    }
  }

  deleteAmendment(): void {
    this.isLoading = true;
    this.biddingContractApiService
      .deleteContract(this.amendmentRouteId)
      .subscribe(
        () => {
          this.navigateToContractTable();
          this.showSuccessMsg();
        },
        () => this.showErrorMsg()
      )
      .add(() => (this.isLoading = false));
  }

  navigateToContractTable(): void {
    if (this.mode !== ModeAmendmentEnum.CREATE) {
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['..'], { relativeTo: this.activatedRoute });
    }
  }

  showSuccessMsg(): void {
    const msg = this.translate.instant('CONTRACT.AMENDMENT_DELETE_SUCCESS');
    this.notificationGlobalSvc.showSuccess(msg);
  }

  showErrorMsg(): void {
    const msg = this.translate.instant('CONTRACT.AMENDMENT_DELETE_ERROR');
    this.notificationGlobalSvc.showError(msg);
  }

  checkDeleteStatus(status: number): void {
    if (
      status === BiddingContractStatusesEnum.PENDING_SIGNATURE &&
      !this.planInSync
    ) {
      this.showDeleteButton = true;
    } else {
      this.showDeleteButton = false;
    }
  }

  getContractByProcess(): void {
  this.subscriptions.add(
    this.biddingContractstore
      .getContractsByProcess(this.processId)
      .pipe(
        filter(state => state?.procurementContracts && state.procurementContracts.length > 0)
      )
      .subscribe((state) => {
        this.contracts = state.procurementContracts;
        
        this.selectedContract = this.contracts.find(
          (el) => el.biddingContractId === this.contractId
        );
      })
    );
  }

  checkPermission(): ModeAmendmentEnum {
    this.mode = this.activatedRoute.snapshot.params.mode;
    switch (this.mode) {
      case ModeAmendmentEnum.UPDATE:
      case ModeAmendmentEnum.CREATE:
        if (
          this.permissionSvc.hasPermission(
            PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
          )
        ) {
          return this.mode;
        } else {
          return ModeAmendmentEnum.READ;
        }
      default:
        return ModeAmendmentEnum.READ;
    }
  }

  loadContracts(): void {
    this.biddingContractstore.getContractsByProcessAction(
      this.processId,
      this.procurementProcess.code
    );
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }
}
