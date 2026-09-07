import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import {
  ContractSecurities,
  CurrencyEnum,
  Enumerator,
  ExchangeRateResponse,
} from '@core/models';
import { ExchangeRateApiService } from '@core/services/apis';
import { Subscription, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  filter,
} from 'rxjs/operators';
import { FormType } from '@core/utils';
import {
  Contract,
  ContractAditionalInfoModel,
  GuaranteeModel,
} from '../../rebrand-form/models';
import {
  createBonusForm,
  createDamagesForm,
  createGuaranteeForm,
  defaultContractAdditionalInfo,
  MAXIMUM_PERCENTAGE_BONUS_MAXIMUM,
  MAXIMUM_PERCENTAGE_BONUS_MINIMUM,
  MAXIMUM_PERCENTAGE_DAMAGES_MAXIMUM,
  MAXIMUM_PERCENTAGE_DAMAGES_MINIMUM,
  PERCENTAGE_BONUS_MAXIMUM,
  PERCENTAGE_BONUS_MINIMUM,
  PERCENTAGE_DAMAGES_MAXIMUM,
  PERCENTAGE_DAMAGES_MINIMUM,
} from '../../rebrand-form/forms';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { NotificationGlobalService } from '../../../../../../../../shared';
import { TranslatableError } from '../r-contract-error/r-contract-error.component';
import { TranslateService } from '@ngx-translate/core';

interface CurrencyCache {
  [currencyId: string]: CurrencyEnum;
}

@Component({
  selector: 'fi-r-contracts-additional-info',
  templateUrl: './r-contracts-additional-info.component.html',
  styleUrls: ['./r-contracts-additional-info.component.scss'],
})
export class RContractsAdditionalInfoComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  private readonly notificationSvc = inject(NotificationGlobalService);
  private readonly exchangeRateApi = inject(ExchangeRateApiService);
  private readonly contractsSvc = inject(ContractRebrandService);
  private readonly translate = inject(TranslateService);

  private currencyCache: CurrencyCache = {};
  private loadingStates = new Map<number, boolean>();
  private currentContractDate: string | null = null;
  private previousCurrencies = new Map<number, string>();
  private exchangeRates = new Map<string, number>();

  @Input() biddingContractSecurityTypes: Enumerator[] = [];
  @Input() biddingContractBonusPaymentFrequency: Enumerator[] = [];
  @Input() currencies: CurrencyEnum[] = [];
  @Input() amendmentInfo: ContractSecurities[] = [];
  @Input() biddingContractLiquidatedDamageTypes: Enumerator[] = [];
  @Input() biddingContractBonusTypes: Enumerator[] = [];
  @Input() form: FormType<ContractAditionalInfoModel> =
    defaultContractAdditionalInfo();
  @Input() showDamages = true;
  @Input() showBonus = true;
  @Input() showGuarantees = true;

  readonly PERCENTAGE_DAMAGES_MINIMUM = PERCENTAGE_DAMAGES_MINIMUM;
  readonly PERCENTAGE_DAMAGES_MAXIMUM = PERCENTAGE_DAMAGES_MAXIMUM;
  readonly MAXIMUM_PERCENTAGE_DAMAGES_MINIMUM =
    MAXIMUM_PERCENTAGE_DAMAGES_MINIMUM;
  readonly MAXIMUM_PERCENTAGE_DAMAGES_MAXIMUM =
    MAXIMUM_PERCENTAGE_DAMAGES_MAXIMUM;
  readonly PERCENTAGE_BONUS_MINIMUM = PERCENTAGE_BONUS_MINIMUM;
  readonly PERCENTAGE_BONUS_MAXIMUM = PERCENTAGE_BONUS_MAXIMUM;
  readonly MAXIMUM_PERCENTAGE_BONUS_MINIMUM = MAXIMUM_PERCENTAGE_BONUS_MINIMUM;
  readonly MAXIMUM_PERCENTAGE_BONUS_MAXIMUM = MAXIMUM_PERCENTAGE_BONUS_MAXIMUM;

  ngOnInit(): void {
    this.initializeCurrencyCache();
    this.setupContractDateChanges();
    this.setupValueChanges();
    this.setupAdvancePaymentValidation();
  }

  get guarantees() {
    return this.form.controls.guarantees;
  }

  get bonus() {
    return this.form.controls.bonus;
  }

  get damages() {
    return this.form.controls.damages;
  }

  private initializeCurrencyCache(): void {
    this.currencyCache = this.currencies.reduce((cache, currency) => {
      cache[currency.currency] = currency;
      return cache;
    }, {} as CurrencyCache);
  }

  private setupContractDateChanges(): void {
    this.subscriptions.add(
      this.contractsSvc.contractSignDate$
        .pipe(
          filter((date): date is string => date !== null && date !== undefined),
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((date) => {
          this.currentContractDate = date;
          this.recalculateAllExchangeRates(date);
        })
    );
  }

  private setupValueChanges(): void {
    this.guarantees.controls.forEach((control, index) => {
      this.setupGuaranteeValueChanges(
        control as FormType<GuaranteeModel>,
        index
      );
    });
  }

  private setupGuaranteeValueChanges(
    control: FormType<GuaranteeModel>,
    index: number
  ): void {
    const currencyControl = control.controls.currency;
    const amountControl = control.controls.amount;

    if (currencyControl.value) {
      this.previousCurrencies.set(index, currencyControl.value);
    }

    this.subscriptions.add(
      combineLatest([
        currencyControl.valueChanges.pipe(distinctUntilChanged()),
        this.contractsSvc.contractSignDate$.pipe(
          filter((date): date is string => date !== null && date !== undefined),
          distinctUntilChanged()
        ),
      ])
        .pipe(
          debounceTime(300),
          switchMap(([currencyId, date]) => {
            if (!currencyId) {
              this.setLoadingState(index, false);
              return of(null);
            }
            this.setLoadingState(index, true);
            return this.fetchExchangeRate(currencyId, date, index);
          })
        )
        .subscribe({
          next: (response) => {
            if (response?.exchangeRate) {
              const currencyId = currencyControl.value;
              this.previousCurrencies.set(index, currencyId);

              const currentAmount = amountControl.value;
              if (currentAmount !== null && currentAmount !== undefined) {
                this.calculateUsdEquivalent(control);
              }
            }
            this.setLoadingState(index, false);
          },
          error: () => {
            this.setLoadingState(index, false);
          },
        })
    );

    this.subscriptions.add(
      amountControl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((amount) => {
          if (amount !== null && amount !== undefined) {
            this.calculateUsdEquivalent(control);
          }
        })
    );
  }

  private fetchExchangeRate(currencyId: string, date: string, index: number) {
    return this.exchangeRateApi.convertV2(date, currencyId).pipe(
      tap((response: ExchangeRateResponse) => {
        if (response?.exchangeRate) {
          const key = this.getExchangeRateKey(currencyId, date);
          this.exchangeRates.set(key, response.exchangeRate);
        }
      }),
      catchError((error) => {
        console.error('Error fetching exchange rate:', error);

        this.notificationSvc.showError(
          this.translate.instant(
            'R.CONTRACT.ADDITIONAL_INFO.ERROR_EXCHANGE_RATE_REVERTED'
          )
        );

        const control = this.guarantees.at(index) as FormType<GuaranteeModel>;
        const previousCurrency = this.previousCurrencies.get(index);

        if (previousCurrency) {
          control.controls.currency.setValue(previousCurrency, {
            emitEvent: false,
          });
        } else {
          control.controls.currency.setValue(null, { emitEvent: false });
        }

        return of({ exchangeRate: null } as ExchangeRateResponse);
      })
    );
  }

  private recalculateAllExchangeRates(date: string): void {
    this.guarantees.controls.forEach((control, index) => {
      const typedControl = control as FormType<GuaranteeModel>;
      const currencyId = typedControl.controls.currency.value;

      if (currencyId) {
        this.setLoadingState(index, true);

        this.fetchExchangeRate(currencyId, date, index).subscribe({
          next: (response) => {
            if (response?.exchangeRate) {
              const amount = typedControl.controls.amount.value;
              if (amount !== null && amount !== undefined) {
                this.calculateUsdEquivalent(typedControl);
              }
            }
            this.setLoadingState(index, false);
          },
          error: () => {
            this.setLoadingState(index, false);
          },
        });
      }
    });
  }

  private calculateUsdEquivalent(control: FormType<GuaranteeModel>): void {
    const currencyId = control.controls.currency.value;
    const amount = control.controls.amount.value;
    const date = this.currentContractDate;

    if (!currencyId || !date || amount === null || amount === undefined) {
      return;
    }

    const key = this.getExchangeRateKey(currencyId, date);
    const exchangeRate = this.exchangeRates.get(key);

    if (!exchangeRate) {
      return;
    }

    const currency = this.currencyCache[currencyId];
    const decimals = currency?.numberOfDecimals ?? 2;

    const usdEquivalentAmount = Number(
      (amount / exchangeRate).toFixed(decimals)
    );

    control.patchValue({ usdEquivalentAmount }, { emitEvent: false });
  }

  private getExchangeRateKey(currencyId: string, date: string): string {
    return `${currencyId}_${date}`;
  }

  private setLoadingState(index: number, loading: boolean): void {
    this.loadingStates.set(index, loading);
    const control = this.guarantees.at(index) as FormType<GuaranteeModel>;

    if (loading) {
      control.controls.amount.disable({ emitEvent: false });
      control.controls.usdEquivalentAmount.disable({ emitEvent: false });
    } else {
      control.controls.amount.enable({ emitEvent: false });
      control.controls.usdEquivalentAmount.disable({ emitEvent: false });
    }
  }

  isGuaranteeLoading(index: number): boolean {
    return this.loadingStates.get(index) ?? false;
  }

  private setupAdvancePaymentValidation(): void {
    const parentForm: FormType<Contract> = this.form
      .parent as FormType<Contract>;
    if (parentForm) {
      const hasAdvancePaymentControl =
        parentForm.controls.generalInfo.controls.hasAdvancePayment;

      if (hasAdvancePaymentControl) {
        this.subscriptions.add(
          hasAdvancePaymentControl.valueChanges
            .pipe(debounceTime(100))
            .subscribe(() => {
              this.guarantees.updateValueAndValidity();
            })
        );
      }
    }
  }

  addGuaranteeorFianzas(): void {
    const securityForm = createGuaranteeForm();
    this.guarantees.push(securityForm);
    const newIndex = this.guarantees.length - 1;
    this.setupGuaranteeValueChanges(securityForm, newIndex);

    const parentForm = this.form.parent;
    if (parentForm) {
      parentForm.updateValueAndValidity();
    }
  }

  addBonus(): void {
    if (this.bonus.length === 0) {
      this.bonus.push(createBonusForm());
    }
  }

  addLiquidatedDamage(): void {
    if (this.damages.length === 0) {
      this.damages.push(createDamagesForm());
    }
  }

  removeGuarantee(index: number): void {
    if (this.guarantees.length >= 1) {
      this.guarantees.removeAt(index);
      this.loadingStates.delete(index);
      this.previousCurrencies.delete(index);

      const newLoadingStates = new Map<number, boolean>();
      const newPreviousCurrencies = new Map<number, string>();

      this.loadingStates.forEach((value, key) => {
        if (key > index) {
          newLoadingStates.set(key - 1, value);
        } else if (key < index) {
          newLoadingStates.set(key, value);
        }
      });

      this.previousCurrencies.forEach((value, key) => {
        if (key > index) {
          newPreviousCurrencies.set(key - 1, value);
        } else if (key < index) {
          newPreviousCurrencies.set(key, value);
        }
      });

      this.loadingStates = newLoadingStates;
      this.previousCurrencies = newPreviousCurrencies;
      const parentForm = this.form.parent;
      if (parentForm) {
        parentForm.updateValueAndValidity();
      }
    }
  }

  removeBonus(): void {
    if (this.bonus.length !== 0) {
      this.bonus.removeAt(0);
    }
  }

  removeLiquidatedDamage(): void {
    if (this.damages.length !== 0) {
      this.damages.removeAt(0);
    }
  }

  getDecimalsForGuarantee(index: number): number {
    const control = this.guarantees.at(index) as FormType<GuaranteeModel>;
    const currencyId = control?.controls.currency.value;

    if (!currencyId) {
      return 2;
    }

    const currency = this.currencyCache[currencyId];
    return currency?.numberOfDecimals ?? 2;
  }

  get showAdvancePaymentError(): boolean {
    return this.advancePaymentErrors.length > 0;
  }

  get advancePaymentErrors(): TranslatableError[] {
    const parentForm = this.form.parent as FormType<Contract>;
    if (!parentForm) return [];

    const hasAdvancePayment =
      parentForm.controls.generalInfo.controls.hasAdvancePayment?.value;

    const hasError =
      hasAdvancePayment === true &&
      this.guarantees.length === 0 &&
      this.guarantees.hasError('advancePaymentRequired');

    if (!hasError) return [];

    return [
      {
        translationKey: 'EX.R_CONTRACTS_ADVANCE_PAYMENT_GUARANTEE_REQUIRED',
        params: {},
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
