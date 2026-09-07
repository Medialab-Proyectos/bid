import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  computed,
  signal,
  OnDestroy,
} from '@angular/core';
import { FormType } from '@core/utils';
import { ContractsFeesModel, Fee } from '../../rebrand-form';
import { Observable, Subscription } from 'rxjs';
import { Currency } from '@core/models';
import { createFeeForm } from '../../rebrand-form/forms';
import { FormArray, Validators } from '@angular/forms';
import { TranslatableError } from '../r-contract-error/r-contract-error.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-r-contracts-fees',
  templateUrl: './r-contracts-fees.component.html',
  styleUrls: ['./r-contracts-fees.component.scss'],
})
export class RContractsFeesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() form: FormType<ContractsFeesModel>;
  @Input() allCurrencies$: Observable<Currency[]>;
  @Input() currenciesList: { currency: string; total: number }[] = [];
  @Input() showFees: boolean;
  @Input() isExternalAudit: boolean;

  private subscriptions = new Subscription();

  // Signals
  private feesData = signal<Fee[]>([]);
  validationErrors = signal<TranslatableError[]>([]);

  // Computed - Total acumulado
  totalCost = computed(() => {
    return this.feesData().reduce((sum, fee) => {
      return sum + (fee.subtotal || 0);
    }, 0);
  });

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    if (!this.form) {
      this.initializeForm();
    } else {
      this.updateValidators();
    }

    // Escuchar cambios en el FormArray
    this.subscriptions.add(
      this.feesArray.valueChanges.subscribe(() => {
        this.calculateUnitCosts();
        this.validateCurrencyTotals();
        this.syncSignalsWithForm();
      })
    );

    this.calculateUnitCosts();
    this.validateCurrencyTotals();
    this.syncSignalsWithForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currenciesList'] && !changes['currenciesList'].firstChange) {
      this.updateValidators();
      this.calculateUnitCosts();
      this.validateCurrencyTotals();
      this.syncSignalsWithForm();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get feesArray(): FormArray<FormType<Fee>> {
    return this.form.controls.fees;
  }

  addFee(): void {
    this.feesArray.push(createFeeForm());
    this.calculateUnitCosts();
    this.validateCurrencyTotals();
    this.syncSignalsWithForm();
  }

  removeFee(index: number): void {
    this.feesArray.removeAt(index);
    this.calculateUnitCosts();
    this.validateCurrencyTotals();
    this.syncSignalsWithForm();
  }

  private initializeForm(): void {
    this.addFee();
  }

  private updateValidators(): void {
    if (!this.feesArray) return;

    this.feesArray.controls.forEach((control) => {
      const currencyControl = control.controls.currency;
      currencyControl.setValidators([Validators.required]);
      currencyControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Calcula el costo unitario para cada fee:
   * Costo Unitario = Subtotal / Horas
   */
  private calculateUnitCosts(): void {
    if (!this.feesArray) {
      return;
    }

    this.feesArray.controls.forEach((feeControl) => {
      const hours = feeControl.controls.hours?.value || 0;
      const subtotal = feeControl.controls.subtotal?.value || 0;

      let unitCost = 0;

      if (hours > 0 && subtotal > 0) {
        unitCost = Number((subtotal / hours).toFixed(2));
      }

      feeControl.controls.usdEquivalent.setValue(unitCost, {
        emitEvent: false,
      });
    });
  }

  /**
   * Valida que la suma de subtotales por moneda sea EXACTAMENTE igual al total permitido
   */
  private validateCurrencyTotals(): void {
    // Si no hay fees en absoluto, no hay errores
    if (
      !this.feesArray ||
      this.feesArray.length === 0 ||
      this.isExternalAudit
    ) {
      this.validationErrors.set([]);
      return;
    }

    // Si no hay currenciesList configurado, no validar
    if (this.currenciesList.length === 0) {
      this.validationErrors.set([]);
      return;
    }

    // Agrupar subtotales por moneda
    const subtotalsByCurrency = new Map<string, number>();

    this.feesArray.controls.forEach((feeControl) => {
      const currency = feeControl.controls.currency?.value;
      const subtotal = feeControl.controls.subtotal?.value || 0;

      if (currency) {
        const currentTotal = subtotalsByCurrency.get(currency) || 0;
        subtotalsByCurrency.set(currency, currentTotal + subtotal);
      }
    });

    // Construir errores de validación
    const errors: TranslatableError[] = [];

    // Verificar cada moneda en currenciesList
    this.currenciesList.forEach((currencyConfig) => {
      const actualTotal = subtotalsByCurrency.get(currencyConfig.currency) || 0;
      const expectedTotal = currencyConfig.total;

      // Usar toFixed para evitar problemas de precisión de punto flotante
      const actualRounded = Number(actualTotal.toFixed(2));
      const expectedRounded = Number(expectedTotal.toFixed(2));

      if (actualRounded !== expectedRounded) {
        const difference = actualRounded - expectedRounded;
        const isOver = difference > 0;

        // Traducir el status
        const statusKey = isOver
          ? 'R.CONTRACT.VALIDATION.FEES.OVER'
          : 'R.CONTRACT.VALIDATION.FEES.UNDER';
        const statusTranslated = this.translateService.instant(statusKey);

        errors.push({
          translationKey: 'R.CONTRACT.VALIDATION.FEES.CURRENCY_MISMATCH',
          params: {
            currency: currencyConfig.currency,
            expected: this.formatNumber(expectedTotal),
            actual: this.formatNumber(actualTotal),
            difference: this.formatNumber(Math.abs(difference)),
            status: statusTranslated,
          },
        });
      }
    });

    // Verificar si hay monedas con subtotales que no están en currenciesList
    subtotalsByCurrency.forEach((total, currency) => {
      const currencyExists = this.currenciesList.some(
        (c) => c.currency === currency
      );

      if (!currencyExists && total > 0) {
        errors.push({
          translationKey: 'R.CONTRACT.VALIDATION.FEES.UNEXPECTED_CURRENCY',
          params: {
            currency: currency,
            total: this.formatNumber(total),
          },
        });
      }
    });

    this.validationErrors.set(errors);
  }

  syncSignalsWithForm(): void {
    const feesValue = this.feesArray.controls.map((control) => ({
      concept: control.controls.concept.value || '',
      hours: control.controls.hours.value || 0,
      currency: control.controls.currency.value || '',
      usdEquivalent: control.controls.usdEquivalent.value || 0,
      subtotal: control.controls.subtotal.value || 0,
    }));

    this.feesData.set(feesValue);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
