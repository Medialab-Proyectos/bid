import { Component, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ChangeProcess } from '@core/enums';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { ProcessChanges } from '../../models';
import { EnumsStoreService } from '@core/services/store-services';
import { Enumerator } from '@core/models';
import { process } from '@progress/kendo-data-query';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-process-changes',
  templateUrl: './process-changes.component.html',
})
export class ProcessChangesComponent implements OnInit, OnDestroy {
  @Input() set changes(value: ProcessChanges[]) {
    this.processChangesData = value;
  }
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  processChangesData: ProcessChanges[] = [];
  private readonly subscriptions = new Subscription();

  gridView: unknown[];
  enumCategories: Enumerator[];
  enumProcurement: Enumerator[];
  enumSupervision: Enumerator[];
  enumSustainability: Enumerator[];
  enumGoods: Enumerator[];
  highlightValue: string;

  constructor(
    readonly translateEnum: TranslateEnumPipe,
    readonly enumStore: EnumsStoreService
  ) {
    this.subscriptions.add(
      this.enumStore.selectEnums().subscribe((data) => {
        this.enumCategories = data.biddingProcessProcurementProcessCategories;
        this.enumProcurement =
          data.biddingProcessProcurementProcessProcurementMethods;
        this.enumSupervision =
          data.biddingProcessProcurementProcessSupervisionMethods;
        this.enumSustainability =
          data.biddingProcessProcurementProcessSustainabilities;
        this.enumGoods = data.biddingProcessProcurementProcessGoodsReferences;
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.gridView = this.processChangesData;
  }

  mapKeyValueModified(value: ProcessChanges[]): ProcessChanges[] {
    return value.map((e) => {
      const previousValue = this.translateValue(
        e.updatedValue,
        e.previousValue
      );
      const newValue = this.translateValue(e.updatedValue, e.newValue);
      return {
        ...e,
        previousValue: previousValue,
        newValue: newValue,
        updatedValue: e.updatedValue.replace('FI.CNVG.FP.', ''),
      };
    });
  }

  translateValue(updatedKey: string, valueModified: string): string {
    switch (updatedKey) {
      case ChangeProcess.CATEGORY:
        return this.translateEnum.translateEnum(
          Number(valueModified),
          this.enumCategories
        );
      case ChangeProcess.ACQUISITION_METHOD:
        return this.translateEnum.translateEnum(
          Number(valueModified),
          this.enumProcurement
        );
      case ChangeProcess.MONITORING_METHOD:
        return this.translateEnum.translateEnum(
          Number(valueModified),
          this.enumSupervision
        );
      case ChangeProcess.SUSTAINABILITY_LABEL:
        return this.translateEnum.translateEnum(
          Number(valueModified),
          this.enumSustainability
        );
      case ChangeProcess.GOODS_AND_SERVICES:
        return this.translateEnum.translateEnum(
          Number(valueModified),
          this.enumGoods
        );
      default:
        return valueModified;
    }
  }

  public onFilter(input: string): void {
    this.highlightValue = input;

    this.gridView = process(this.processChangesData, {
      filter: {
        logic: 'or',
        filters: [
          {
            field: 'modifiedBy',
            operator: 'contains',
            value: input,
          },
          {
            field: 'updatedValue',
            operator: 'contains',
            value: input,
          },
          {
            field: 'previousValue',
            operator: 'contains',
            value: input,
          },
          {
            field: 'newValue',
            operator: 'contains',
            value: input,
          },
          {
            field: 'modified',
            operator: 'contains',
            value: input,
          },
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }
}
