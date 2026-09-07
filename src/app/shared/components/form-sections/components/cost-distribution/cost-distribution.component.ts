import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import {
  CostDistributionData,
  createCostDistributionForm,
} from './cost-distribution.form';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { CostDistributionFormConfig } from '@core/models/components/process-contract/cost-distribution-form.config.model';
import {
  BiddingProcurementProcessSupervisionMethods,
  GroupMethodEnum,
  ModeAmendmentEnum,
} from '@core/enums';
import { mergeConfig, removeValidators } from '@core/utils';
import { BiddingContractResponse, CostDistributionModel } from '@core/models';
import { merge, Subscription } from 'rxjs';

@Component({
  selector: 'fi-cost-distribution',
  templateUrl: './cost-distribution.component.html',
})
export class CostDistributionComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  GroupMethodEnum = GroupMethodEnum;
  _amendmentInfo: CostDistributionData;
  _originalContract: BiddingContractResponse;
  placeholderBidAmount: number;
  placeholderCofinancedAmount: number;
  placeholderLocalCounterPart: number;
  disabledBidAmount: boolean;

  titleLabel: string;
  totalLabel: string;
  idbLabel: string;
  counterpartLabel: string;
  confinancingLabel: string;

  minAmount = 0;
  totalAmount: number;
  private readonly suscription = new Subscription();

  @Input() mode: string;
  @Input() form: UntypedFormGroup = createCostDistributionForm();
  @Input() number: string | number = '';
  @Input() justification: string;
  @Input() set amendmentInfo(value: CostDistributionData) {
    this._amendmentInfo = value;
    this.calculatePlaceholder();

    if (
      this.mode === ModeAmendmentEnum.READ &&
      this.baseConfig.settings.disabled
    ) {
      this.localCounterpartAmountControl.setValue(
        this._amendmentInfo.localCounterpartAmount
      );
      this.cofinancingAmountControl.setValue(
        this._amendmentInfo.cofinancingAmount
      );
      this.bidAmountControl.setValue(this._amendmentInfo.bidAmount);
      this.contractTotalAmountControl.setValue(
        this._amendmentInfo.contractTotalAmount
      );
    }
  }
  @Input() set originalContract(value: BiddingContractResponse) {
    this._originalContract = value;
    this.calculatePlaceholder();
  }
  @Input() set supervisionMethod(
    supervision: BiddingProcurementProcessSupervisionMethods
  ) {
    if (supervision === BiddingProcurementProcessSupervisionMethods.LOCAL) {
      this.disabledBidAmount = true;
      this.bidAmountControl.setValue(0);
      this.bidAmountControl.disable();
    } else {
      if (!this.baseConfig.settings.disabled) {
        this.disabledBidAmount = false;
        this.bidAmountControl.enable();
      }
    }
  }

  @Output() costCalculated = new EventEmitter<CostDistributionModel>();

  showJustification = false;
  showErrorMaximunThreshols = false;

  baseConfig: CostDistributionFormConfig = {
    data: {
      threshold: {
        min: 0,
        max: 0,
      },
      nationalBiddingThreshold: {
        min: 0,
        max: 0,
      },
      groupMethod: null,
    },
    settings: {
      disabled: false,
      status: null,
    },
  };

  /**
   * Set and update base config with config parameter
   */
  @Input() set config(config: CostDistributionFormConfig) {
    this.baseConfig.data = { ...this.baseConfig.data, ...config.data };
    this.baseConfig.settings = {
      ...this.baseConfig.settings,
      ...config.settings,
    };
    this.baseConfig = mergeConfig(this.baseConfig, config);
    this.recalculateForm();
  }

  ngOnInit(): void {
    if (
      this.mode === ModeAmendmentEnum.CREATE ||
      this.mode === ModeAmendmentEnum.UPDATE
    ) {
      this.minAmount = null;
    }
    this.calculatePlaceholder();
    this.setLabels();
    if (this._amendmentInfo) {
      removeValidators(this.form);
      this.form.controls.contractTotalAmount.setValue(null);
    }
    this.suscription.add(
      this.form.valueChanges.subscribe(() => {
        this.recalculateForm();
      })
    );

    if (this.justification) {
      this.justificationControl.setValue(this.justification, {
        emitEvent: true,
      });
      this.showAndValidateJustification(true);
    }
    this.totalAmount = this.calculateTotalAmountCostDistribution();
  }
  ngAfterViewInit(): void {
    this.subcribeCostDistribution();
  }

  calculateTotalAmountCostDistribution(): number {
    return (
      this.bidAmountControl.value +
      this.cofinancingAmountControl.value +
      this.localCounterpartAmountControl.value
    );
  }

  subcribeCostDistribution(): void {
    const obsBidAmountControl = this.bidAmountControl.valueChanges;
    const obsCofinancingAmountControl =
      this.cofinancingAmountControl.valueChanges;
    const obsLocalCounterpartAmountControl =
      this.localCounterpartAmountControl.valueChanges;

    const sub = merge(
      obsBidAmountControl,
      obsCofinancingAmountControl,
      obsLocalCounterpartAmountControl
    ).subscribe(() => {
      this.totalAmount = this.calculateTotalAmountCostDistribution();
    });
    this.suscription.add(sub);
  }

  setLabels() {
    if (!this.mode) {
      this.totalLabel = 'CONTRACT.COST_DISTRIBUTION.TOTAL_AMOUNT_OF_CONTRACT';
      this.titleLabel = 'CONTRACT.COST_DISTRIBUTION.TITLE';
      this.idbLabel = 'CONTRACT.COST_DISTRIBUTION.IADB_AMOUNT';
      this.counterpartLabel =
        'CONTRACT.COST_DISTRIBUTION.LOCAL_COUNTERPART_AMOUNT';
      this.confinancingLabel = 'CONTRACT.COST_DISTRIBUTION.COFINANCING_AMOUNT';
    } else {
      this.totalLabel = 'AMENDMENT.COST_DISTRIBUTION.TOTAL_AMOUNT';
      this.titleLabel = 'AMENDMENT.COST_DISTRIBUTION.TITLE';
      this.idbLabel = 'AMENDMENT.COST_DISTRIBUTION.IDB_AMOUNT';
      this.counterpartLabel = 'AMENDMENT.COST_DISTRIBUTION.COUNTERPART_AMOUNT';
      this.confinancingLabel = 'AMENDMENT.COST_DISTRIBUTION.COFINANCING_AMOUNT';
    }
  }

  calculatePlaceholder() {
    if (this._amendmentInfo && this._originalContract) {
      if (this._amendmentInfo.bidAmount === 0) {
        this.placeholderBidAmount = this._originalContract.idbAmount;
      } else {
        this.placeholderBidAmount = this._amendmentInfo.bidAmount;
      }

      if (this._amendmentInfo.cofinancingAmount === 0) {
        this.placeholderCofinancedAmount =
          this._originalContract.cofinancedamount;
      } else {
        this.placeholderCofinancedAmount =
          this._amendmentInfo.cofinancingAmount;
      }

      if (this._amendmentInfo.localCounterpartAmount === 0) {
        this.placeholderLocalCounterPart =
          this._originalContract.localCounterpartAmount;
      } else {
        this.placeholderLocalCounterPart =
          this._amendmentInfo.localCounterpartAmount;
      }
    } else {
      this.placeholderBidAmount = 0.0;
      this.placeholderCofinancedAmount = 0.0;
      this.placeholderLocalCounterPart = 0.0;
    }
  }

  maxThresholdExceedCQS(): void {
    this.showErrorMaximunThreshols = true;
    this.form.get('maxThresholdExceed').setErrors({ maximunExceedCQS: true });
  }

  validateDirectContract(totalSum: number) {
    if (
      this.data.groupMethod === GroupMethodEnum.DirectContractBidding &&
      totalSum > this.threshold?.max
    ) {
      this.form
        .get('maxThresholdExceedDirectContract')
        .setErrors({ maximunExceed: true });
    } else {
      this.form.get('maxThresholdExceedDirectContract').setErrors(null);
    }
  }

  recalculateForm() {
    const totalSum = this.calculateTotalSum();
    const totalControl = this.contractTotalAmountControl;
    const hasThresholds = this.threshold !== null;

    totalControl.setValue(totalSum !== null ? totalSum : null, {
      emitEvent: false,
    });
    this.validateDirectContract(totalSum);
    if (hasThresholds && this.threshold.max !== this.threshold.min) {
      if (
        this.data.groupMethod === GroupMethodEnum.NationalBidding &&
        totalSum >= this.threshold.max
      ) {
        this.showErrorMaximunThreshols = true;
        this.form.get('maxThresholdExceed').setErrors({ maximunExceed: true });
        this.setErrorMaximunThreshols(true);
      } else if (
        this.data.groupMethod === GroupMethodEnum.CQSBidding &&
        totalSum > this.threshold.max
      ) {
        this.maxThresholdExceedCQS();
      } else if (
        this.data.groupMethod === GroupMethodEnum.ShoppingBidding &&
        totalSum > this.threshold.max &&
        this.nationalBiddingThreshold &&
        totalSum <= this.nationalBiddingThreshold.max
      ) {
        this.calculateMaximun(totalSum);
        this.showAndValidateJustification(true);
      } else if (
        this.data.groupMethod === GroupMethodEnum.ShoppingBidding &&
        this.calculateMaximun(totalSum)
      ) {
        this.justificationControl.setErrors({
          nationalBiddingThresholdMaxError: true,
        });
        this.showAndValidateJustification(false);
      } else {
        this.clearError();
      }
    } else {
      this.clearError();
    }
  }

  calculateMaximun(totalSum: number): boolean {
    this.showErrorMaximunThreshols = false;
    this.form.get('maxThresholdExceed').setErrors(null);
    if (
      this.nationalBiddingThreshold !== null &&
      this.nationalBiddingThreshold.max !== undefined &&
      this.nationalBiddingThreshold.max !== 0 &&
      totalSum > this.nationalBiddingThreshold.max
    ) {
      this.showErrorMaximunThreshols = true;
      this.form.get('maxThresholdExceed').setErrors({ maximunExceed: true });
    }
    return this.showErrorMaximunThreshols;
  }

  updatedCalc(): number {
    const bidAmount = this.checkVersionAmountUpdate(
      this.bidAmountControl,
      this._amendmentInfo,
      'bidAmount'
    );
    const localCounterpartAmount = this.checkVersionAmountUpdate(
      this.localCounterpartAmountControl,
      this._amendmentInfo,
      'localCounterpartAmount'
    );
    const cofinancingAmount = this.checkVersionAmountUpdate(
      this.cofinancingAmountControl,
      this._amendmentInfo,
      'cofinancingAmount'
    );
    return bidAmount + localCounterpartAmount + cofinancingAmount;
  }

  checkVersionAmountUpdate(
    formControl: UntypedFormControl,
    amendmentInfo: CostDistributionData,
    property: string
  ): number {
    let amountReturned = 0;
    if (formControl?.value === null) {
      if (amendmentInfo[property] === 0) {
        amountReturned = 0;
      } else {
        amountReturned = amendmentInfo[property];
      }
    } else {
      amountReturned = formControl?.value;
    }
    return amountReturned;
  }

  createCalc(): number {
    const bidAmount = this.checkVersionAmountCreate(this.bidAmountControl);
    const localCounterpartAmount = this.checkVersionAmountCreate(
      this.localCounterpartAmountControl
    );
    const cofinancingAmount = this.checkVersionAmountCreate(
      this.cofinancingAmountControl
    );
    return bidAmount + localCounterpartAmount + cofinancingAmount;
  }

  checkVersionAmountCreate(formControl: UntypedFormControl): number {
    let amountReturned = 0;
    if (formControl.value === null) {
      amountReturned = 0;
    } else {
      amountReturned = formControl.value;
    }
    return amountReturned;
  }

  calculateTotalSum(): number {
    let bidAmount: number;
    let localCounterpartAmount: number;
    let cofinancingAmount: number;
    let totalAmount = 0;

    if (this._amendmentInfo) {
      if (this.mode === ModeAmendmentEnum.READ) {
        totalAmount =
          this._amendmentInfo.bidAmount +
          this._amendmentInfo.localCounterpartAmount +
          this._amendmentInfo.cofinancingAmount;
      }
      if (this.mode === ModeAmendmentEnum.UPDATE) {
        totalAmount = this.updatedCalc();
        bidAmount = this._amendmentInfo.bidAmount;
        localCounterpartAmount = this._amendmentInfo.localCounterpartAmount;
        cofinancingAmount = this._amendmentInfo.cofinancingAmount;
      } else {
        if (this.mode === ModeAmendmentEnum.CREATE) {
          totalAmount = this.createCalc();
        }
      }
    } else {
      bidAmount = this.bidAmountControl.value;
      localCounterpartAmount = this.localCounterpartAmountControl.value;
      cofinancingAmount = this.cofinancingAmountControl.value;
      totalAmount = bidAmount + localCounterpartAmount + cofinancingAmount;
    }

    this.costCalculated.emit({
      totalAmount,
      bidAmount,
      localCounterpartAmount,
      cofinancingAmount,
    });

    return totalAmount;
  }

  onChangeJustification(event): void {
    this.justificationControl.setValue(event);
  }
  showAndValidateJustification(show: boolean) {
    if (show) {
      this.showJustification = show;
      this.justificationControl.setValidators(Validators.required);
    } else {
      this.showJustification = show;
      this.justificationControl.setValidators(null);
      this.justificationControl.setErrors(null);
    }
  }

  clearError(): void {
    this.showErrorMaximunThreshols = false;
    this.form.get('maxThresholdExceed').setErrors(null);
    this.showAndValidateJustification(false);
    this.setErrorMaximunThreshols(false);
  }

  setErrorMaximunThreshols(status: boolean): void {
    if (status) {
      this.maxAmountControl.setErrors({
        nationalBiddingThresholdMaxError: true,
      });
    } else {
      this.maxAmountControl.setErrors(null);
    }
  }

  get threshold() {
    return this.baseConfig.data.threshold;
  }

  get nationalBiddingThreshold() {
    return this.baseConfig.data.nationalBiddingThreshold;
  }

  get data() {
    return this.baseConfig.data;
  }

  get settings() {
    return this.baseConfig.settings;
  }

  /**
   * Controls getters
   */

  get bidAmountControl(): UntypedFormControl {
    return this.form.get('bidAmount') as UntypedFormControl;
  }

  get cofinancingAmountControl(): UntypedFormControl {
    return this.form.get('cofinancingAmount') as UntypedFormControl;
  }

  get localCounterpartAmountControl(): UntypedFormControl {
    return this.form.get('localCounterpartAmount') as UntypedFormControl;
  }

  get contractTotalAmountControl(): UntypedFormControl {
    return this.form.get('contractTotalAmount') as UntypedFormControl;
  }

  get justificationControl(): UntypedFormControl {
    return this.form.get('justification') as UntypedFormControl;
  }

  get maxAmountControl(): UntypedFormControl {
    return this.form.get('maxAmount') as UntypedFormControl;
  }

  ngOnDestroy(): void {
    this.suscription.unsubscribe();
  }
}
