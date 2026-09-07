import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { DistributionCostComponent } from './distribution-cost.component';
import { ProcurementProcessDetails } from '@core/models';

describe('DistributionCostComponent', () => {
  async function setup() {
    const { fixture } = await render(DistributionCostComponent, {
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [provideWindowSizeMock()],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    });
    const component = fixture.componentInstance;
    return { component };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call getTotals() when details input property changes', async () => {
    const { component } = await setup();
    component.details = JSON.parse(JSON.stringify(details));

    const spy = jest.spyOn(component, 'getTotals');

    component.ngOnChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should not call getTotals() when details input property is not set', async () => {
    const { component } = await setup();

    const spy = jest.spyOn(component, 'getTotals');

    component.ngOnChanges();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should calculate the correct totals for counter-part cost, bid amount, and co-financing', async () => {
    const { component } = await setup();
    component.details = JSON.parse(JSON.stringify(details));

    component.getTotals();

    expect(component.totalBidAmount).toEqual(11000);
    expect(component.totalCounterPartCost).toEqual(22000);
    expect(component.totalCofinancing).toEqual(33000);
  });
});

const details: ProcurementProcessDetails = {
  id: 'id',
  code: 'code',
  name: 'name',
  description: 'description',
  category: 'category',
  procurementMethod: 'procurementMethod',
  supervisionMethod: 'supervisionMethod',
  justification: 'justification',
  status: 'status',
  bafo: false,
  lots: 'lots',
  manualId: 'manualId',
  sepaId: 'sepaId',
  goodReference: 'goodReference',
  processStartDate: new Date('2022-12-30T03:00:00'),
  contractSignedDate: new Date('2022-12-30T03:00:00'),
  destination: 'destination',
  sustainabilityDescription: 'sustainabilityDescription',
  sustainability: 'sustainability',
  components: [],
  outputs: [],
  deliverables: [
    {
      id: 'id',
      name: 'name',
      type: 'type',
      executionWbs: 'executionWbs',
      estimatedStartDate: new Date('2022-12-30T03:00:00'),
      estimatedEndDate: new Date('2022-12-30T03:00:00'),
      actualStartDate: new Date('2022-12-30T03:00:00'),
      actualEndDate: new Date('2022-12-30T03:00:00'),
      bidEstimatedAmount: 110,
      localCounterpartAmount: 220,
      coFinancingAmount: 330,
      totalEstimatedAmount: 660,
      percentage: 100,
      bidActualCost: 1000,
      localCounterpartActualCost: 2000,
      coFinancingActualCost: 3000,
      totalActualAmount: 6000,
      currency: 'currency',
      status: 'status',
      projectTasks: [],
    },
    {
      id: 'id1',
      name: 'name1',
      type: 'type1',
      executionWbs: 'executionWbs1',
      estimatedStartDate: new Date('2022-12-30T03:00:00'),
      estimatedEndDate: new Date('2022-12-30T03:00:00'),
      actualStartDate: new Date('2022-12-30T03:00:00'),
      actualEndDate: new Date('2022-12-30T03:00:00'),
      bidEstimatedAmount: 1100,
      localCounterpartAmount: 2200,
      coFinancingAmount: 3300,
      totalEstimatedAmount: 6600,
      percentage: 100,
      bidActualCost: 10000,
      localCounterpartActualCost: 20000,
      coFinancingActualCost: 30000,
      totalActualAmount: 60000,
      currency: 'currency',
      status: 'status',
      projectTasks: [],
    },
  ],
  biddingMilestones: [],
  comments: [],
  componentHistories: [],
  documentPackages: [],
};
