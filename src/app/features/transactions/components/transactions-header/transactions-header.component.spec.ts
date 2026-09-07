import { render, screen } from '@testing-library/angular';
import { TransactionsHeaderComponent } from './transactions-header.component';
import { ProjectBalancesComponent } from '../project-balances/project-balances.component';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SelectedProjectState } from '@core/store';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { TransactionHeaderBalances } from '../../models';
import { of } from 'rxjs';

const mockSelectedProject: SelectedProjectState = {
  selectedProject: {
    nameEn: '',
    projectName: {
      en: '',
      es: '',
      fr: '',
      pt: '',
    },
    countryCode: 'CO',
    name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    executor: 'MINISTERIO DE EDUCACION NACIONAL',
    executorAcronym: 'CO-MEN',
    contract: '4902/OC-CO',
    operationNumber: 'CO-L1229',
    approvedAmount: 60000000,
    projectBucketId: '12345678',
    currentApprovedAmount: 12345,
    id: '1',
    nameEs:
      'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    nameFr:
      'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    namePt:
      'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    favorite: false,
  },
  loaded: true,
  loading: false,
  error: null,
};

describe('TransactionsHeaderComponent', () => {
  it('component should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  it('should map project balances', async () => {
    const { component } = await setup();

    component.projectBalances$.subscribe((balances) => {
      expect(balances).toEqual({
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
      });
    });
  });

  it('should map project balances when no has data', async () => {
    const initialState = getState();
    initialState.projectBalances.projectBalances = null;
    const { component } = await setup({ expandedHeader: false }, initialState);

    component.projectBalances$.subscribe((balances) => {
      expect(balances).toEqual({
        originalIdb: 0,
        currentIdb: 0,
        availableBalance: 0,
        projectedAvailableBalance: 0,
        disbursedAmount: 0,
        disbursedPercent: 0,
        lastDisbursementDate: null,
        cofinanced: 0,
        cancellations: 0,
        budgetContributionProjectedAvailableBalance: 0,
        budgetContributionAvailableBalance: 0,
        localCounterpart: 0,
        totalAmountPendingJustification: 0,
        minimumAmountPendingJustification: 0,
        toJustifyPercent: 0,
        coFinancedDisbursed: 0,
        localCounterpartDisbursed: 0,
      });

      expect(component.loading).toEqual(initialState.projectBalances.loading);
    });
  });

  describe('expandHeader', () => {
    it('should expand header when is not expanded', async () => {
      const { component } = await setup();
      component.expandHeader();

      expect(component.expandedHeader).toEqual(false);
    });
  });

  describe('loadProjectAndContract', () => {
    it('should give an observable of the contract', async () => {
      const initialState = getState();
      const { component, fixture } = await setup(
        { expandedHeader: false },
        initialState
      );

      jest
        .spyOn(component, 'loadProjectAndContract')
        .mockReturnValue(of('4902/OC-CO'));

      component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(screen.getByText('4902/OC-CO')).toBeInTheDocument();
    });
  });
});

function getState() {
  let projectBalances: TransactionHeaderBalances = {
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
    cumulativeExtension: 3,
    currentDisbExpiration: '',
    retroactiveFinancingInformation: {
      availRfAmount: 3,
      disbRfAmount: 3,
      hasRetroactiveFinancing: true,
      projAvailRfAmount: 4,
      projDisbRfAmount: 4,
      rfCurrentAmount: 4,
      rfOriginalAmount: 4,
    },
    financialPeriodDeadline: '',
    lastAdvanceOfFoundsANTAmount: 3,
    lastAdvanceOfFoundsANTDate: '',
    lastRequestNumber: 3,
  };
  return {
    projectBalances: {
      projectBalances,
      loaded: true,
      loading: false,
      error: null,
    },
    selectedProject: {
      mockSelectedProject,
    },
  } as any;
}

async function setup(
  { expandedHeader } = { expandedHeader: true },
  state = null
) {
  let initialState = {};
  if (state) {
    initialState = state;
  } else {
    initialState = getState();
  }

  const { fixture } = await render(TransactionsHeaderComponent, {
    componentProperties: {
      expandedHeader,
    },
    imports: [
      DialogModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    declarations: [ProjectBalancesComponent, IFDatePipe, IfNumberPipe],
    providers: [provideMockStore({ initialState }), DatePipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}
