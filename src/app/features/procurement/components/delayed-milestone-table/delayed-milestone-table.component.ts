import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AmendmentsStatisColEnum,
  ContractsStaticColEnum,
  DelayedMilestoneTableAmendmentsColEnum,
  DelayedMilestoneTableContractsColEnum,
  DelayedMilestoneTableProcessColEnum,
  DelayedMilestoneTableRowsEnum,
  DelayedMilestoneTableTypeEnum,
  ProcessOnTimePastDue,
  ProcessStaticColEnum,
  StaticRowEnum,
} from '@core/enums';
import {
  ContractAndAmendmentCountResponse,
  DelayedMilestoneEmitter,
} from '@core/models';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { AppStateWithBiddingProcessPlan } from '@core/store';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DelayedMilestoneEventBusService } from '../../services/delayed-milestone-event-bus.service';
import { DelayedMilestoneTableService } from '../../services/delayed-milestone-table.service';

interface ContractAndAmendmentData {
  procurementProcessIds: string[];
  totalCount: number;
}
@Component({
  selector: 'fi-delayed-milestone-table',
  templateUrl: './delayed-milestone-table.component.html',
})
export class DelayedMilestoneTableComponent implements OnInit, OnDestroy {
  @Input() set tableTye(data: DelayedMilestoneTableTypeEnum) {
    this.delayedMilestoneType = data;
  }
  @Input() tittle: string;

  @Input() set planId(id: string) {
    this.procurementPlanId = id;
  }
  @Input() set showTable(value: boolean) {
    this._showtable = value;
    if (value) {
      this.getData();
    }
    this.clicked = false;
  }
  @Output() changeTableVisibility: EventEmitter<unknown> =
    new EventEmitter<unknown>();
  private readonly subscriptions = new Subscription();

  loading: boolean = true;
  delayedMilestoneType: DelayedMilestoneTableTypeEnum = undefined;
  delayedMilestoneTableTypeEnum = DelayedMilestoneTableTypeEnum;
  _showtable: boolean;
  staticRow = Object.keys(StaticRowEnum).filter((c) => isNaN(Number(c)));
  amendmentsStaticCol = Object.keys(AmendmentsStatisColEnum).filter((c) =>
    isNaN(Number(c))
  );
  contractsStaticCol = Object.keys(ContractsStaticColEnum).filter((c) =>
    isNaN(Number(c))
  );
  processStaticCol = Object.keys(ProcessStaticColEnum).filter((c) =>
    isNaN(Number(c))
  );
  newProcessCols;
  selectedRow: number = undefined;
  selectedCol: number = undefined;
  selectedTableType: DelayedMilestoneTableTypeEnum = undefined;
  procurementPlanId: string;
  newData = [[], [], [], []];
  clicked = false;

  constructor(
    readonly biddingProcessPlanStore: BiddingProcessPlanStoreService,
    private readonly store: Store<AppStateWithBiddingProcessPlan>,
    readonly delayedMilestoneEventBusService: DelayedMilestoneEventBusService,
    readonly delayedMilestoneTableService: DelayedMilestoneTableService
  ) {}

  showTableToggle(): void {
    if (this.clicked) return;
    this.clicked = true;
    this.changeTableVisibility.emit({
      typeTable: this.delayedMilestoneType,
      show: !this._showtable,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.checkSelectedFilterForBiddingProcess();
    this.mapStaticCols();
  }

  setProcessTableData(): void {
    this.subscriptions.add(
      this.delayedMilestoneTableService
        .getDelayedProcessMilestone(this.procurementPlanId)
        .subscribe((data) => {
          let rows = Object.values(DelayedMilestoneTableRowsEnum).filter((e) =>
            isNaN(Number(e))
          );

          let columnsProcess = Object.values(
            DelayedMilestoneTableProcessColEnum
          ).filter((e) => isNaN(Number(e)));

          let onTimePastDueEnum = Object.values(ProcessOnTimePastDue).filter(
            (e) => isNaN(Number(e))
          );

          rows.forEach((r, indexRow) => {
            let colI = 0;
            columnsProcess.forEach((_, indexCol) => {
              onTimePastDueEnum.forEach((_, aux) => {
                this.newData[indexRow][colI] =
                  data[r][columnsProcess[indexCol]][onTimePastDueEnum[aux]];
                colI++;
              });
            });
          });
          this.loading = false;
        })
    );
  }

  setContractTableData(): void {
    this.subscriptions.add(
      this.delayedMilestoneTableService
        .getDelayedContractsMilestone(this.procurementPlanId)
        .subscribe((data) => {
          let rows = Object.values(DelayedMilestoneTableRowsEnum).filter((e) =>
            isNaN(Number(e))
          );
          let columnsContracts = Object.values(
            DelayedMilestoneTableContractsColEnum
          ).filter((e) => isNaN(Number(e)));

          rows.forEach((r, indexRow) => {
            columnsContracts.forEach((_, indexCol) => {
              this.newData[indexRow][indexCol] =
                this.mapDataContractAndAmendment(
                  data[r][columnsContracts[indexCol]]
                );
            });
          });
          this.loading = false;
        })
    );
  }

  mapDataContractAndAmendment(
    data: ContractAndAmendmentCountResponse[]
  ): ContractAndAmendmentData {
    const mappedData: ContractAndAmendmentData = {
      procurementProcessIds: [],
      totalCount: 0,
    };
    data?.forEach((d) => {
      mappedData.procurementProcessIds = [
        ...mappedData.procurementProcessIds,
        d.procurementProcessId,
      ];
      mappedData.totalCount += d.total;
    });
    return mappedData;
  }

  setAmendmentTableData(): void {
    this.subscriptions.add(
      this.delayedMilestoneTableService
        .getDelayedAmendmentsMilestone(this.procurementPlanId)
        .subscribe((data) => {
          let rows = Object.values(DelayedMilestoneTableRowsEnum).filter((e) =>
            isNaN(Number(e))
          );
          let columnsAmendments = Object.values(
            DelayedMilestoneTableAmendmentsColEnum
          ).filter((e) => isNaN(Number(e)));
          rows.forEach((r, indexRow) => {
            columnsAmendments.forEach((_, indexCol) => {
              this.newData[indexRow][indexCol] =
                this.mapDataContractAndAmendment(
                  data[r][columnsAmendments[indexCol]]
                );
            });
          });
          this.loading = false;
        })
    );
  }

  getData(): void {
    if (!!this.procurementPlanId && this.delayedMilestoneType) {
      this.loading = true;
      switch (this.delayedMilestoneType) {
        case DelayedMilestoneTableTypeEnum.PROCESS:
          this.setProcessTableData();
          break;
        case DelayedMilestoneTableTypeEnum.CONTRACTS:
          this.setContractTableData();
          break;
        case DelayedMilestoneTableTypeEnum.AMENDMENTS:
          this.setAmendmentTableData();
        default:
          break;
      }
    }
  }

  mapStaticCols(): void {
    let lastFiveElements = this.processStaticCol.slice(-5);
    let newArray = [];
    lastFiveElements.forEach((e) => {
      newArray.push({ title: e, subHeaders: ['OnTime', 'Delayed'] });
    });
    this.newProcessCols = newArray;
  }

  checkSelectedFilterForBiddingProcess(): void {
    const sub = this.store.select('biddingProcessPlan').subscribe((data) => {
      if (data.selectedFilterForBiddingProcess === null) {
        this.selectedRow = undefined;
        this.selectedCol = undefined;
        this.selectedTableType = undefined;
      } else {
        this.selectedRow = data.selectedFilterForBiddingProcess.selectedRow;
        this.selectedCol = data.selectedFilterForBiddingProcess.selectedCol;
        this.selectedTableType =
          data.selectedFilterForBiddingProcess.selectedTableType;
      }
    });
    this.subscriptions.add(sub);
  }

  selectData(indexRow: number, indexCol: number): void {
    const newValue: DelayedMilestoneEmitter = {
      processIds:
        this.delayedMilestoneType === this.delayedMilestoneTableTypeEnum.PROCESS
          ? this.newData[indexRow][indexCol]
          : this.newData[indexRow][indexCol]?.procurementProcessIds,
      selectedFilterForBiddingProcess: {
        selectedRow: null,
        selectedCol: null,
        selectedTableType: null,
      },
    };
    if (
      this.selectedRow === indexRow &&
      this.selectedCol === indexCol &&
      this.selectedTableType === this.delayedMilestoneType
    ) {
      newValue.selectedFilterForBiddingProcess = {
        selectedRow: null,
        selectedCol: null,
        selectedTableType: null,
      };
    } else {
      newValue.selectedFilterForBiddingProcess.selectedRow = indexRow;
      newValue.selectedFilterForBiddingProcess.selectedCol = indexCol;
      newValue.selectedFilterForBiddingProcess.selectedTableType =
        this.delayedMilestoneType;
    }
    this.delayedMilestoneEventBusService.selectedOption = newValue;
  }
}
