import { TestBed } from '@angular/core/testing';

import { FillFormService } from './fill-form.service';
import { createAddAmendmentForm } from '../components/add-amendment-form/add-amendment-form.form';
import { AmendmentLastResponse } from '@core/models';

describe('FillFormService', () => {
  let service: FillFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FillFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fill the form with the data', () => {
    const form = createAddAmendmentForm();
    const data = amendmentMock;
    const expectedResultForm = createAddAmendmentForm();

    const dateUpdateForm = service.datesObject(data);
    const lotsForm = service.lotsObject(data.biddingContractLots);
    const costDistributionForm = service.costObject(data);
    const contractAmountForm = service.amountsObject(data.currencies);
    const warrantyExtensionForm = service.warrantyObject(data.securities);

    const formObject = {
      contractObjetiveForm: data.object,
      costDistributionForm,
      dateUpdateForm,
      lotsForm,
      contractAmountForm,
      warrantyExtensionForm,
    };

    expectedResultForm.patchValue(formObject);
    service.fillFormValues(form, data);

    expect(form.get('contractObjetiveForm').value).toEqual(
      expectedResultForm.get('contractObjetiveForm').value
    );
    expect(form.get('costDistributionForm').value).toEqual(
      expectedResultForm.get('costDistributionForm').value
    );
    expect(form.get('dateUpdateForm').value).toEqual(
      expectedResultForm.get('dateUpdateForm').value
    );
    expect(form.get('lotsForm').value).toEqual(
      expectedResultForm.get('lotsForm').value
    );
    expect(form.get('contractAmountForm').value).toEqual(
      expectedResultForm.get('contractAmountForm').value
    );
    expect(form.get('warrantyExtensionForm').value).toEqual(
      expectedResultForm.get('warrantyExtensionForm').value
    );
  });

  it('should return an object with Date properties', () => {
    const data: AmendmentLastResponse = JSON.parse(
      JSON.stringify(amendmentMock)
    );
    const result = service.datesObject(data);

    expect(result).toEqual({
      endDate: new Date('2021-12-30T03:00:00'),
      signatureDate: new Date('2021-12-30T03:00:00'),
      startDate: new Date('2021-12-30T03:00:00'),
    });
  });
  it('should return a new array with the same properties', () => {
    const data: AmendmentLastResponse = JSON.parse(
      JSON.stringify(amendmentMock)
    );
    const result = service.lotsObject(data.biddingContractLots);

    expect(result).toEqual([
      {
        name: 'string',
        units: 0,
        amount: 0,
        id: 'string',
      },
    ]);
    expect(result).not.toBe(data);
  });

  it('should return an object with cost properties', () => {
    const data: AmendmentLastResponse = JSON.parse(
      JSON.stringify(amendmentMock)
    );
    const result = service.costObject(data);

    expect(result).toEqual({
      bidAmount: data.idbAmount,
      cofinancingAmount: data.cofinancedAmount,
      localCounterpartAmount: data.localCounterpartAmount,
    });
  });
  it('should return a new array with the same properties', () => {
    const data: AmendmentLastResponse = JSON.parse(
      JSON.stringify(amendmentMock)
    );

    const result = service.amountsObject(data.currencies);

    expect(result).toEqual([
      {
        currency: data.currencies[0].currency,
        totalAmount: data.currencies[0].totalAmount,
        usdEquivalentAmount: data.currencies[0].usdEquivalentAmount,
      },
    ]);
    expect(result).not.toBe(data);
  });

  it('should return a new array with the same properties and converted expiration dates', () => {
    const data: AmendmentLastResponse = JSON.parse(
      JSON.stringify(amendmentMock)
    );

    const result = service.warrantyObject(data.securities);

    expect(result).toEqual([
      {
        securityType: 0,
        currency: 'string',
        amount: 0,
        usdEquivalentAmount: 0,
        expirationDate: new Date('2021-12-30T03:00:00'),
        id: 'string',
      },
    ]);
  });
});

const amendmentMock: AmendmentLastResponse = {
  id: 'string',
  version: 0,
  name: 'string',
  object: 'string',
  status: 0,
  signatureDate: new Date('2021-12-30T03:00:00'),
  startDate: new Date('2021-12-30T03:00:00'),
  endDate: new Date('2021-12-30T03:00:00'),
  idbAmount: 0,
  localCounterpartAmount: 0,
  cofinancedAmount: 0,
  controlNumber: 'string',
  contractType: 0,
  hasAdvancedPayment: true,
  conflictResolutionMethod: 0,
  applicableLaw: 'string',
  liquidatedDamage: {
    liquidatedDamagePercentage: 0,
    liquidatedDamageMaximumPercentage: 0,
    liquidatedDamagePaymentFrecuency: 0,
    liquidatedDamageType: 0,
  },
  bonus: {
    bonusPercentage: 0,
    bonusMaximumPercentage: 0,
    bonusPaymentFrecuency: 0,
    bonusType: 0,
  },
  currencies: [
    {
      currency: 'string',
      totalAmount: 0,
      usdEquivalentAmount: 0,
      id: 'string',
    },
  ],
  biddingContractLots: [
    {
      name: 'string',
      units: 0,
      amount: 0,
      id: 'string',
    },
  ],
  securities: [
    {
      securityType: 0,
      currency: 'string',
      amount: 0,
      usdEquivalentAmount: 0,
      expirationDate: new Date('2021-12-30T03:00:00'),
      id: 'string',
    },
  ],
};
