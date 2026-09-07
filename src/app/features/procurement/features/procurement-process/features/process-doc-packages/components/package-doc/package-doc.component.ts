import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
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
import { filter } from 'rxjs/operators';

@Component({
  selector: 'fi-package-doc',
  templateUrl: './package-doc.component.html',
  providers: [TranslatePipe],
})
export class PackageDocComponent implements OnInit, OnDestroy, OnChanges {
  Enums = Enums;

  // Ticket CFI-13103
  @Input() supervisionMethod: number;
  @Input() items: BiddingProcessDocumentPackage[];
  //

  @Input() item: BiddingProcessDocumentPackage;
  @Input() actualDatePermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Output() collapse = new EventEmitter<BiddingProcessDocumentPackage>();
  @Input() id: number;
  @Input() expandedRows = true;
  @Input() isBtnClicked = false;
  @Input() set processPlan(value: BiddingProcessPlan) {
    this.planInSync = value.status !== BiddingProcessPlanStatus.IN_SYNC;
  }

  planInSync: boolean;
  public date: Date = null;
  private readonly subscription = new Subscription();
  public mobileView = false;
  isLoading: boolean;
  selectedLanguage: string;
  processId = this.activatedRoute.snapshot.params.processId;
  disableByPermission = false;
  prevDate: Date = null;
  statusProcuperement: number;
  // Ticket CFI-13103
  public min: Date = new Date();
  public max: Date = new Date();
  //

  constructor(
    private readonly windowSvc: WindowSizeService,
    readonly route: Router,
    private readonly activatedRoute: ActivatedRoute,
    readonly notificationGlobalSvc: NotificationGlobalService,
    readonly biddingProcessDocumentPackagesStoreSvc: BiddingProcessDocumentPackagesStoreService,
    readonly storePreferences: Store<AppStateWithUsrPreferences>,
    private readonly permissionSvc: PermissionService,
    private readonly biddingProcessPlanStore: BiddingProcessPlanStoreService
  ) {}

  // Ticket CFI-13103
  ngOnChanges(changes: SimpleChanges): void {
    const itemsChange = changes['items'];
    if (itemsChange?.currentValue && this.items.length > 0) {
      this.calculateDateBoundaries();
    }
  }
  //

  //Ticket CFI-13103
  calculateDateBoundaries() {
    const isFirst = this.id === 0;
    const isLast = this.id === this.items.length - 1;

    this.min = isFirst
      ? null
      : this.addDays(this.items[this.id - 1].actualDate, 1);

    let limitDate = isLast ? null : this.items[this.id + 1].actualDate;

    const nextActualDate = this.findNextActualDate();

    if (nextActualDate) {
      this.max = this.addDays(nextActualDate, -1);
    } else if (limitDate) {
      this.max = this.addDays(limitDate, -1);
    } else {
      this.max = new Date();
    }
  }
  //

  //Ticket CFI-13103
  addDays(dateInput: Date | string | null, days: number): Date | null {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    date.setDate(date.getDate() + days);
    return date;
  }
  //

  //Ticket CFI-13103
  findNextActualDate() {
    const nextItem = this.items.find((item, index) =>
      index > this.id && item.actualDate !== null
    );
    return nextItem ? nextItem.actualDate : null;
  }
  //

  ngOnInit(): void {
    this.getStatusProcurementProcess();
    this.getCurrentLang();
    this.initMobileConditionals();
    this.prevDate = this.item.actualDate;
    if (this.item.actualDate) {
      this.date = new Date(this.item.actualDate);
    }
    this.disableByPermission =
      this.findProcurementStatus(this.statusProcuperement) &&
      (this.permissionSvc.haveSomePermissions(this.actualDatePermission) ||
        this.actualDatePermission.includes(PermissionEnum.SPECIAL));
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
    if (this.isEventInvalid(event)) {
      this.date = new Date(this.prevDate);
    } else {
      this.updateDocumentPackageStatusActualDate(event);
    }
  }

  private isStatusCompleteOrReturned(): boolean {
    return (
      this.item.status === DocumentPackagesStatus.COMPLETE ||
      this.item.status === DocumentPackagesStatus.RETURNED ||
      this.item.status === DocumentPackagesStatus.UNDER_REVIEW ||
      this.item.status === DocumentPackagesStatus.AMENDMENT_UNDER_REV ||
      this.item.status === DocumentPackagesStatus.COMPLETE_AMENDMENT ||
      this.item.status === DocumentPackagesStatus.AMENDMENT_RETURNED
    );
  }

  private isEventInvalid(event: Date): boolean {
    return (
      this.isStatusCompleteOrReturned() &&
      (event === null || event?.getFullYear() < 1000)
    );
  }

  private updateDocumentPackageStatusActualDate(event: Date): void {
    this.biddingProcessDocumentPackagesStoreSvc.changeDocumentPackageStatusActualDateAction(
      this.prevDate,
      event,
      this.item.id,
      this.processId,
      this.selectedLanguage
    );
  }

  getStatusProcurementProcess(): void {
    this.subscription.add(
      this.biddingProcessPlanStore
        .getOrLoadSelectedBiddingProcessById(this.processId)
        .pipe(
          filter((data) => {
            return data.selectedBiddingProcessProcurementProcess !== null;
          })
        )
        .subscribe((data) => {
          this.statusProcuperement =
            data?.selectedBiddingProcessProcurementProcess?.status;
        })
    );
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

  // Ticket CFI-13103
  validateActualDateByPackage(index: number): boolean {
    if (index === 0) return false;

    const prevItem = this.items[index - 1];
    const firstItem = this.items[0];

    if (!prevItem.actualDate || !firstItem.actualDate) return true;

    const actualDatePrev = new Date(prevItem.actualDate).toDateString();
    const today = new Date().toDateString();

    return actualDatePrev === today;
  }
  //
}
