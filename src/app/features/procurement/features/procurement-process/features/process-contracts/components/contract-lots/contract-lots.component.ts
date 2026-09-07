import {
  Component,
  Input,
  AfterViewInit,
  ViewChildren,
  QueryList,
  OnInit,
} from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { PermissionEnum, ModeAmendmentEnum } from '@core/enums';
import { ContractsLotsData } from '@core/models';
import { LotsFormConfig } from '@core/models/components/process-contract/lots-form-config.model';
import { WindowSizeService } from '@core/services/view';
import { AccordionPanelComponent } from '@fiduciary-interface/app/shared/components/accordion/components/accordion-panel/accordion-panel.component';
import { createContractLotsForm, createLotGroup } from './contract-lots.form';
import { FillFormService } from '../../services/fill-form.service';

@Component({
  selector: 'fi-contract-lots',
  templateUrl: './contract-lots.component.html',
})
export class ContractLotsComponent implements OnInit, AfterViewInit {
  @Input() addLotPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeLotPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() totalLotsAmount = 0;
  @Input() showLotsSection = true;

  public baseConfig: LotsFormConfig = {
    data: {
      showUnits: false,
    },
    settings: {
      disabled: false,
      status: null,
    },
  };
  public showLost = true;
  @Input() form: UntypedFormArray = createContractLotsForm();
  @Input() number: string | number = '';
  @Input() set config(config: LotsFormConfig) {
    this.baseConfig.data = { ...this.baseConfig.data, ...config.data };
    this.baseConfig.settings = {
      ...this.baseConfig.settings,
      ...config.settings,
    };
    this.validateUnitsField();

    if (this.isAmendment) {
      if (this.amendmentInfo.length > 0) {
        this.showLost = true;
      } else {
        this.showLost = false;
      }

      this.amendmentInfo.forEach(() => {
        this.addLot();
        this.removeLot(this.amendmentInfo.length);
      });
      this.lotsObject(this.amendmentInfo);
      this.removeAmendmentsValidators();
    }
  }

  @ViewChildren('lotPanel') lotPanels: QueryList<AccordionPanelComponent>;

  @Input() amendmentInfo: ContractsLotsData[] = [];
  @Input() isAmendment: boolean;
  @Input() mode: ModeAmendmentEnum;
  minAmount = 0;
  constructor(
    private readonly windowService: WindowSizeService,
    readonly fillFormSvc: FillFormService
  ) {}

  ngOnInit(): void {
    if (
      this.mode === ModeAmendmentEnum.CREATE ||
      this.mode === ModeAmendmentEnum.UPDATE
    ) {
      this.minAmount = null;
    }
  }

  ngAfterViewInit(): void {
    this.windowService.windowSizeChanged.subscribe((windowSize) => {
      if (!windowSize.mobileView) {
        this.lotPanels.toArray().forEach((panel) => (panel.open = true));
      }
    });
  }

  removeAmendmentsValidators(): void {
    if (this.isAmendment) {
      this.form.controls.forEach((control, i) => {
        control.get('name').clearValidators();
        control.get('name').updateValueAndValidity();
        control.get('amount').clearValidators();
        control.get('amount').updateValueAndValidity();
        control.get('units').clearValidators();
        control.get('units').updateValueAndValidity();

        if (this.baseConfig.settings.disabled) {
          control.get('name').setValue(this.amendmentInfo[i].name);
        }
      });
    }
  }

  validateUnitsField(): void {
    if (!this.baseConfig.data.showUnits) {
      this.form.controls.forEach((el) => {
        el.get('units').disable();
      });
    }
  }

  addLot(): void {
    this.form.push(createLotGroup());
    this.validateUnitsField();
  }

  removeLot(index: number): void {
    this.form.removeAt(index);
  }

  lotsObject(data: ContractsLotsData[]) {
    if (this.mode !== ModeAmendmentEnum.CREATE) {
      const warranties = this.fillFormSvc.lotsObject(data);
      this.form.patchValue(warranties);
    }
  }
}
