import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  OnDestroy,
} from '@angular/core';
import { FormType } from '@core/utils';
import {
  createLotForm,
  currencyValidator,
  defaultContractLots,
} from '../../rebrand-form/forms';
import { ContractLotsModel, Lots } from '../../rebrand-form/models';
import { FormArray, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Currency } from '@core/models';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { FormValidationService } from '@core/services/validation';
import { RContractsErrorDefinitions } from '../../rebrand-form/rebrand-form-validationKeys';
import { TranslatableError } from '../r-contract-error/r-contract-error.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-r-contracts-lots',
  templateUrl: './r-contracts-lots.component.html',
  styleUrls: ['./r-contracts-lots.component.scss'],
})
export class RContractsLotsComponent implements OnInit, OnChanges, OnDestroy {
  private readonly contractRebrandService = inject(ContractRebrandService);
  private readonly validationService = inject(FormValidationService);
  private readonly translateService = inject(TranslateService);
  private subscriptions = new Subscription();

  @Input() form: FormType<ContractLotsModel>;
  @Input() allCurrencies$: Observable<Currency[]>;
  @Input() currenciesList: { currency: string; total: number }[] = [];
  @Input() showLots: boolean;

  formErrorCollections = [];
  currencyErrors: TranslatableError[] = [];
  isSubmited = false;

  get lotsArray(): FormArray<FormType<Lots>> {
    return this.form.controls.lots;
  }

  get hasLotErrors(): boolean {
    return this.currencyErrors.length > 0;
  }

  ngOnInit(): void {
    if (!this.form) {
      this.form = defaultContractLots();
    } else {
      this.updateValidators();
    }

    this.subscriptions.add(
      this.contractRebrandService.isFormSubmitted$.subscribe((isSubmitted) => {
        this.isSubmited = isSubmitted;
        if (this.isSubmited) {
          this.formErrorCollections = this.validationService.validateForm(
            this.form,
            RContractsErrorDefinitions
          );
        }
        this.validateCurrencyTotals();
      })
    );

    this.subscriptions.add(
      this.lotsArray.valueChanges.subscribe(() => {
        this.validateCurrencyTotals();
      })
    );

    this.validateCurrencyTotals();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currenciesList'] && !changes['currenciesList'].firstChange) {
      this.updateValidators();
      this.validateCurrencyTotals();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  addLot(): void {
    this.lotsArray.push(
      createLotForm(this.currenciesList.map((c) => c.currency))
    );
    this.validateCurrencyTotals();
  }

  removeLot(index: number): void {
    this.lotsArray.removeAt(index);
    this.validateCurrencyTotals();
  }

  private updateValidators(): void {
    if (!this.lotsArray) return;

    this.lotsArray.controls.forEach((control) => {
      const currencyControl = control.controls.currency;
      currencyControl.setValidators([
        Validators.required,
        currencyValidator(this.currenciesList.map((c) => c.currency)),
      ]);
      currencyControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private validateCurrencyTotals(): void {
    // Si no hay lotes en absoluto, no hay errores
    if (!this.lotsArray || this.lotsArray.length === 0) {
      this.currencyErrors = [];
      return;
    }

    // Si no hay currenciesList configurado, no validar
    if (this.currenciesList.length === 0) {
      this.currencyErrors = [];
      return;
    }

    // Agrupar totales por moneda
    const currencyTotals = new Map<string, number>();

    this.lotsArray.controls.forEach((lotControl) => {
      const currency = lotControl.controls.currency?.value;
      const amount = lotControl.controls.amount?.value || 0;

      if (currency) {
        const currentTotal = currencyTotals.get(currency) || 0;
        currencyTotals.set(currency, currentTotal + amount);
      }
    });

    // Construir errores de validación
    const errors: TranslatableError[] = [];

    // Verificar cada moneda en currenciesList
    this.currenciesList.forEach((currencyConfig) => {
      const currentTotal = currencyTotals.get(currencyConfig.currency) || 0;
      const expectedTotal = currencyConfig.total;

      // Usar toFixed para evitar problemas de precisión de punto flotante
      const currentRounded = Number(currentTotal.toFixed(2));
      const expectedRounded = Number(expectedTotal.toFixed(2));

      if (currentRounded !== expectedRounded) {
        const difference = currentRounded - expectedRounded;
        const isExcess = difference > 0;

        // Traducir el status
        const statusKey = isExcess
          ? 'R.CONTRACT.VALIDATION.LOTS.OVER'
          : 'R.CONTRACT.VALIDATION.LOTS.UNDER';
        const statusTranslated = this.translateService.instant(statusKey);

        errors.push({
          translationKey: 'R.CONTRACT.VALIDATION.LOTS.CURRENCY_MISMATCH',
          params: {
            currency: currencyConfig.currency,
            currentTotal: this.formatNumber(currentTotal),
            expectedTotal: this.formatNumber(expectedTotal),
            difference: this.formatNumber(Math.abs(difference)),
            status: statusTranslated,
          },
        });
      }
    });

    // Verificar si hay monedas con totales que no están en currenciesList
    currencyTotals.forEach((total, currency) => {
      const currencyExists = this.currenciesList.some(
        (c) => c.currency === currency
      );

      if (!currencyExists && total > 0) {
        errors.push({
          translationKey: 'R.CONTRACT.VALIDATION.LOTS.UNEXPECTED_CURRENCY',
          params: {
            currency: currency,
            total: this.formatNumber(total),
          },
        });
      }
    });

    this.currencyErrors = errors;

    // Marcar errores en los controles individuales
    this.lotsArray.controls.forEach((lotControl) => {
      const amountControl = lotControl.controls.amount;
      const currency = lotControl.controls.currency?.value;

      if (!currency || !amountControl) return;

      const currencyConfig = this.currenciesList.find(
        (c) => c.currency === currency
      );
      const currentTotal = currencyTotals.get(currency) || 0;

      const controlErrors = amountControl.errors || {};
      delete controlErrors['currencyTotalMismatch'];

      if (currencyConfig && currentTotal !== currencyConfig.total) {
        amountControl.setErrors({
          ...controlErrors,
          currencyTotalMismatch: {
            currency,
            currentTotal,
            expectedTotal: currencyConfig.total,
            difference: currentTotal - currencyConfig.total,
          },
        });
      } else if (Object.keys(controlErrors).length === 0) {
        amountControl.setErrors(null);
      } else {
        amountControl.setErrors(controlErrors);
      }
    });
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
