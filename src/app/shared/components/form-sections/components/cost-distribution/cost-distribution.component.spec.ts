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
import { CostDistributionComponent } from './cost-distribution.component';
import { createCostDistributionForm } from './cost-distribution.form';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { GroupMethodEnum } from '@core/enums';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MockFiMatNumericComponent } from '../../../../../../test/test-helpers';

describe('CostDistributionComponent', () => {
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

  /* it('should show justification field when group method be "NationalBidding" and total amount is higher than max threshold', async () => {
    const { fixture, form } = await setupForThresholdWithNationalBidding(
      7000,
      30001,
      0,
      0,
      GroupMethodEnum.NationalBidding
    );
    form.get('bidAmount').setValue(15000);
    form.get('localCounterpartAmount').setValue(15000);
    form.get('cofinancingAmount').setValue(2);

    fixture.detectChanges();

    expect(screen.getByTestId('justification')).toBeInTheDocument();
  }); */

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
});

async function setupForThreshold(min, max, groupMethod: GroupMethodEnum) {
  const form = createCostDistributionForm();
  const formValues = {
    contractTotalAmount: 0,
    bidAmount: 0,
    localCounterpartAmount: 0,
    cofinancingAmount: 0,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionComponent, {
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
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,
      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe, MockFiMatNumericComponent],
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
    localCounterpartAmount: 0,
    cofinancingAmount: 0,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionComponent, {
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
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,

      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe, MockFiMatNumericComponent],
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
    localCounterpartAmount: 12000,
    cofinancingAmount: 13000,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionComponent, {
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
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,

      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe, MockFiMatNumericComponent],
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
    localCounterpartAmount: 0,
    cofinancingAmount: 0,
    justification: '',
    maxAmount: 0,
    maxThresholdExceed: 0,
    maxThresholdExceedDirectContract: 0,
  };
  form.setValue(formValues);

  const { fixture } = await render(CostDistributionComponent, {
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
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,

      TranslateModule.forRoot(),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, provideMockStore({})],
    declarations: [IfNumberPipe, MockFiMatNumericComponent],
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
