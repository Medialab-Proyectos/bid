import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CostDistributionData,
  createCostDistributionForm,
} from './cost-distribution-process.form';
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
  CostDistributionTypeEnum,
} from '@core/enums';
import { mergeConfig, removeValidators } from '@core/utils';
import { BiddingContractResponse, CostDistributionModel } from '@core/models';
import { merge, Subscription } from 'rxjs';

@Component({
  selector: 'fi-cost-distribution-process',
  templateUrl: './cost-distribution-process.component.html',
})
export class CostDistributionProcessComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  GroupMethodEnum = GroupMethodEnum;
  _amendmentInfo: CostDistributionData;
  _originalContract: BiddingContractResponse;
  placeholderBidAmount: number;
  placeholderCofinancedAmount: number;
  placeholderLocalCounterPart: number;
  disabledBidAmount: boolean;
  minAmount = 0;
  public minPercentage = 0;
  public maxPercentage = 0;
  totalAmount: number;
  public optionAmount: string = CostDistributionTypeEnum.AMOUNT;
  public optionPercentage: string = CostDistributionTypeEnum.PERCENTAGE;
  private suscription = new Subscription();
  private suscriptionAmount = new Subscription();
  private suscriptionPercentage = new Subscription();
  private subcriptionValueChange = new Subscription();

  public optionSelected = {
    option: CostDistributionTypeEnum.AMOUNT,
  };

  _form: UntypedFormGroup;

  @Input() mode: string;
  @Input() form = createCostDistributionForm();
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
      this.localCounterpartControlPercentage.setValue(0);
      this.cofinancingControlPercentage.setValue(0);
      this.bidAmountControlPercentage.setValue(0);
      this.percentageTotalAmountControl.setValue(this._amendmentInfo.bidAmount);
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
  constructor(private readonly cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (
      this.mode === ModeAmendmentEnum.CREATE ||
      this.mode === ModeAmendmentEnum.UPDATE
    ) {
      this.minAmount = null;
    }
    this.calculatePlaceholder();
    if (this._amendmentInfo) {
      removeValidators(this.form);
      this.form.controls.contractTotalAmount.setValue(0);
    }

    const sub = this.form.valueChanges.subscribe(() => {
      this.recalculateForm();
    });
    this.subcriptionValueChange.add(sub);
    if (this.justification) {
      this.justificationControl.setValue(this.justification, {
        emitEvent: true,
      });
      this.showAndValidateJustification(true);
    }
    this.totalAmount = this.calculateTotalAmountCostDistribution();
    this.calculatePercetangeAmount();
  }
  ngAfterViewInit(): void {
    this.subcribeCostDistribution();
  }

  calculatePercetangeAmount(): void {
    this.percentageTotalAmountControl.setValue(this.totalAmount);
    this.bidAmountControlPercentage.setValue(
      this.getPercentage(this.totalAmount, this.bidAmountControl.value)
    );
    this.cofinancingControlPercentage.setValue(
      this.getPercentage(this.totalAmount, this.cofinancingAmountControl.value)
    );
    this.localCounterpartControlPercentage.setValue(
      this.getPercentage(
        this.totalAmount,
        this.localCounterpartAmountControl.value
      )
    );
  }

  calculateTotalAmountCostDistribution(): number {
    return (
      this.bidAmountControl.value +
      this.cofinancingAmountControl.value +
      this.localCounterpartAmountControl.value
    );
  }

  getPercentage(totalAmount: number, amountToCalculate: number): number {
    const aux = (amountToCalculate * 100) / totalAmount;
    return aux;
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
      this.totalAmount = Number(
        this.calculateTotalAmountCostDistribution()?.toFixed(2)
      );
      this.cd.detectChanges();
      this.percentageTotalAmountControl.setValue(this.totalAmount);
      this.bidAmountControlPercentage.setValue(
        this.calculatePercentageAmount(
          this.totalAmount,
          this.bidAmountControl.value
        )
      );
      this.cofinancingControlPercentage.setValue(
        this.calculatePercentageAmount(
          this.totalAmount,
          this.cofinancingAmountControl.value
        )
      );
      this.localCounterpartControlPercentage.setValue(
        this.calculatePercentageAmount(
          this.totalAmount,
          this.localCounterpartAmountControl.value
        )
      );
    });
    this.suscriptionAmount.add(sub);
  }

  subcribeCostDistributionPercentage(): void {
    const obsBidAmountControlPercentage =
      this.bidAmountControlPercentage.valueChanges;
    const obsCofinancingAmountControlPercentage =
      this.cofinancingControlPercentage.valueChanges;
    const obsLocalCounterpartAmountControlPercentage =
      this.localCounterpartControlPercentage.valueChanges;
    const obsTotalAmountPercentage =
      this.percentageTotalAmountControl.valueChanges;

    const sub = merge(
      obsBidAmountControlPercentage,
      obsCofinancingAmountControlPercentage,
      obsLocalCounterpartAmountControlPercentage,
      obsTotalAmountPercentage
    ).subscribe(() => {
      this.totalAmount = Number(
        this.percentageTotalAmountControl.value?.toFixed(2)
      );
      this.cd.detectChanges();
      this.form.get('contractTotalAmount').setValue(this.totalAmount);
      this.bidAmountControl.setValue(
        this.calculateAmount(
          this.totalAmount,
          this.bidAmountControlPercentage.value
        )
      );
      this.cofinancingAmountControl.setValue(
        this.calculateAmount(
          this.totalAmount,
          this.cofinancingControlPercentage.value
        )
      );
      this.localCounterpartAmountControl.setValue(
        this.calculateAmount(
          this.totalAmount,
          this.localCounterpartControlPercentage.value
        )
      );

      if (
        this.bidAmountControlPercentage.value +
          this.localCounterpartControlPercentage.value +
          this.cofinancingControlPercentage.value !==
        100
      ) {
        this.percentageTotalAmountControl.setErrors({
          percentUncomplete: true,
        });
      } else {
        this.percentageTotalAmountControl.setErrors(null);
      }
    });
    this.suscriptionPercentage.add(sub);
  }

  percentageSelected(): void {
    this.suscriptionAmount.unsubscribe();
    this.suscriptionAmount = new Subscription();
    this.subcribeCostDistributionPercentage();
  }

  amountSelected(): void {
    this.suscriptionPercentage.unsubscribe();
    this.suscriptionPercentage = new Subscription();
    this.subcribeCostDistribution();
  }

  calculatePercentageAmount(total: number, amount: number): number {
    return (amount * 100) / total;
  }

  calculateAmount(total: number, percentage: number): number {
    return total * (percentage / 100);
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

  validateMinTotalAmount(totalSum: number): void {
    if (totalSum <= 0) {
      this.form.get('minTotalAmount').setErrors({ minRequired: true });
    } else {
      this.form.get('minTotalAmount').setErrors(null);
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
    this.validateMinTotalAmount(totalSum);
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

  get percentageTotalAmountControl(): UntypedFormControl {
    return this.form.get('totalAmountPercentage') as UntypedFormControl;
  }

  get cofinancingControlPercentage(): UntypedFormControl {
    return this.form.get('cofinancingAmountPercentage') as UntypedFormControl;
  }

  get localCounterpartControlPercentage(): UntypedFormControl {
    return this.form.get(
      'localCounterpartAmountPercentage'
    ) as UntypedFormControl;
  }

  get bidAmountControlPercentage(): UntypedFormControl {
    return this.form.get('bidAmountPercentage') as UntypedFormControl;
  }

  get justificationControl(): UntypedFormControl {
    return this.form.get('justification') as UntypedFormControl;
  }

  get maxAmountControl(): UntypedFormControl {
    return this.form.get('maxAmount') as UntypedFormControl;
  }

  ngOnDestroy(): void {
    this.suscription.unsubscribe();
    this.suscriptionPercentage.unsubscribe();
    this.subcriptionValueChange.unsubscribe();
    this.suscriptionAmount.unsubscribe();
  }
}
