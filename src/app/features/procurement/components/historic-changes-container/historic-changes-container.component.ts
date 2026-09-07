import {
  ComponentsChanges,
  OutputsChanges,
  TaskChanges,
} from './../../models/historic-changes.model';
import { Component, Input, OnDestroy } from '@angular/core';
import { ChangeProcess } from '@core/enums';
import { Enumerator } from '@core/models';
import { EnumsStoreService } from '@core/services/store-services';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import {
  HistoricChanges,
  ProcessChanges,
  MilestonesChanges,
  MilestoneChange,
  ProcurementProcessVersion,
  MilestoneObject,
  Change,
} from '../../models';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-historic-changes-container',
  templateUrl: './historic-changes-container.component.html',
  providers: [TranslateEnumPipe, IFDatePipe, TranslatePipe],
})
export class HistoricChangesContainerComponent implements OnDestroy {
  constructor(
    readonly translateEnum: TranslateEnumPipe,
    readonly enumStore: EnumsStoreService,
    private readonly ifdatePipe: IFDatePipe,
    private readonly translatePipe: TranslatePipe
  ) {
    this.getEnums();
  }
  private readonly subscriptions = new Subscription();

  processChangesData: ProcessChanges[] = [];
  enumCategories: Enumerator[];
  enumProcurement: Enumerator[];
  enumSupervision: Enumerator[];
  enumSustainability: Enumerator[];
  enumGoods: Enumerator[];
  enumMilestones: Enumerator[];

  changes: HistoricChanges;

  @Input() set data(value: ProcurementProcessVersion) {
    let mappedData = this.mapData(value);
    this.changes = {
      processChanges: this.modifyProcessChanges(mappedData.processChanges),
      milestonesChanges: this.modifyMilestonesChanges(
        mappedData.milestonesChanges
      ),
      componentsChanges: this.modifyComponentsChanges(
        mappedData.componentsChanges
      ),
    };
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  mapData(data: ProcurementProcessVersion): HistoricChanges {
    return {
      processChanges: this.extractProcessChanges(data),
      milestonesChanges: this.buildMilestoneObject(data),
      componentsChanges: this.buildOutputComponent(data),
    };
  }

  extractProcessChanges(data: ProcurementProcessVersion): ProcessChanges[] {
    let processChanges: ProcessChanges[] = [];

    const objectCopy = Object.assign(
      {},
      data.biddingProcessProcurementProcessUpdateModel
    );
    delete objectCopy.outputs;
    delete objectCopy.milestones;
    delete objectCopy.component;
    delete objectCopy.biddingProcessProcurementProcessId;

    let keys = Object.keys(objectCopy);
    for (let i = 0; i < keys.length; i++) {
      processChanges.push({
        modifiedBy: objectCopy[keys[i]].modifiedBy,
        updatedValue: objectCopy[keys[i]].name,
        modified: objectCopy[keys[i]].modified,
        newValue: objectCopy[keys[i]].lastModification,
        previousValue: objectCopy[keys[i]].previousValue,
      });
    }

    return processChanges.filter((pc) => pc.modified !== null);
  }

  buildMilestoneObject(data: ProcurementProcessVersion): MilestonesChanges {
    const { modifiedBy, modified } =
      data.biddingProcessProcurementProcessUpdateModel.milestones;
    return {
      updatedBy: modifiedBy,
      updatedDate: modified,
      previousMilestones: this.extractMilestones(data, 'previousValue'),
      newMilestones: this.extractMilestones(data, 'lastModification'),
      modifiedMilestone: false,
    };
  }

  extractMilestones(
    data: ProcurementProcessVersion,
    propName: string
  ): MilestoneChange[] {
    const milestonesArray: MilestoneChange[] = [];
    const milestoneObject = data.biddingProcessProcurementProcessUpdateModel
      .milestones[propName] as MilestoneObject;
    const milestones = milestoneObject?.milestones;

    milestones?.forEach((m) => {
      milestonesArray.push({
        actualDate: m.actualDate.value as string,
        reestimatedDate: m.reEstimateDate.value as string,
        estimatedDate: m.estimatedDate.value as string,
        codeMilestone: m.code.value as number,
        modificationDate: milestoneObject.modified,
        modifiedBy: milestoneObject.modifiedBy,
        nameMilestone: '',
        order: m.order?.value as number,
      });
    });

    return milestonesArray.sort((a, b) => a.order - b.order);
  }

  buildOutputComponent(data: ProcurementProcessVersion): ComponentsChanges {
    const outputs: Change =
      data.biddingProcessProcurementProcessUpdateModel.outputs;
    const component: Change =
      data.biddingProcessProcurementProcessUpdateModel.component;
    return {
      previousValues: this.extractsComponents(
        outputs,
        component,
        'previousValue'
      ),
      newValues: this.extractsComponents(
        outputs,
        component,
        'lastModification'
      ),
    };
  }

  extractsComponents(
    tasks: Change,
    component: Change,
    key: string
  ): TaskChanges {
    const outputs: OutputsChanges[] = [];
    tasks[key]?.milestones?.forEach((o) => {
      outputs.push({
        outputName: o.output.value as string,
        modificationDate: tasks[key].modified,
        modifiedBy: tasks[key].modifiedBy,
        outputId: o.output.value as string,
        percentageAssigned: Number(o.amount.value),
      });
    });
    return {
      componentId: component[key] as string,
      componentName: component[key] as string,
      outputs,
    };
  }

  getEnums(): void {
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
        this.enumMilestones = data.biddingProcessMilestoneCodes;
      })
    );
  }

  modifyMilestonesChanges(value: MilestonesChanges): MilestonesChanges {
    return {
      ...value,
      newMilestones: this.modifyMilestonesArray(value.newMilestones),
      previousMilestones: this.modifyMilestonesArray(value.previousMilestones),
    };
  }

  modifyMilestonesArray(milestones: MilestoneChange[]): MilestoneChange[] {
    const dateFormat = 'dd MMM yyyy';

    return milestones.map((om) => ({
      ...om,
      nameMilestone: this.translatePipe.transform(
        `PROCUREMENT.MILESTONES.${this.translateEnum.translateEnum(
          Number(om.codeMilestone),
          this.enumMilestones
        )}`
      ),
      estimatedDate: this.ifdatePipe.transform(om.estimatedDate, dateFormat, true),
      reestimatedDate: this.ifdatePipe.transform(om.reestimatedDate, dateFormat, true),
      modificationDate: this.ifdatePipe.transform(om.modificationDate, dateFormat, true),
    }));
  }

  modifyComponentsChanges(value: ComponentsChanges): ComponentsChanges {
    return {
      ...value,
      newValues: this.modifyComponentsArray(value, true),
      previousValues: this.modifyComponentsArray(value, false),
    };
  }

  modifyComponentsArray(
    components: ComponentsChanges,
    isNewValues: boolean
  ): TaskChanges {
    const { componentId, componentName, outputs } = isNewValues
      ? components?.newValues
      : components?.previousValues;
    const transformedOutputs: OutputsChanges[] = outputs.map((component) => {
      return {
        ...component,
        modificationDate: this.ifdatePipe.transform(component.modificationDate),
      };
    });
    return {
      componentId,
      componentName,
      outputs: transformedOutputs,
    };
  }

  modifyProcessChanges(value: ProcessChanges[]): ProcessChanges[] {
    return value.map((e) => {
      return {
        ...e,
        previousValue: this.translateValue(e.updatedValue, e.previousValue),
        newValue: this.translateValue(e.updatedValue, e.newValue),
        updatedValue: this.translatePipe.transform(
          e.updatedValue.replace('FI.CNVG.FP.', '')
        ),
        modified: this.ifdatePipe.transform(e.modified),
      };
    });
  }

  translateValue(updatedKey: string, valueModified: string): string {
    const decimalPipe = new DecimalPipe('en-US');
    const keyMap = {
      [ChangeProcess.CATEGORY]: this.enumCategories,
      [ChangeProcess.ACQUISITION_METHOD]: this.enumProcurement,
      [ChangeProcess.MONITORING_METHOD]: this.enumSupervision,
      [ChangeProcess.SUSTAINABILITY_LABEL]: this.enumSustainability,
      [ChangeProcess.GOODS_AND_SERVICES]: this.enumGoods,
    };

    const numericKeys: string[] = [
      ChangeProcess.TOTAL_AMOUNT_OF_CONTRACT,
      ChangeProcess.IADB_AMOUNT,
      ChangeProcess.LOCAL_COUNTERPART_AMOUNT,
      ChangeProcess.COFINANCING_AMOUNT,
    ];

    const isNumericChange = numericKeys.includes(updatedKey);
    const enums: Enumerator[] = keyMap[updatedKey];
    return enums
      ? this.translateEnum.translateEnum(Number(valueModified), enums)
      : isNumericChange
      ? decimalPipe.transform(+valueModified.replace(',', '.'), '1.2-2')
      : String(valueModified);
  }
}
