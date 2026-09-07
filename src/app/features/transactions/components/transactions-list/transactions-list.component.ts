import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  TransactionActions,
  TransactionEventEmitter,
  Transaction,
} from '../../models';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import {
  TransactionsColumnName,
  TransactionsStatus,
  TransactionsTypes,
} from '../../enums';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { GridSettings } from '@fiduciary-interface/app/shared/services/localStorage/models/grid-settings.model';
import { LocalStorageService } from '@fiduciary-interface/app/shared/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-transactions-list',
  templateUrl: './transactions-list.component.html',
})
export class TransactionsListComponent implements OnInit, OnChanges {
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;

  @Input() transactions: Transaction[] = [];
  @Input() isLoading = false;

  @Output() transactionAction: EventEmitter<TransactionEventEmitter> =
    new EventEmitter<TransactionEventEmitter>();

  gridData: Transaction[];
  gridView: Transaction[];
  highlightValue: string;

  TransactionsColumnName = TransactionsColumnName;

  constructor(
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    readonly persistingService: LocalStorageService,
    readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.transactions) {
      this.gridData = changes.transactions.currentValue;
      this.gridView = this.gridData;

      const gridSettings: GridSettings = this.persistingService.get(
        'transactionsListSettings'
      );

      if (gridSettings !== null) {
        this.gridSettings = this.mapGridSettings(gridSettings);
      }
    }
    setTimeout(() => {
      this.translateColumNames();
    });
  }

  onFilter(inputValue: string): void {
    this.highlightValue = inputValue;
    this.gridView = process(this.gridData, {
      filter: {
        logic: 'or',
        filters: [
          {
            field: TransactionsColumnName.transactionNumber,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.transactionTypeFormatted,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.requestNumber,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.partNumber,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.currency,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.amount,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.transactionStatusTranslated,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.approvalDateFormatted,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.valueDateFormatted,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.lastUpdatedBy,
            operator: 'contains',
            value: inputValue,
          },
          {
            field: TransactionsColumnName.lastUpdateFormatted,
            operator: 'contains',
            value: inputValue,
          },
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }

  goToDetails(transaction: Transaction): void {
    const transactionTpye = transaction.transactionTypeCode;
    if (transaction.parentId) {
      this.router.navigate(
        [TransactionsTypes.ATJ.toLocaleLowerCase(), transaction.parentId],
        {
          relativeTo: this.activatedRoute,
        }
      );
    } else {
      this.router.navigate([transactionTpye.toLowerCase(), transaction.id], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  onItemClick(event: TransactionActions, transaction: Transaction): void {
    const output: TransactionEventEmitter = {
      action: event,
      transaction,
    };
    this.transactionAction.emit(output);
  }

  transactionStyles(status: TransactionsStatus): string {
    switch (status) {
      case TransactionsStatus.EDRAFT:
      case TransactionsStatus.ERETURNED:
      case TransactionsStatus.ERETURNEDBYIDB:
        return 'c-status-label__blue';

      case TransactionsStatus.EPAUT:
      case TransactionsStatus.EPVAL:
      case TransactionsStatus.PREV:
      case TransactionsStatus.PVAL:
        return 'c-status-label__orange-yellow';

      case TransactionsStatus.COMPLETED:
      case TransactionsStatus.EREJECT:
      case TransactionsStatus.EREJECTEDBYIDB:
        return 'c-status-label__grey';

      case TransactionsStatus.RECEIVEBYIDB:
      case TransactionsStatus.PVD:
        return 'c-status-label__green';

      default:
        return 'c-status-label__orange-yellow';
    }
  }

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;

    if (
      element.className.includes('has-ellipsis') &&
      element.offsetWidth < element.scrollWidth
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
      sort: [
        {
          field: 'lastUpdate',
          dir: 'desc',
        },
      ],
    },
    gridData: process(this.transactions, {
      filter: {
        logic: 'and',
        filters: [],
      },
    }),
    columnsConfig: [
      {
        field: TransactionsColumnName.transactionNumber,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.TRANSACTION_NUMBER'
        ),
        filterable: false,
        width: 175,
      },
      {
        field: TransactionsColumnName.transactionTypeFormatted,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.TRANSACTION_TYPE'
        ),
        filterable: false,
        width: 385,
      },
      {
        field: TransactionsColumnName.requestNumber,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.REQUEST_NUM'
        ),
        filterable: false,
        width: 130,
      },
      {
        field: TransactionsColumnName.partNumber,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.PART_NUM'
        ),
        width: 102,
        filterable: false,
      },
      {
        field: TransactionsColumnName.currency,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.CURRENCY_TYPE'
        ),
        filterable: false,
        width: 95,
      },
      {
        field: TransactionsColumnName.amount,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.AMOUNT'
        ),
        width: 115,
        filterable: false,
        format: '{0:n2}',
      },
      {
        field: TransactionsColumnName.transactionStatusTranslated,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.STATUS'
        ),
        width: 285,
        filterable: false,
      },
      {
        field: TransactionsColumnName.lastUpdate,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.LAST_UPDATE'
        ),
        width: 120,
        filterable: false,
        hidden: true,
      },
      {
        field: TransactionsColumnName.approvalDate,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.APPROVED_DATE'
        ),
        width: 120,
        filterable: false,
      },
      {
        field: TransactionsColumnName.valueDate,
        title: this.translateService.instant(
          'TRANSACTIONS.VALUE.DATE'
        ),
        width: 120,
        filterable: false,
      },
      {
        field: TransactionsColumnName.lastUpdatedBy,
        title: this.translateService.instant(
          'TRANSACTION.TRANSACTION_LIST.LAST_UPDATE_BY'
        ),
        width: 140,
        filterable: false,
      },
    ],
  };

  public dataStateChange(state: State): void {
    this.gridSettings.state = state;
    this.gridSettings.gridData = process(this.transactions, state);
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
      gridData: process(this.transactions, state),
    };
  }

  private saveGrid(): void {
    const gridConfig = {
      columnsConfig: this.gridSettings.columnsConfig,
      state: this.gridSettings.state,
    };

    this.persistingService.set('transactionsListSettings', gridConfig);
  }

  translateColumNames(): void {
    this.gridSettings.columnsConfig.forEach((colum) => {
      switch (colum.field) {
        case TransactionsColumnName.transactionNumber:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.TRANSACTION_NUMBER'
          );
          break;
        case TransactionsColumnName.transactionTypeFormatted:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.TRANSACTION_TYPE'
          );
          break;
        case TransactionsColumnName.currency:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.CURRENCY_TYPE'
          );
          break;
        case TransactionsColumnName.amount:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.AMOUNT'
          );
          break;
        case TransactionsColumnName.transactionStatusTranslated:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.STATUS'
          );
          break;
        case TransactionsColumnName.lastUpdate:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.LAST_UPDATE'
          );
          break;
        case TransactionsColumnName.valueDate:
            colum.title = this.translateService.instant(
              'TRANSACTIONS.VALUE.DATE'
            );
          break;
        case TransactionsColumnName.lastUpdatedBy:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.LAST_UPDATE_BY'
          );
          break;
        case TransactionsColumnName.approvalDate:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.APPROVED_DATE'
          );
          break;
        case TransactionsColumnName.requestNumber:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.REQUEST_NUM'
          );
          break;
        case TransactionsColumnName.partNumber:
          colum.title = this.translateService.instant(
            'TRANSACTION.TRANSACTION_LIST.PART_NUM'
          );
          break;
        default:
          break;
      }
    });
  }
}
