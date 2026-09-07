import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Enumerator, ErrorResponse } from '@core/models';
import { BiddingProcessPlanService } from '@core/services/apis';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import {
  FileService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { LocalStorageService } from '@fiduciary-interface/app/shared/services';
import { GridSettings } from '@fiduciary-interface/app/shared/services/localStorage/models/grid-settings.model';
import { TranslateService } from '@ngx-translate/core';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { process, State } from '@progress/kendo-data-query';
import { FileSaverService } from 'ngx-filesaver';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { ApprovedPlansColumnName } from '../../enums';
import { AppovedPlan, AppovedPlanResponse } from '../../models';

@Component({
  selector: 'fi-approved-plans',
  templateUrl: './approved-plans.component.html',
})
export class ApprovedPlansComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  ApprovedPlansColumnName = ApprovedPlansColumnName;

  @Input() reloadPlans: boolean;
  private readonly subscription = new Subscription();

  highlightValue: string;
  enumPlanStatuses: Enumerator[];

  gridView: AppovedPlan[] = [];
  gridData: AppovedPlan[] = [];

  isPlanLoading: boolean;
  isFileDownloading: boolean;

  constructor(
    readonly biddingProcessPlanStore: BiddingProcessPlanStoreService,
    readonly notificationGlobalSvc: NotificationGlobalService,
    readonly biddingProcessPlanSvc: BiddingProcessPlanService,
    private readonly translateEnum: TranslateEnumPipe,
    readonly persistingService: LocalStorageService,
    private readonly translate: TranslateService,
    readonly fileSaverService: FileSaverService,
    private readonly ifDatePipe: IFDatePipe,
    readonly fileService: FileService
  ) {}

  ngOnInit(): void {
    this.getBiddingProcessPlan();

    const gridSettings: GridSettings = this.persistingService.get(
      'approvedPlansSettings'
    );

    if (gridSettings !== null) {
      this.gridSettings = this.mapGridSettings(gridSettings);
    }

    this.translateColumNames();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(): void {
    /* this.getBiddingProcessPlan();

    const gridSettings: GridSettings = this.persistingService.get(
      'approvedPlansSettings'
    );

    if (gridSettings !== null) {
      this.gridSettings = this.mapGridSettings(gridSettings);
    }

    this.translateColumNames(); */
  }

  filterValue(value: string): void {
    this.highlightValue = value;
    const lowerCase = value.toLowerCase();

    this.gridView = this.gridData.filter(
      (approvedPlan: AppovedPlan) =>
        approvedPlan.document?.ezShareNumber
          ?.toLowerCase()
          .includes(lowerCase) ||
        approvedPlan.document?.name?.toLowerCase().includes(lowerCase) ||
        approvedPlan.version?.toLowerCase().includes(lowerCase) ||
        approvedPlan.statusTranslation?.toLowerCase().includes(lowerCase) ||
        approvedPlan.approvedBy?.toString().toLowerCase().includes(lowerCase) ||
        approvedPlan.submissionDateFormated
          ?.toLowerCase()
          .includes(lowerCase) ||
        approvedPlan.approvedDateFormated?.toLowerCase().includes(lowerCase) ||
        approvedPlan.document?.disclosureDateFormated
          ?.toLowerCase()
          .includes(lowerCase)
    );
  }

  donwloadDocument(fiduciaryProcessDocumentId: string, name: string): void {
    this.isFileDownloading = true;
    this.fileService
      .downloadFile(fiduciaryProcessDocumentId)
      .subscribe(
        (res: ArrayBuffer) => {
          this.fileSaverService.save(
            new Blob([new Uint8Array(res).buffer]),
            name
          );
        },
        () => {
          this.donwloadErrorMessage();
        }
      )
      .add(() => (this.isFileDownloading = false));
  }

  formatItemNumber(item: string): string {
    item = item.replace(/[-\s]/g, '');
    const year = item.substring(0, 4);
    const number = item.substring(4);
    const numberWithZeros = number.padStart(3, '0');
    return year + numberWithZeros;
  }

  getApprovedPlans(projectBucketId: string): Observable<AppovedPlan> {
    this.isPlanLoading = true;
    return this.biddingProcessPlanSvc.getApprovedPlans(projectBucketId).pipe(
      mergeMap((appovedPlans: AppovedPlanResponse) => {
        const approvedPlansWithStatus =
          appovedPlans.biddingProcessPlansApproved.map((approvedPlan) => {
            approvedPlan.statusTranslation = this.translateEnum.translateEnum(
              approvedPlan.status,
              this.enumPlanStatuses
            );
            if (approvedPlan.version !== '') {
              approvedPlan.version = this.formatItemNumber(
                approvedPlan.version
              );
            }
            approvedPlan.submissionDateFormated = this.ifDatePipe.transform(
              approvedPlan.submissionDate
            );
            approvedPlan.approvedDateFormated = this.ifDatePipe.transform(
              approvedPlan.approvedDate
            );
            if (approvedPlan.document && approvedPlan.document.disclosureDate) {
              approvedPlan.document.disclosureDateFormated =
                this.ifDatePipe.transform(approvedPlan.document.disclosureDate);
            }
            return approvedPlan;
          });
        this.gridData = approvedPlansWithStatus;
        this.gridView = this.gridData;
        this.isPlanLoading = false;

        return approvedPlansWithStatus;
      }),
      catchError((err: ErrorResponse) => {
        this.isPlanLoading = false;
        this.getApprovedPlansErrorMessage();
        return throwError(err);
      })
    );
  }

  getBiddingProcessPlan(): void {
    const sub = this.biddingProcessPlanStore
      .getOrLoadBiddingProcessPlan()
      .pipe(
        mergeMap((state) => {
          this.enumPlanStatuses = state.enumState.biddingProcessPlanStatuses;
          return this.getApprovedPlans(
            state.projectState.selectedProject.projectBucketId
          );
        })
      )
      .subscribe();
    this.subscription.add(sub);
  }

  donwloadErrorMessage(): void {
    const message = this.translate.instant(
      'SHARED.DOCUMENT.DOCUMENT_FINISHED.ERROR_DOWNLOAD'
    );
    this.notificationGlobalSvc.showError(message);
  }

  getApprovedPlansErrorMessage(): void {
    const message = this.translate.instant('PROCUREMENT.TABLE.ERROR_LOADING');
    this.notificationGlobalSvc.showError(message);
  }

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;

    if (
      element.classList.contains('has-ellipsis') &&
      (element.clientHeight < element.scrollHeight ||
        element.offsetWidth < element.scrollWidth)
    ) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }

  public gridSettings: GridSettings = {
    state: {
      filter: {
        logic: 'and',
        filters: [],
      },
    },
    gridData: process(this.gridView, {
      filter: {
        logic: 'and',
        filters: [],
      },
    }),
    columnsConfig: [
      {
        field: ApprovedPlansColumnName.documentEzShareNumber,
        title: this.translate.instant('PROCUREMENT.TABLE.DOCUMENT_EZSHARE_ID'),
        filterable: false,
        width: 140,
      },
      {
        field: ApprovedPlansColumnName.documentName,
        title: this.translate.instant('PROCUREMENT.TABLE.DOCUMENT_NAME'),
        filterable: false,
        width: 240,
      },
      {
        field: ApprovedPlansColumnName.version,
        title: this.translate.instant('PROCUREMENT.TABLE.VERSION'),
        filterable: false,
        width: 70,
      },
      {
        field: ApprovedPlansColumnName.statusTranslation,
        title: this.translate.instant('PROCUREMENT.TABLE.STATUS'),
        filterable: false,
        width: 140,
      },
      {
        field: ApprovedPlansColumnName.approvedBy,
        title: this.translate.instant('PROCUREMENT.TABLE.APPROVED_BY'),
        filterable: false,
        width: 175,
      },
      {
        field: ApprovedPlansColumnName.submissionDateFormated,
        title: this.translate.instant('PROCUREMENT.TABLE.SUBMISSION_DATE'),
        filterable: false,
        width: 100,
      },
      {
        field: ApprovedPlansColumnName.approvedDateFormated,
        title: this.translate.instant('PROCUREMENT.TABLE.APPROVED_DATE'),
        filterable: false,
        width: 100,
      },
      {
        field: ApprovedPlansColumnName.documentDisclosureDateFormated,
        title: this.translate.instant('PROCUREMENT.TABLE.DISCLOSURE_DATE'),
        filterable: false,
        width: 100,
      },
    ],
  };

  public dataStateChange(state: State): void {
    this.gridSettings.state = state;
    this.gridSettings.gridData = process(this.gridView, state);
    this.saveGrid();
  }

  public onReorder(e: any): void {
    const reorderedColumn = this.gridSettings.columnsConfig.splice(
      e.oldIndex,
      1
    );
    this.gridSettings.columnsConfig.splice(e.newIndex, 0, ...reorderedColumn);
    this.saveGrid();
  }

  public onResize(e: any): void {
    e.forEach((item) => {
      this.gridSettings.columnsConfig.find(
        (col) => col.field === item.column.field
      ).width = item.newWidth;
    });

    this.saveGrid();
  }

  public onVisibilityChange(e: any): void {
    e.columns.forEach((column) => {
      this.gridSettings.columnsConfig.find(
        (col) => col.field === column.field
      ).hidden = column.hidden;
    });

    this.saveGrid();
  }

  public mapGridSettings(gridSettings: GridSettings): GridSettings {
    const state = gridSettings.state;

    return {
      state,
      columnsConfig: gridSettings.columnsConfig,
      gridData: process(this.gridView, state),
    };
  }

  private saveGrid(): void {
    const gridConfig = {
      columnsConfig: this.gridSettings.columnsConfig,
      state: this.gridSettings.state,
    };

    this.persistingService.set('approvedPlansSettings', gridConfig);
  }

  translateColumNames(): void {
    this.gridSettings.columnsConfig.forEach((colum) => {
      switch (colum.field) {
        case ApprovedPlansColumnName.documentEzShareNumber:
          colum.title = this.translate.instant(
            'PROCUREMENT.TABLE.DOCUMENT_EZSHARE_ID'
          );
          break;

        case ApprovedPlansColumnName.documentName:
          colum.title = this.translate.instant(
            'PROCUREMENT.TABLE.DOCUMENT_NAME'
          );
          break;
        case ApprovedPlansColumnName.version:
          colum.title = this.translate.instant('PROCUREMENT.TABLE.VERSION');
          break;
        case ApprovedPlansColumnName.statusTranslation:
          colum.title = this.translate.instant('PROCUREMENT.TABLE.STATUS');
          break;
        case ApprovedPlansColumnName.approvedBy:
          colum.title = this.translate.instant('PROCUREMENT.TABLE.APPROVED_BY');
          break;
        case ApprovedPlansColumnName.submissionDateFormated:
          colum.title = this.translate.instant(
            'PROCUREMENT.TABLE.SUBMISSION_DATE'
          );
          break;
        case ApprovedPlansColumnName.approvedDateFormated:
          colum.title = this.translate.instant(
            'PROCUREMENT.TABLE.APPROVED_DATE'
          );
          break;
        case ApprovedPlansColumnName.documentDisclosureDateFormated:
          colum.title = this.translate.instant(
            'PROCUREMENT.TABLE.DISCLOSURE_DATE'
          );
          break;

        default:
          break;
      }
    });
  }
}
