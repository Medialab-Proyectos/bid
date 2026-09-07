import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { WindowSizeService } from '@core/services/view';
import {
  BiddingProcessDocumentPackage,
  BiddingProcessPlan,
  Enums,
} from '@core/models';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import {
  BiddingProcessDocumentPackagesStoreService,
  BiddingProcessPlanStoreService,
} from '@core/services/store-services';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  DocumentPackagesStatus,
  PermissionEnum,
} from '@core/enums';
import { AppStateWithUsrPreferences } from '@core/store';
import { Store } from '@ngrx/store';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { AdditionalDocPackagesService } from '../../../process-additional-doc-packages/services/additional-doc-packages.service';
import { BiddingProcessDocumentAdditionalPackagesStoreService } from '@core/services/store-services/bidding-process-document-additional-packages/bidding-process-document-additional-packages-store.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'fi-package-doc-additional',
  templateUrl: './package-doc-additional.component.html',
  providers: [TranslatePipe],
})
export class PackageDocAdditionalComponent implements OnInit, OnDestroy {
  Enums = Enums;

  @Input() item: BiddingProcessDocumentPackage;
  @Input() actualDatePermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Output() collapse = new EventEmitter<BiddingProcessDocumentPackage>();
  @Input() id: number;
  @Input() expandedRows = true;
  @Input() isBtnClicked = false;
  @Input() bidValidityOriginalDate: string = null;
  @Input() set lastBidValidityExtensionDate(value: string) {
    this.extendedBidValidityDate = value ? new Date(value) : null;
  }
  @Input() set processPlan(value: BiddingProcessPlan) {
    this.planInSync = value.status !== BiddingProcessPlanStatus.IN_SYNC;
  }
  planInSync: boolean;
  public date: Date = null;
  public newBidValidityDate: Date = null;

  private readonly subscription = new Subscription();
  public mobileView = false;
  isLoading: boolean;
  selectedLanguage: string;
  processId = this.activatedRoute.snapshot.params.processId;
  disableByPermission = false;
  prevDate: Date = null;
  statusProcuperement: number;
  showDeleteBtn: boolean;
  disableNewBidValidityDate: boolean;
  minNewBidValidityDate: Date = null;
  extendedBidValidityDate: Date = null;
  disableDeleteBtn: boolean;
  constructor(
    private readonly windowSvc: WindowSizeService,
    readonly route: Router,
    private readonly activatedRoute: ActivatedRoute,
    readonly notificationGlobalSvc: NotificationGlobalService,
    readonly biddingProcessDocumentPackagesStoreSvc: BiddingProcessDocumentPackagesStoreService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly permissionSvc: PermissionService,
    private readonly biddingProcessPlanStore: BiddingProcessPlanStoreService,
    readonly optionalPackageService: AdditionalDocPackagesService,
    private readonly additionalPackageStoreService: BiddingProcessDocumentAdditionalPackagesStoreService
  ) {}

  ngOnInit(): void {
    this.getStatusProcurementProcess();
    this.getCurrentLang();
    this.initMobileConditionals();
    this.prevDate = this.item.actualDate;
    if (this.item.actualDate) {
      this.date = new Date(this.item.actualDate);
    }
    if (this.item.bidValidityExtensionDate) {
      this.newBidValidityDate = new Date(this.item.bidValidityExtensionDate);
    }
    this.checkStatus();
    this.setNewBidValidityMinValue();
    this.disableByPermission =
      this.findProcurementStatus(this.statusProcuperement) &&
      (this.permissionSvc.haveSomePermissions(this.actualDatePermission) ||
        this.actualDatePermission.includes(PermissionEnum.SPECIAL));
  }
  checkStatus(): void {
    this.showDeleteBtn =
      this.item.status === DocumentPackagesStatus.NOT_STARTED;
    this.disableDeleteBtn = this.item.totalUploadedDocuments !== 0;
    this.disableNewBidValidityDate = !(
      this.item.status === DocumentPackagesStatus.NOT_STARTED ||
      this.item.status === DocumentPackagesStatus.RETURNED
    );
  }

  setNewBidValidityMinValue(): void {
    if (!!this.extendedBidValidityDate) {
      this.minNewBidValidityDate = new Date(
        this.extendedBidValidityDate.getFullYear(),
        this.extendedBidValidityDate.getMonth(),
        this.extendedBidValidityDate.getDate() + 1
      );
    } else {
      if (!!this.bidValidityOriginalDate) {
        const bidValidityOriginalDate = new Date(this.bidValidityOriginalDate);
        this.minNewBidValidityDate = new Date(
          bidValidityOriginalDate.getFullYear(),
          bidValidityOriginalDate.getMonth(),
          bidValidityOriginalDate.getDate() + 1
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  initMobileConditionals(): void {
    this.subscription.add(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  collapseBtn(item: BiddingProcessDocumentPackage): void {
    this.collapse.emit(item);
  }

  routeToProcessComments(): void {
    this.route.navigate(['../comments'], {
      relativeTo: this.activatedRoute.parent,
    });
  }

  /**
   * Updates the date of the document package on value change
   * @param event Actual date
   */
  updateActualDate(event: Date): void {
    this.biddingProcessDocumentPackagesStoreSvc.changeDocumentPackageStatusActualDateAction(
      this.prevDate,
      event,
      this.item.id,
      this.processId,
      this.selectedLanguage
    );
  }

  updateNewBidValidityDate(event: Date): void {
    this.additionalPackageStoreService.updateBidValidityExtensionDateAdditionalPackageAction(
      this.processId,
      this.item.id,
      event
    );
  }

  getStatusProcurementProcess(): void {
    const sub = this.biddingProcessPlanStore
      .getOrLoadSelectedBiddingProcessById(this.processId)
      .pipe(
        filter((data) => {
          return data.selectedBiddingProcessProcurementProcess !== null;
        })
      )
      .subscribe((data) => {
        this.statusProcuperement =
          data.selectedBiddingProcessProcurementProcess?.status;
      });
    this.subscription.add(sub);
  }

  findProcurementStatus(
    statusProcurement: BiddingProcessProcurementProcessStatuses
  ): boolean {
    const statusProcurements: number[] = [
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];
    return !statusProcurements.includes(statusProcurement);
  }

  deletePackage(): void {
    this.additionalPackageStoreService.deleteAdditionalPackageAction(
      this.processId,
      this.item.id
    );
  }
}
