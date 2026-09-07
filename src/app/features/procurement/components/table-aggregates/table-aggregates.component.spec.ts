import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TableAggregatesComponent } from './table-aggregates.component';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { BiddingProcesses, BiddingProcessPlan } from '@core/models';
import {
  BiddingProcessProcurementProcessStatuses,
  ProcessActions,
} from '@core/enums';
import { ProcurementColumnName } from '../../enums';
import { GridSettings } from '@fiduciary-interface/app/shared/services/localStorage/models/grid-settings.model';
import { process } from '@progress/kendo-data-query';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { DialogService } from '@progress/kendo-angular-dialog';
import { ModalService } from '@fiduciary-interface/app/shared';
import { NotificationService } from '@progress/kendo-angular-notification';
import { DialogModule } from '@progress/kendo-angular-dialog';

const biddingProcessPlan: BiddingProcessPlan = {
  id: '123',
  projectBucketId: '123',
  version: 0,
  status: BiddingProcessProcurementProcessStatuses.DRAFT,
  approvedDate: 'string',
  approvedBy: 'string',
};

const initialState = {
  biddingProcessPlan: {
    biddingProcessPlan: { ...biddingProcessPlan },
  },
};

const procurementPlanCollection: BiddingProcesses[] = [
  {
    id: 'processId1',
    name: 'Uno',
    description: 'string',
    category: {
      id: 1,
      name: 'string',
    },
    categoryEnum: {
      id: 0,
      name: 'string',
    },
    procurementMethod: {
      id: 1,
      name: 'string',
    },
    procurementMethodEnum: {
      id: 0,
      name: 'string',
    },
    supervisionMethod: {
      id: 1,
      name: 'string',
    },
    supervisionMethodEnum: {
      id: 0,
      name: 'string',
    },
    justification: 'string',
    status: BiddingProcessProcurementProcessStatuses.DRAFT,
    statusEnum: {
      id: 0,
      name: 'string',
    },
    bafo: 'string',
    lots: 0,
    manualId: 'string',
    sepaId: 'string',
    goodReference: 'string',
    processStartDate: 'string',
    contractSignedDate: 'string',
    destination: 'string',
    sustainabilityDescription: 'string',
    sustainability: 'string',
    components: 'string',
    outputs: [],
    deliverables: [],
    biddingMilestones: [],
    comments: [],
    componentHistories: [],
    documentPackages: [],
    created: 'string',
    createdBy: 'string',
    modified: 'string',
    modifiedBy: 'string',
    totalAmount: 0,
    code: 'processId1',
    totalComments: 0,

    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    subExecutor: 'string',
    projectAmount: {
      cofinancedAmount: 0,
      localCounterpartAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      costJustification: 'string',
    },
    componentName: 'string',
    crudActions: ['string'],
    progress: 'string',
    isMigrated: true,
    packagesUnderReview: true,
    estimatedAmountString: '1000',
    isUpdated: true,
    milestonesDelayed: 'string',
    marked: false,
    order: 4,
  },
  {
    id: 'processId2',
    name: 'Dos',
    description: 'string',
    category: {
      id: 1,
      name: 'string',
    },
    categoryEnum: {
      id: 0,
      name: 'string',
    },
    procurementMethod: {
      id: 1,
      name: 'string',
    },
    procurementMethodEnum: {
      id: 0,
      name: 'string',
    },
    supervisionMethod: {
      id: 1,
      name: 'string',
    },
    supervisionMethodEnum: {
      id: 0,
      name: 'string',
    },
    justification: 'string',
    status: BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION,
    statusEnum: {
      id: 0,
      name: 'string',
    },
    bafo: 'string',
    lots: 0,
    manualId: 'string',
    sepaId: 'string',
    goodReference: 'string',
    processStartDate: 'string',
    contractSignedDate: 'string',
    destination: 'string',
    sustainabilityDescription: 'string',
    sustainability: 'string',
    components: 'string',
    outputs: [],
    deliverables: [],
    biddingMilestones: [],
    comments: [],
    componentHistories: [],
    documentPackages: [],
    created: 'string',
    createdBy: 'string',
    modified: 'string',
    modifiedBy: 'string',
    totalAmount: 0,
    code: 'processId2',
    totalComments: 0,

    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    subExecutor: 'string',
    projectAmount: {
      cofinancedAmount: 0,
      localCounterpartAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      costJustification: 'string',
    },
    componentName: 'string',
    crudActions: ['string'],
    progress: 'string',
    isMigrated: true,
    packagesUnderReview: true,
    estimatedAmountString: '1000',
    isUpdated: true,
    milestonesDelayed: 'string',
    marked: false,
    order: 5,
  },
];

const gridSettings: GridSettings = {
  state: {
    filter: {
      logic: 'and',
      filters: [],
    },
  },
  gridData: process(procurementPlanCollection, {
    filter: {
      logic: 'and',
      filters: [],
    },
  }),
  columnsConfig: [
    {
      field: ProcurementColumnName.code,
      title: 'Id',
      filterable: false,
      width: 182,
    },
    {
      field: ProcurementColumnName.name,
      title: 'Name',
      filterable: false,
      width: 230,
    },
    {
      field: ProcurementColumnName.componentName,
      title: 'Component',
      filterable: false,
      width: 230,
    },
    {
      field: ProcurementColumnName.projectAmountEstimatedAmount,
      title: 'Estimated amound',
      width: 170,
      filterable: false,
    },
    {
      field: ProcurementColumnName.statusTranslation,
      title: 'Status',
      width: 120,
      filterable: false,
    },
    {
      field: ProcurementColumnName.advanceMilestoneTotalCompleted,
      title: 'Progress',
      filterable: false,
      width: 85,
    },
    {
      field: ProcurementColumnName.categoryTranslation,
      title: 'Category',
      filterable: false,
      width: 100,
      hidden: true,
    },
    {
      field: ProcurementColumnName.procurementMethodTranslation,
      title: 'Aquisition method',
      filterable: false,
      width: 100,
      hidden: true,
    },
    {
      field: ProcurementColumnName.supervisionMethodTranslation,
      title: 'Monitoring method',
      filterable: false,
      width: 100,
      hidden: true,
    },
    {
      field: ProcurementColumnName.totalComments,
      title: 'Comment',
      filterable: false,
      width: 105,
    },
  ],
};

async function setup() {
  const { fixture } = await render(TableAggregatesComponent, {
    componentProperties: {
      procurementPlanCollection: procurementPlanCollection,
      gridData: procurementPlanCollection,
      gridView: procurementPlanCollection,
      gridSettings,
    },
    declarations: [TableAggregatesComponent],
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      DialogModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      ModalService,
      provideMockStore({ initialState }),
      TranslateEnumPipe,
      IFDatePipe,
      TranslatePipe,
      DialogService,
      NotificationService,
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('TableAggregatesComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('setProcurementId', () => {
    it('should set procurementId value from the biddingProcessPlan store in redux', async () => {
      const { component, fixture } = await setup();
      const expectedResponse = '123';
      component.setProcurementId();
      fixture.detectChanges();
      expect(component.procurementId).toEqual(expectedResponse);
    });
  });

  describe('procurementStyles', () => {
    it('should return the css classes depending of status CANCELLED', async () => {
      const { component } = await setup();

      const expectedResponse = 'c-status-label__grey';
      const response = component.procurementStyles(
        BiddingProcessProcurementProcessStatuses.CANCELLED
      );

      expect(response).toEqual(expectedResponse);
    });
    it('should return the css classes depending of status CONTRACT_TERMINATED', async () => {
      const { component } = await setup();

      const expectedResponse = 'c-status-label__yellow';
      const response = component.procurementStyles(
        BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED
      );

      expect(response).toEqual(expectedResponse);
    });
    it('should return the css classes depending of status MODIFIED', async () => {
      const { component } = await setup();

      const expectedResponse = 'c-status-label__orange';
      const response = component.procurementStyles(
        BiddingProcessProcurementProcessStatuses.MODIFIED
      );

      expect(response).toEqual(expectedResponse);
    });
    it('should return the css classes depending of status PROCUREMENT_INELIGIBLE', async () => {
      const { component } = await setup();

      const expectedResponse = 'c-status-label__orange';
      const response = component.procurementStyles(
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE
      );

      expect(response).toEqual(expectedResponse);
    });
    it('should return the css classes depending of status DRAFT', async () => {
      const { component } = await setup();

      const expectedResponse = 'c-status-label__blue';
      const response = component.procurementStyles(
        BiddingProcessProcurementProcessStatuses.DRAFT
      );

      expect(response).toEqual(expectedResponse);
    });
    it('should return the css classes depending of status CONTRACT_FINISHED', async () => {
      const { component } = await setup();

      const expectedResponse = 'c-status-label__white';
      const response = component.procurementStyles(
        BiddingProcessProcurementProcessStatuses.CONTRACT_FINISHED
      );

      expect(response).toEqual(expectedResponse);
    });
    it('should return the css classes white if is default', async () => {
      const { component } = await setup();
      const defaultValue = 99;
      const expectedResponse = 'c-status-label__white';
      const response = component.procurementStyles(defaultValue);

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('routeToProcessDocs', () => {
    it('should navigate to process docs', async () => {
      const { component } = await setup();

      const navigationSpy = jest
        .spyOn(component.router, 'navigate')
        .mockImplementation();
      component.routeToProcessDocs(procurementPlanCollection[1], false);
      expect(navigationSpy).toHaveBeenCalled();
    });

    it('should navigate to edit', async () => {
      const { component } = await setup();

      const navigationSpy = jest
        .spyOn(component.router, 'navigate')
        .mockImplementation();
      component.routeToProcessDocs(procurementPlanCollection[0], false);
      expect(navigationSpy).toHaveBeenCalled();
    });
  });

  describe('actionItem', () => {
    it('should emit action', async () => {
      const { component } = await setup();

      const action: ProcessActions = ProcessActions.edit;
      const id = 'string';

      const actionSpy = jest.spyOn(component.actionitemID, 'emit');
      component.actionItem(action, id);
      expect(actionSpy).toHaveBeenCalled();
    });
  });

  describe('removeSeparators', () => {
    it('should replace , and . with empty string', async () => {
      const { component } = await setup();

      const expectedResponse = '1000';
      const response = component.removeSeparators('1,000');

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('onFilter', () => {
    it('should filter gridView with the value of the input', async () => {
      const { component } = await setup();

      const value = 'processId1';

      component.onFilter(value);
      expect(component.gridView.length).toEqual(1);
    });
  });
});
