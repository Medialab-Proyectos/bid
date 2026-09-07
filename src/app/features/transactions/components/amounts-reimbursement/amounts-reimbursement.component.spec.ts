import { AmountsReimbursementComponent } from './amounts-reimbursement.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EquivalentAmountComponent } from '../equivalent-amount/equivalent-amount.component';
import {
  addTotalItemsGroup,
  createAmountReimbursementForm,
} from './amounts-reimbursement.form';
import { KendoModule } from '@fiduciary-interface/app/shared';
import { TransactionHeaderBalances } from '../../models';
import { Currency } from '@core/models';
import { RouterTestingModule } from '@angular/router/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

const balances: TransactionHeaderBalances = {
  originalIdb: 10,
  currentIdb: 10,
  availableBalance: 10,
  projectedAvailableBalance: 10,
  disbursedAmount: 10,
  disbursedPercent: 100,
  lastDisbursementDate: null,
  cofinanced: 10,
  cancellations: 10,
  budgetContributionProjectedAvailableBalance: 10,
  budgetContributionAvailableBalance: 10,
  localCounterpart: 10,
  totalAmountPendingJustification: 10,
  minimumAmountPendingJustification: 10,
  toJustifyPercent: 10,
  coFinancedDisbursed: 10,
  localCounterpartDisbursed: 10,
  cumulativeExtension: 1,
  currentDisbExpiration: '',
  financialPeriodDeadline: '',
  lastAdvanceOfFoundsANTDate: '',
  lastAdvanceOfFoundsANTAmount: 1,
  lastRequestNumber: 1,
  retroactiveFinancingInformation: null,
};

async function setup() {
  const form = createAmountReimbursementForm();

  const totalItems = addTotalItemsGroup('BID', 1, 10, 10, 10);

  form.get('selectedRequestedCurrency').setValue({
    currency: 'USD',
    isHard: true,
    isBorrowing: true,
    numberOfDecimals: 2,
  });
  (form.get('totalItems') as FormArray).push(totalItems);

  const { fixture } = await render(AmountsReimbursementComponent, {
    componentProperties: {
      form: form,
      balances: balances,
    },
    declarations: [
      AmountsReimbursementComponent,
      EquivalentAmountComponent,
      IfNumberPipe,
    ],
    imports: [
      MsalTestModule,
      HttpClientTestingModule,
      KendoModule,
      ReactiveFormsModule,
      FormsModule,
      RouterTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [provideMockStore({}), NotificationService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('AmountsReimbursementComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('checkBidExpectedBalance', () => {
    it('should setError if bid (form array position 0) expected balance is less than 0', async () => {
      const { component, fixture } = await setup();
      component.checkBidExpectedBalance();

      component.totalItems.at(0).get('requestedAmount').setValue(10);
      component.totalItems.at(0).get('equivalentCurrency').setValue(10);
      component.totalItems.at(0).get('expectedBalances').setValue(-10);

      fixture.detectChanges();
      expect(
        component.totalItems.at(0).get('expectedBalances').errors
      ).toBeTruthy();
    });
  });

  describe('formListener', () => {
    it('should set selected currency on selectedRequestedCurrency valueChange', async () => {
      const { component, fixture } = await setup();
      const currency: Currency = {
        currency: 'USD',
        isHard: true,
        isBorrowing: false,
        numberOfDecimals: 2,
      };
      component.form.get('selectedRequestedCurrency').setValue(currency);
      component.formListener();
      fixture.detectChanges();

      expect(component.selectedCurrency).toBe(currency);
    });
  });
});
