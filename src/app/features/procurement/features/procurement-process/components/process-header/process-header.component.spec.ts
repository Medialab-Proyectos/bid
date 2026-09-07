import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { ProcessHeaderComponent } from './process-header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { RouterTestingModule } from '@angular/router/testing';
import {
  BiddingProcessProcurementProcessStatuses,
  DocumentPackagesStatus,
} from '@core/enums';
import { BiddingProcessProcurementProcessDetail } from '@core/models';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const mockSelectedProject = {
  selectedProject: {
    countryCode: 'CO',
    name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
    executor: 'MINISTERIO DE EDUCACION NACIONAL',
    executorAcronym: 'CO-MEN',
    contract: '4902/OC-CO',
    operationNumber: 'CO-L1229',
    approvedAmount: 60000000,
    status: 'In progress',
  },
  loaded: false,
  loading: false,
  error: null,
};

const initialState = {
  selectedProject: { ...mockSelectedProject },
};

describe('ProcessHeaderComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('initDropdowns', () => {
    it('should set values', async () => {
      const { component, fixture } = await setup();

      component.initDropdowns(mockData);
      fixture.detectChanges();

      const categoryResponse = {
        key: 'category',
        value: 'PROCT_CSTFRM',
      };

      const procurementMethodResponse = {
        key: 'procurementMethod',
        value: 'PROCT_ICB',
      };

      const supervisionMethodResponse = {
        key: 'supervisionMethod',
        value: 'ExAnte',
      };

      expect(component.attributeCategory).toEqual(categoryResponse);
      expect(component.attributeProcurementMethod).toEqual(
        procurementMethodResponse
      );
      expect(component.attributeSupervisionMethod).toEqual(
        supervisionMethodResponse
      );
    });
  });

  describe('setAttributeCountry', () => {
    it('should set attributeCountry values', async () => {
      const { component, fixture } = await setup();

      const response = {
        key: 'countryCode',
        value: 'CO',
      };

      component.setAttributeCountry();
      fixture.detectChanges();

      expect(component.attributeCountry).toEqual(response);
    });
  });
});

async function setup() {
  const { fixture } = await render(ProcessHeaderComponent, {
    declarations: [],
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      MsalTestModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [provideMockStore({ initialState }), NotificationService],
  });

  const component = fixture.componentInstance;

  return { component, fixture };
}

const mockData: BiddingProcessProcurementProcessDetail = {
  comments: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      comment: {
        createdBy: '',
        id: 'string',
        visibility: 0,
        source: 0,
        status: 0,
        text: 'string',
      },
    },
  ],
  milestones: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      status: 0,
      code: 0,
      order: 0,
      estimatedDate: new Date(),
      reEstimateDate: new Date(),
      actualDate: new Date(),
      packageStatus: DocumentPackagesStatus.NOT_STARTED,
    },
  ],
  outputs: {
    componentId: 'string',
    componentName: 'string',
    outputs: [
      {
        ouputId: 'string',
        ouputName: 'string',
        percentageAssigned: 0,
      },
    ],
  },
  process: {
    id: 'string',
    biddingProcessPlanId: 'string',
    category: {
      id: 0,
      name: 'PROCT_CSTFRM',
    },
    procurementMethod: {
      id: 0,
      name: 'PROCT_ICB',
    },
    supervisionMethod: {
      id: 0,
      name: 'ExAnte',
    },
    status: BiddingProcessProcurementProcessStatuses.DRAFT,
    goodsReference: 0,
    sustainability: 0,
    code: 'string',
    name: 'string',
    description: 'string',
    justification: 'string',
    totalAcumulatedAmount: 0,
    bafo: true,
    sepaPeclaId: 'string',
    lots: 0,
    manualId: 'string',
    sustainabilityDescription: 'string',
    subExecutor: 'string',
    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    projectAmount: {
      cofinancedAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      localCounterpartAmount: 0,
    },
    componentName: 'string',
    totalComments: 0,
    isMigrated: true,
    packagesUnderReview: true,
    isUpdated: true,
    procurementProcessComments: [],
    order: 4,
  },
};
