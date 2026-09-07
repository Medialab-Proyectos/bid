import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BiddingProcessProcurementProcessStatuses } from '@core/enums';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProcurementProcessComponent } from './procurement-process.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const initialState = {
  selectedProject: {
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
  },
  biddingProcessPlan: {
    biddingProcessPlan: {
      id: '1',
      projectBucketId: 'id',
      status: 0,
      version: 0,
      approvedDate: new Date(),
      approvedBy: 'user',
    },
    biddingProcessProcurementProcesses: [
      {
        id: 'id',
        biddingProcessPlanId: 'biddingProcessPlanId',
        category: 0,
        procurementMethod: 0,
        supervisionMethod: 0,
        status: BiddingProcessProcurementProcessStatuses.DRAFT,
        goodsReference: 0,
        sustainability: 0,
        code: 'code',
        name: 'name',
        description: 'description',
        justification: 'justification',
        bafo: false,
        sepaPeclaId: 'sepaPeclaId',
        lots: 0,
        manualId: 'manualId',
        sustainabilityDescription: 'sustainabilityDescription',
        subExecutor: 'subExecutor',
        advanceMilestone: null,
        projectAmount: {
          cofinancedAmount: 100,
          estimatedAmount: 100,
          idbAmount: 100,
          localCounterpartAmount: 100,
          costJustificaction: 'justification',
        },
        componentName: 'componentName',
      },
    ],
    selectedBiddingProcessProcurementProcess: {
      id: 'id',
      biddingProcessPlanId: 'biddingProcessPlanId',
      category: 0,
      procurementMethod: 0,
      supervisionMethod: 0,
      status: BiddingProcessProcurementProcessStatuses.DRAFT,
      goodsReference: 0,
      sustainability: 0,
      code: 'code',
      name: 'name',
      description: 'description',
      justification: 'justification',
      bafo: false,
      sepaPeclaId: 'sepaPeclaId',
      lots: 0,
      manualId: 'manualId',
      sustainabilityDescription: 'sustainabilityDescription',
      subExecutor: 'subExecutor',
      advanceMilestone: null,
      projectAmount: {
        cofinancedAmount: 100,
        estimatedAmount: 100,
        idbAmount: 100,
        localCounterpartAmount: 100,
        costJustificaction: 'justification',
      },
      componentName: 'componentName',
    },
    isSelectedProcessLoaded: false,
    isSelectedProcessLoading: true,
    processScreenLoaded: true,
    processScreenLoading: false,
    loaded: true,
    loading: false,
  },
  enums: {
    enumsLoaded: {
      biddingProcessProcurementProcessCategories: true,
      biddingProcessProcurementProcessProcurementMethods: true,
      biddingProcessProcurementProcessSupervisionMethods: true,
      biddingProcessProcurementProcessStatuses: true,
    },
    enumsLoading: {
      biddingProcessProcurementProcessCategories: false,
      biddingProcessProcurementProcessProcurementMethods: false,
      biddingProcessProcurementProcessSupervisionMethods: false,
      biddingProcessProcurementProcessStatuses: false,
    },
  },
};

describe('ProcurementProcessComponent', () => {
  async function setup() {
    const { fixture } = await render(ProcurementProcessComponent, {
      declarations: [ProcurementProcessComponent, TranslateEnumPipe],
      imports: [
        DirectivesModule,
        ButtonsModule,
        DropDownsModule,
        LabelModule,
        LayoutModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        MsalTestModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ),
      ],
      providers: [
        { provide: 'windowObject', useValue: window },
        provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });
    const component = fixture.componentInstance;
    return { component, fixture };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('onToggle', () => {
    it('should change the value of show, from true to false or viceversa', async () => {
      const { component, fixture } = await setup();
      component.onToggle();
      fixture.detectChanges();

      expect(component.show).toBe(false);
    });
  });

  describe('toogleExpandHeader', () => {
    it('should change the value of expandedHeader from true to false or viceversa', async () => {
      const { component, fixture } = await setup();
      component.toogleExpandHeader();
      fixture.detectChanges();

      expect(component.expandedHeader).toBe(false);
    });
  });

  describe('toggleInformationGeneral', () => {
    it('should change the value of expandedInformation  from true to false or viceversa', async () => {
      const { component, fixture } = await setup();
      component.toggleInformationGeneral();
      fixture.detectChanges();

      expect(component.expandedInformation).toBe(true);
    });
  });
});
