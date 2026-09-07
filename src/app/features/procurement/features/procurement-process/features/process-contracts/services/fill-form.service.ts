import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import {
  AmendmentLastResponse,
  ContractAmountData,
  ContractSecurities,
  ContractsLotsData,
} from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class FillFormService {
  constructor() {}

  fillFormValues(form: UntypedFormGroup, data: AmendmentLastResponse): void {
    const dateUpdateForm = this.datesObject(data);
    const lotsForm = this.lotsObject(data.biddingContractLots);
    const costDistributionForm = this.costObject(data);
    const contractAmountForm = this.amountsObject(data.currencies);
    const warrantyExtensionForm = this.warrantyObject(data.securities);

    const formObject = {
      contractObjetiveForm: data.object,
      costDistributionForm,
      dateUpdateForm,
      lotsForm,
      contractAmountForm,
      warrantyExtensionForm,
    };

    form.patchValue(formObject);
  }

  datesObject(data: AmendmentLastResponse) {
    return {
      endDate: new Date(data?.endDate),
      signatureDate: new Date(data?.signatureDate),
      startDate: new Date(data?.startDate),
    };
  }

  lotsObject(data: ContractsLotsData[]): ContractsLotsData[] {
    const lotsForm: ContractsLotsData[] = [];
    data.forEach((l) => {
      const newLot = {
        amount: l.amount,
        id: l.id,
        name: l.name,
        units: l.units,
      };
      lotsForm.push(newLot);
    });
    return lotsForm;
  }

  costObject(data: AmendmentLastResponse) {
    return {
      bidAmount: data.idbAmount,
      cofinancingAmount: data.cofinancedAmount,
      localCounterpartAmount: data.localCounterpartAmount,
    };
  }

  amountsObject(data: ContractAmountData[]): ContractAmountData[] {
    const contractAmountForm: ContractAmountData[] = [];
    data.forEach((c) => {
      const newCurrencie = {
        currency: c.currency,
        totalAmount: c.totalAmount,
        usdEquivalentAmount: c.usdEquivalentAmount,
      };
      contractAmountForm.push(newCurrencie);
    });
    return contractAmountForm;
  }

  warrantyObject(data: ContractSecurities[]): ContractSecurities[] {
    const warranties: ContractSecurities[] = [];
    data.forEach((w) => {
      const newWarranty = {
        amount: w.amount,
        currency: w.currency,
        expirationDate: new Date(w.expirationDate),
        id: w.id,
        securityType: w.securityType,
        usdEquivalentAmount: w.usdEquivalentAmount,
      };
      warranties.push(newWarranty);
    });
    return warranties;
  }
}
