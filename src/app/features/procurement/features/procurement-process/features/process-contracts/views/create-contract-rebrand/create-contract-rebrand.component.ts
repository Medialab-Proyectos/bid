import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnumsStoreService } from '@core/services/store-services';
import { filter, forkJoin, map, take } from 'rxjs';
import {
  Currency,
  CurrencyEnum,
  Enumerator,
  Enums,
  LocationEnums,
} from '@core/models';
import { EnumState } from '@core/store';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';

@Component({
  selector: 'fi-create-contract-rebrand',
  templateUrl: './create-contract-rebrand.component.html',
  styleUrls: ['./create-contract-rebrand.component.scss'],
})
export class CreateContractRebrandComponent implements OnInit {
  private readonly enumStoreSvc = inject(EnumsStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contractsFormSvc = inject(ContractFormCompleteService);

  biddingContractTypes: Enumerator[] = [];
  biddingContractConflictResolutionMethods: Enumerator[] = [];
  memberCountries: Enumerator[];
  biddingContractSecurityTypes: Enumerator[];
  biddingContractBonusPaymentFrequency: Enumerator[];
  biddingContractLiquidatedDamageTypes: Enumerator[];
  biddingContractBonusTypes: Enumerator[];
  currencies: CurrencyEnum[] = [];

  ngOnInit(): void {
    this.loadEnums();
  }

  private loadEnums(): void {
    forkJoin({
      enums: this.enumStoreSvc
        .selectEnums()
        .pipe(
          filter(this.areRequiredEnumsLoaded),
          take(1),
          map(this.extractRequiredEnums)
        ),
      currencies: this.contractsFormSvc.commonApi.getCurrencies().pipe(
        map((currencies: Currency[]) =>
          currencies.map((item) => ({
            id: item.currency,
            currency: item.currency,
            numberOfDecimals: item.numberOfDecimals,
            exchangeRate: null,
          }))
        )
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ enums, currencies }) => {
        this.biddingContractTypes = enums.biddingContractTypes;
        this.biddingContractConflictResolutionMethods =
          enums.biddingContractConflictResolutionMethods;
        this.memberCountries = enums.memberCountries;
        this.biddingContractSecurityTypes = enums.biddingContractSecurityTypes;
        this.biddingContractBonusPaymentFrequency =
          enums.biddingContractBonusPaymentFrequency;
        this.biddingContractLiquidatedDamageTypes =
          enums.biddingContractLiquidatedDamageTypes;
        this.biddingContractBonusTypes = enums.biddingContractBonusTypes;

        this.currencies = currencies;
      });
  }

  private areRequiredEnumsLoaded(enums: EnumState): boolean {
    return (
      enums.enumsLoaded[Enums.biddingContractTypes] &&
      enums.enumsLoaded[Enums.biddingContractConflictResolutionMethods] &&
      enums.enumsLoaded[LocationEnums.memberCountries] &&
      enums.enumsLoaded[Enums.biddingContractSecurityTypes] &&
      enums.enumsLoaded[Enums.biddingContractLiquidatedDamageTypes] &&
      enums.enumsLoaded[Enums.biddingContractBonusTypes]
    );
  }

  private extractRequiredEnums(enums: EnumState) {
    return {
      biddingContractTypes: enums.biddingContractTypes,
      biddingContractConflictResolutionMethods:
        enums.biddingContractConflictResolutionMethods,
      memberCountries: enums.memberCountries,
      biddingContractSecurityTypes: enums.biddingContractSecurityTypes,
      biddingContractBonusPaymentFrequency:
        enums.biddingContractBonusPaymentFrequency,
      biddingContractLiquidatedDamageTypes:
        enums.biddingContractLiquidatedDamageTypes,
      biddingContractBonusTypes: enums.biddingContractBonusTypes,
    };
  }
}
