import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AccordionModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { render, screen } from '@testing-library/angular';
import { CostDistributionProcessComponent } from './cost-distribution-process.component';
import { createCostDistributionForm } from './cost-distribution-process.form';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import {
  BiddingProcurementProcessSupervisionMethods,
  CostDistributionTypeEnum,
  GroupMethodEnum,
  ModeAmendmentEnum,
} from '@core/enums';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { provideMockStore } from '@ngrx/store/testing';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

describe('CostDistributionProcessComponent', () => {
  it('should render the component', async () => {
    await setup();
  });

  it('bidAmount field validity', async () => {
    const form = await (await setup()).formValues;
    let bidAmount = form.bidAmount;
    expect(bidAmount).toEqual(11000);
  });

  it('localCounterpartAmount field validity', async () => {
    const form = await (await setup()).formValues;
    let localCounterpartAmount = form.localCounterpartAmount;
    expect(localCounterpartAmount).toEqual(12000);
  });

  it('cofinancingAmount field validity', async () => {
    const form = await (await setup()).formValues;
    let cofinancingAmount = form.cofinancingAmount;
    expect(cofinancingAmount).toEqual(13000);
  });

  it('contractTotalAmount has the sum value of bidAmount, localCounterpartAmount and cofinancingAmount', async () => {
    const form = await (await setup()).formValues;
    const contractTotalAmountField = form.contractTotalAmount;
    const bidAmountField = form.bidAmount;
    const localCounterpartAmountField = form.localCounterpartAmount;
    const cofinancingAmountField = form.cofinancingAmount;

    expect(
      bidAmountField + localCounterpartAmountField + cofinancingAmountField
    ).toBe(contractTotalAmountField);
  });

  it('should return true', async () => {
    const form = await (await setup()).formValues;
    const contractTotalAmountField = form.contractTotalAmount;
    const threshold = { min: 10000, max: 30000 };

    let state = Number(contractTotalAmountField) > threshold.max;
    expect(state).toBe(true);
  });

  describe('when group method is InternationalBidding', () => {
    it('should show max threshold error', async () => {
      const { fixture, form } = await setupForThreshold(
        0,
        30000,
        GroupMethodEnum.InternationalBidding
      );

      form.get('bidAmount').setValue(11000);
      form.get('localCounterpartAmount').setValue(12000);
      form.get('cofinancingAmount').setValue(13000);
      fixture.detectChanges();
      const errorMessage = screen.getByText(
        /Contract total amount is higher than the threshold defined for the country or the operation./i
      );

      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('when group method is InternationalBidding or NationalBidding or ShoppingBidding', () => {
    it('should show min threshold error', async () => {
      const { fixture, form } = await setupForThreshold(
        7000,
        30001,
        GroupMethodEnum.InternationalBidding
      );
      form.get('bidAmount').setValue(1000);
      form.get('localCounterpartAmount').setValue(2000);
      form.get('cofinancingAmount').setValue(3000);
      fixture.detectChanges();
      const errorMessage = screen.getByText(
        /Contract total amount is lower than the threshold defined for the country or the operation./i
      );
      expect(errorMessage).toBeInTheDocument();
    });

    it('should show min threshold error', async () => {
      const { fixture, form } = await setupForThreshold(
        7000,
        30001,
        GroupMethodEnum.NationalBidding
      );

      form.get('bidAmount').setValue(1000);
      form.get('localCounterpartAmount').setValue(2000);
      form.get('cofinancingAmount').setValue(3000);
      fixture.detectChanges();
      const errorMessage = screen.getByText(
        /Contract total amount is lower than the threshold defined for the country or the operation./i
      );
      expect(errorMessage).toBeInTheDocument();
    });

    it('should show min threshold error', async () => {
      const { fixture, form } = await setupForThreshold(
        7000,
        30001,
        GroupMethodEnum.ShoppingBidding
      );
      form.get('bidAmount').setValue(1000);
      form.get('localCounterpartAmount').setValue(2000);
      form.get('cofinancingAmount').setValue(3000);
      fixture.detectChanges();
      const errorMessage = screen.getByText(
        /Contract total amount is lower than the threshold defined for the country or the operation./i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should show error when group method be "ShoppingBidding" and total amount is higher than max threshold of "NationalBidding"', async () => {
    const { fixture, form } = await setupForThresholdWithNationalBidding(
      7000,
      30001,
      8000,
      35000,
      GroupMethodEnum.ShoppingBidding
    );
    form.get('bidAmount').setValue(15000);
    form.get('localCounterpartAmount').setValue(15000);
    form.get('cofinancingAmount').setValue(5001);

    fixture.detectChanges();
    const errorMessage = screen.getByText(
      /The total estimated amount is higher than the defined threshold for this operation. Please select a value inside the allowed maximum threshold./i
    );

    expect(errorMessage).toBeInTheDocument();
  });

  describe('when group method be "ShoppingBidding" and total amount is higher than max threshold and lower than "NationalBidding" max threshold', () => {
    it('should show warning', async () => {
      const { fixture, form } = await setupForThresholdWithNationalBidding(
        7000,
        30001,
        8000,
        35005,
        GroupMethodEnum.ShoppingBidding
      );
      form.get('bidAmount').setValue(15000);
      form.get('localCounterpartAmount').setValue(15000);
      form.get('cofinancingAmount').setValue(5001);

      fixture.detectChanges();
      const errorMessage = screen.getByText(
        /The total estimated amount is higher than the defined threshold for this operation. Please include a justification if you want to keep this value./i
      );

      expect(errorMessage).toBeInTheDocument();
    });

    it('should show justification field', async () => {
      const { fixture, form } = await setupForThresholdWithNationalBidding(
        7000,
        30001,
        8000,
        35005,
        GroupMethodEnum.ShoppingBidding
      );

      form.get('bidAmount').setValue(15000);
      form.get('localCounterpartAmount').setValue(15000);
      form.get('cofinancingAmount').setValue(5001);

      fixture.detectChanges();
      expect(screen.getByTestId('justification')).toBeInTheDocument();
    });
  });

  it('should set config', async () => {
    const { component } = await setup();
    const config = {
      data: {
        threshold: {
          min: 7000,
          max: 30000,
        },
      },
      settings: {
        disabled: true,
        status: null,
      },
    };
    component.config = config;
    expect(component.baseConfig.data.threshold).toEqual(config.data.threshold);
  });

  it('should hide justification field if no has thresholds', async () => {
    const { component } = await setupWithConfig();
    component.baseConfig.data.threshold = null;

    const setValidatorsSpy = jest.spyOn(
      component.justificationControl,
      'setValidators'
    );

    component.recalculateForm();

    expect(component.justificationControl.value).toBe('');
    expect(component.showJustification).toBe(false);
    expect(setValidatorsSpy).toHaveBeenCalled();
  });

  it('should fill values on edit amendment', async () => {
    const { component } = await setupEditAmendment();
    expect(component.cofinancingAmountControl.value).toBe(20000);
    expect(component.localCounterpartAmountControl.value).toBe(30000);
    expect(component.bidAmountControl.value).toBe(10000);
  });

  it('should call the calculatePlaceholder on set originalContract info', async () => {
    const { component } = await setupEditAmendment();
    const spy = jest.spyOn(component, 'calculatePlaceholder');
    component.originalContract = mockOriginalContract;
    expect(spy).toHaveBeenCalled();
  });

  describe('supervision method control', () => {
    it('should disable BID amount on supervision Method local', async () => {
      const { component } = await setupEditAmendment();
      const spy = jest.spyOn(component.bidAmountControl, 'disable');
      component.supervisionMethod =
        BiddingProcurementProcessSupervisionMethods.LOCAL;
      expect(spy).toHaveBeenCalled();
      expect(component.disabledBidAmount).toBe(true);
    });
    it('should ENABLE BID amount on NOT supervision Method local', async () => {
      const { component } = await setupEditAmendment();
      const spy = jest.spyOn(component.bidAmountControl, 'enable');
      component.baseConfig.settings.disabled = false;
      component.supervisionMethod =
        BiddingProcurementProcessSupervisionMethods.EXTERNAL_AUDIT;
      expect(spy).toHaveBeenCalled();
      expect(component.disabledBidAmount).toBe(false);
    });
  });

  describe('update the percentage amounts', () => {
    it('should update bidAmountControlPercentage', async () => {
      const { component, fixture } = await setupListenChanges();
      component.bidAmountControl.setValue(30);
      fixture.detectChanges();
      component.cofinancingAmountControl.setValue(30);
      fixture.detectChanges();
      component.localCounterpartAmountControl.setValue(40);
      fixture.detectChanges();
      component.percentageSelected();
      component.optionSelected = {
        option: CostDistributionTypeEnum.PERCENTAGE,
      };
      fixture.detectChanges();
      expect(component.bidAmountControlPercentage.getRawValue()).toBe(30);
    });

    it('should update amount on change of totalAmount and percentage option selected', async () => {
      const { component, fixture } = await setupListenChanges();
      component.bidAmountControl.setValue(30);
      fixture.detectChanges();
      component.cofinancingAmountControl.setValue(30);
      fixture.detectChanges();
      component.localCounterpartAmountControl.setValue(40);
      fixture.detectChanges();
      component.percentageSelected();
      component.optionSelected = {
        option: CostDistributionTypeEnum.PERCENTAGE,
      };
      fixture.detectChanges();
      component.amountSelected();
      component.optionSelected = {
        option: CostDistributionTypeEnum.AMOUNT,
      };
      expect(component.bidAmountControlPercentage.getRawValue()).toBe(30);
    });
  });

  describe('on change config', () => {
    it('should call recalculateForm', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component, 'recalculateForm');
      component.amendmentInfo = {
        bidAmount: 10000,
        localCounterpartAmount: 30000,
        cofinancingAmount: 20000,
        contractTotalAmount: 0,
        justification: '',
      };
      component.mode = ModeAmendmentEnum.UPDATE;
      component.config = {
        data: {
          threshold: {
            min: 3000000,
            max: 10000,
          },
          nationalBiddingThreshold: null,
          groupMethod: GroupMethodEnum.NationalBidding,
        },
        settings: {
          disabled: false,
          status: null,
        },
      };
      expect(spy).toHaveBeenCalled();
    });
    it('should call createCalc', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component, 'createCalc');
      component.amendmentInfo = {
        bidAmount: 10000,
        localCounterpartAmount: 30000,
        cofinancingAmount: 20000,
        contractTotalAmount: 0,
        justification: '',
      };
      component.mode = ModeAmendmentEnum.CREATE;
      component.config = {
        data: {
          threshold: {
            min: 3000000,
            max: 10000,
          },
          nationalBiddingThreshold: null,
          groupMethod: GroupMethodEnum.NationalBidding,
        },
        settings: {
          disabled: false,
          status: null,
        },
      };
      expect(spy).toHaveBeenCalled();
    });
  });
});

async function setupForThreshold(min, max, groupMethod: GroupMethodEnum) {
  const form = createCostDistributionForm();
  const formValues = {
    contractTotalAmount: 0,
    bidAmount: 0,
    bidAmountPercentage: 30,
    localCounterpartAmount: 0,
    localCounterpartAmountPercentage: 30,
    cofinancingAmount: 0,
    cofinancingAmountPercentage: 40,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
    totalAmountPercentage: 100,
    minTotalAmount: 1,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionProcessComponent, {
    componentProperties: {
      form: form,
      number: 3,
      baseConfig: {
        data: {
          threshold: { min, max },
          nationalBiddingThreshold: { min, max },
          groupMethod,
        },
        settings: {
          disabled: true,
          status: null,
        },
      },
    },
    imports: [
      DirectivesModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DateInputsModule,
      AccordionModule,
      NotificationModule,
      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });

  return {
    fixture,
    formValues,
    form,
  };
}

async function setupForThresholdWithNationalBidding(
  min,
  max,
  nationalBiddingMin,
  nationalBiddingMax,
  groupMethod: GroupMethodEnum
) {
  const form = createCostDistributionForm();
  const formValues = {
    contractTotalAmount: 0,
    bidAmount: 0,
    bidAmountPercentage: 30,
    localCounterpartAmount: 0,
    localCounterpartAmountPercentage: 30,
    cofinancingAmount: 0,
    cofinancingAmountPercentage: 40,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
    totalAmountPercentage: 100,
    minTotalAmount: 1,
  };
  form.patchValue(formValues);

  const { fixture } = await render(CostDistributionProcessComponent, {
    componentProperties: {
      form: form,
      number: 3,
      baseConfig: {
        data: {
          threshold: { min, max },
          nationalBiddingThreshold: {
            min: nationalBiddingMin,
            max: nationalBiddingMax,
          },
          groupMethod,
        },
        settings: {
          disabled: true,
          status: null,
        },
      },
    },
    imports: [
      DirectivesModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DateInputsModule,
      AccordionModule,
      NotificationModule,
      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });

  return {
    fixture,
    formValues,
    form,
  };
}

async function setup() {
  const form = createCostDistributionForm();
  const formValues = {
    contractTotalAmount: 36000,
    bidAmount: 11000,
    bidAmountPercentage: 30,
    localCounterpartAmount: 12000,
    localCounterpartAmountPercentage: 30,
    cofinancingAmount: 13000,
    cofinancingAmountPercentage: 40,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
    totalAmountPercentage: 100,
    minTotalAmount: 1,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionProcessComponent, {
    componentProperties: {
      form: form,
      number: 3,
      baseConfig: {
        data: {
          threshold: { min: 10000, max: 30000 },
          nationalBiddingThreshold: { min: 10000, max: 30001 },
          groupMethod: null,
        },
        settings: {
          disabled: true,
          status: null,
        },
      },
    },
    imports: [
      DirectivesModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DateInputsModule,
      AccordionModule,
      NotificationModule,
      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return {
    component,
    formValues,
  };
}

async function setupWithConfig() {
  const form = createCostDistributionForm();
  const formValues = {
    contractTotalAmount: 0,
    bidAmount: 0,
    bidAmountPercentage: 30,
    localCounterpartAmount: 0,
    localCounterpartAmountPercentage: 30,
    cofinancingAmount: 0,
    cofinancingAmountPercentage: 40,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
    totalAmountPercentage: 100,
    minTotalAmount: 1,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionProcessComponent, {
    componentProperties: {
      form: form,
      number: 3,
      amendmentInfo: {
        bidAmount: 0,
        localCounterpartAmount: 0,
        cofinancingAmount: 0,
        contractTotalAmount: 0,
        justification: '',
      },
    },
    imports: [
      DirectivesModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DateInputsModule,
      AccordionModule,
      NotificationModule,
      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });

  const component = fixture.componentInstance;
  return {
    component,
    fixture,
    formValues,
    form,
  };
}

const mockOriginalContract = {
  biddingProcurementProcessId: 'asdasdsad',
  amendmentsTotalAmount: 10000,
  name: 'name',
  object: 'string',
  signatureDate: new Date(),
  startDate: new Date(),
  endDate: new Date(),
  controlNumber: 'string',
  contractType: 2,
  hasAdvancedPayment: true,
  conflictResolutionMethod: 2,
  applicableLaw: 'string',
  goodsSource: 2,
  contractStatus: 0,
  contractTotalAmount: 2,
  idbAmount: 3,
  localCounterpartAmount: 3,
  cofinancedamount: 4,
  justification: 'string',
  liquidatedDamagePercentage: 4,
  liquidatedDamageMaximumPercentage: 5,
  bonusPercentage: 5,
  bonusMaximumPercentage: 6,
  liquidatedDamageType: 7,
  bonusType: 7,
  liquidatedDamagePaymentFrecuency: 8,
  bonusPaymentFrecuency: 8,
  code: 'string',
  version: 9,
  contractTypeDesignation: '',
};

async function setupEditAmendment() {
  const form = createCostDistributionForm();
  const formValues = {
    contractTotalAmount: 36000,
    bidAmount: 11000,
    bidAmountPercentage: 30,
    localCounterpartAmount: 12000,
    localCounterpartAmountPercentage: 30,
    cofinancingAmount: 13000,
    cofinancingAmountPercentage: 40,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
    totalAmountPercentage: 100,
    minTotalAmount: 0,
  };
  form.setValue(formValues);
  const { fixture } = await render(CostDistributionProcessComponent, {
    componentProperties: {
      mode: ModeAmendmentEnum.READ,
      form: form,
      number: 3,
      baseConfig: {
        data: {
          threshold: { min: 10000, max: 30000 },
          nationalBiddingThreshold: { min: 10000, max: 30001 },
          groupMethod: null,
        },
        settings: {
          disabled: true,
          status: null,
        },
      },
      amendmentInfo: {
        bidAmount: 10000,
        localCounterpartAmount: 30000,
        cofinancingAmount: 20000,
        contractTotalAmount: 0,
        justification: '',
      },
      originalContract: mockOriginalContract,
    },
    imports: [
      DirectivesModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DateInputsModule,
      AccordionModule,
      NotificationModule,
      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return {
    component,
    formValues,
  };
}

async function setupListenChanges() {
  const form = createCostDistributionForm();
  const formValues = {
    bidAmount: null,
    bidAmountPercentage: NaN,
    cofinancingAmount: null,
    cofinancingAmountPercentage: NaN,
    contractTotalAmount: 0,
    justification: '',
    localCounterpartAmount: null,
    localCounterpartAmountPercentage: NaN,
    maxAmount: '',
    maxThresholdExceed: '',
    maxThresholdExceedDirectContract: '',
    totalAmountPercentage: 0,
    minTotalAmount: 0,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionProcessComponent, {
    componentProperties: {
      form: form,
      number: 3,
      baseConfig: {
        data: {
          threshold: { min: 0, max: 0 },
          nationalBiddingThreshold: { min: 0, max: 0 },
          groupMethod: null,
        },
        settings: {
          disabled: false,
          status: null,
        },
      },
      disabledBidAmount: false,
      optionSelected: {
        option: CostDistributionTypeEnum.AMOUNT,
      },
    },
    imports: [
      DirectivesModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      DateInputsModule,
      AccordionModule,
      NotificationModule,
      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return {
    component,
    fixture,
  };
}
