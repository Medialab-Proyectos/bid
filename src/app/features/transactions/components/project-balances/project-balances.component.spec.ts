import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProjectBalancesComponent } from './project-balances.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { TransactionHeaderBalances } from '../../models';

function getState() {
  const projectBalances: TransactionHeaderBalances = {
    localCounterpart: 0,
    coFinancedDisbursed: 0,
    localCounterpartDisbursed: 0,
    projectedAvailableBalance: 0,
    availableBalance: 3,
    budgetContributionAvailableBalance: 4,
    budgetContributionProjectedAvailableBalance: 4,
    cancellations: 4,
    cofinanced: 3,
    cumulativeExtension: 3,
    currentDisbExpiration: '',
    currentIdb: 4,
    disbursedAmount: 4,
    disbursedPercent: 5,
    financialPeriodDeadline: '',
    lastAdvanceOfFoundsANTAmount: 6,
    lastAdvanceOfFoundsANTDate: '',
    lastDisbursementDate: new Date(),
    lastRequestNumber: 4,
    minimumAmountPendingJustification: 4,
    originalIdb: 5,
    retroactiveFinancingInformation: {
      availRfAmount: 3,
      disbRfAmount: 4,
      hasRetroactiveFinancing: true,
      projAvailRfAmount: 4,
      projDisbRfAmount: 4,
      rfCurrentAmount: 4,
      rfOriginalAmount: 4,
    },
    toJustifyPercent: 5,
    totalAmountPendingJustification: 5,
  };
  return projectBalances;
}

async function setup(
  loading = false,
  { projectBalances } = {
    projectBalances: getState(),
  }
) {
  const { fixture } = await render(ProjectBalancesComponent, {
    componentProperties: {
      projectBalances: projectBalances as any,
      loading,
    },
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      DialogModule,
      HttpClientTestingModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [IFDatePipe, DatePipe, provideMockStore({})],
    declarations: [IfNumberPipe],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ProjectBalancesComponent', () => {
  describe('projectedAvailableBudgetContribution cell behaivour', () => {
    it('Available Budget Contribution should not be shown if it has no data', async () => {
      const projectBalance = getState();
      await setup(false, { projectBalances: projectBalance });

      expect(
        screen.queryByText(/Projected Available Budget Contribution/i)
      ).not.toBeInTheDocument();
    });

    it('should not show skeleton text if data is loaded', async () => {
      await setup();

      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Skeleton text behavior', () => {
    it('should show skeleton text if data is loading', async () => {
      const { fixture } = await setup(true);

      fixture.detectChanges();
      expect(screen.getAllByTestId('skeleton')[0]).toBeInTheDocument();
    });

    it('should not show skeleton text if data is loaded', async () => {
      const { fixture } = await setup(false);
      fixture.detectChanges();
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
    });
  });
});
