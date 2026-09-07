import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BiddingProcessPlanService } from '@core/services/apis';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';

@Component({
  selector: 'fi-process-update-bid-validity-date',
  templateUrl: './process-update-bid-validity-date.component.html',
})
export class ProcessUpdateBidValidityDateComponent implements OnInit {
  constructor(
    readonly biddingProcessPlanService: BiddingProcessPlanService,
    private readonly translate: TranslateService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    readonly biddingStoreSvc: BiddingProcessPlanStoreService
  ) {}

  @Output() dateSelected: EventEmitter<Date | null> =
    new EventEmitter<Date | null>();

  @Input() caledaryType?: string = 'classic';
  @Input() caledaryFormat?: string = 'dd/MMM/yyyy';
  @Input() showUpdateBidValidityDate?: boolean = true;
  @Input() date?: string;
  @Input() procurementProcessId: string;
  @Input() disabled: boolean;
  @Input() labelTitle: string;
  @Input() allowPastDates?: boolean = false;
  @Input() notificationText?: {
    successMessage?: string;
    errorMessage?: string;
  } = {};
  dateValue: Date = null;
  public minDate: Date = new Date();

  ngOnInit(): void {
    this.dateValue = this.date ? new Date(this.date) : null;

    if (this.allowPastDates) {
      this.minDate = null;
    } else {
      let minDate = new Date().setHours(0, 0, 0, 0);
      this.minDate = new Date(minDate);
      this.minDate.setDate(this.minDate.getDate() + 1);
    }

    this.dateSelected.emit(this.dateValue);
  }

  onValueChange(eve: string): void {
    const date = eve ? new Date(eve) : null;
    if (this.minDate !== null && date < this.minDate) {
      this.dateValue = this.date ? new Date(this.date) : null;
      return;
    }
    this.biddingProcessPlanService
      .updateBidValidityDate(this.procurementProcessId, date)
      .subscribe(
        () => {
          this.dateSelected.emit(date);
          const msg = this.translate.instant(
            this.notificationText.successMessage ??
              'PROCESS_DOC.DOCUMENT_TAB.ACTUAL_DATE_UPDATE.SUCCESS'
          );
          this.notificationGlobalSvc.showSuccess(msg);
          this.biddingStoreSvc.getBiddingProcessByIdAction(
            this.procurementProcessId
          );
        },
        (error) => {
          this.notificationGlobalSvc.showError(
            this.translate.instant(this.notificationText.errorMessage ?? error)
          );
          this.dateValue = this.date ? new Date(this.date) : null;
        }
      );
  }
}
