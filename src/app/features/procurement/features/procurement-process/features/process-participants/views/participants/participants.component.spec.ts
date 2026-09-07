import { ParticipantsComponent } from './participants.component';
import { render, screen } from '@testing-library/angular';
import { provideMockStore } from '@ngrx/store/testing';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Participant } from '@core/models/participant.model';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ParticipantComponent } from '../../components/participant/participant.component';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PopupModule } from '@progress/kendo-angular-popup';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TranslateTestingModule } from 'ngx-translate-testing';
import {
  DirectivesModule,
  LoaderModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  EvaluationParticipantsConfig,
} from '@core/enums';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ParticipantConfig } from '../../models/participant-config.model';
import { DialogService } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { BiddingProcessPlanState } from '@core/store';
import { of } from 'rxjs';

describe('ParticipantComponent', () => {
  describe('I see the mobile version of the component', () => {
    describe('when i finished adding a participant', () => {
      describe('And i click the cancel bnt', () => {
        it('should return to the main Page', async () => {
          const { component } = await setup(true);
          component.stopAdding(false);
          expect(component.addingParticipantMobile).toBe(false);
        });
      });
    });
  });

  describe('when participants are loading', () => {
    it('should show spinner', async () => {
      await setupSpinner();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('when there is an error', () => {
    it('should not show table', async () => {
      await setupSpinner(false);
      expect(screen.queryByTestId('tab__header')).not.toBeInTheDocument();
    });
  });

  describe('bussiness rules', () => {
    describe('validate procurement process status', () => {
      it('should return true on validateStatus Function', async () => {
        const { component } = await setup();
        component.processPlan = {
          id: '1',
          projectBucketId: '1',
          version: 1,
          status: BiddingProcessPlanStatus.DRAFT,
          approvedDate: '05/06/2022',
          approvedBy: '1',
        };
        const result = component.validateStatus();
        expect(result).toBe(false);
      });
      it('should return false on validateStatus Function', async () => {
        const { component } = await setup(
          false,
          false,
          BiddingProcessProcurementProcessStatuses.EXPECTED
        );
        component.processPlan = {
          id: '1',
          projectBucketId: '1',
          version: 1,
          status: BiddingProcessPlanStatus.DRAFT,
          approvedDate: '05/06/2022',
          approvedBy: '1',
        };
        const result = component.validateStatus();
        expect(result).toBe(false);
      });
    });
  });

  describe('Add row button', () => {
    it('should add an empty participant to the array ', async () => {
      const { component, fixture } = await setup();

      component.participants.length = 1;
      component.addRow();
      fixture.detectChanges();

      expect(component.participants.length).toEqual(2);
    });
    it('should return false on validateStatus Function', async () => {
      const { component } = await setup(
        false,
        false,
        BiddingProcessProcurementProcessStatuses.EXPECTED
      );
      component.processPlan = {
        id: '1',
        projectBucketId: '1',
        version: 1,
        status: BiddingProcessPlanStatus.DRAFT,
        approvedDate: '05/06/2022',
        approvedBy: '1',
      };
      const result = component.validateStatus();
      expect(result).toBe(false);
    });

    describe('Unsuscription', () => {
      it('should unsubscribe subscriptions when destroy', async () => {
        const { component } = await setup();
        const spy = jest.spyOn(
          component.subscriptionsCollection,
          'unsubscribe'
        );
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('when i delete delete a row of a non saved participant', () => {
    it('should remove the row', async () => {
      const { component, fixture } = await setup();

      component.removeEmptyRow();
      fixture.detectChanges();

      expect(component.participants.length).toBe(0);
    });
  });

  describe('setNumber', () => {
    it('should return the number passed in the function', async () => {
      const { component } = await setup();

      const response = component.setNumber(1);
      expect(response).toBe(1);
    });
    it('should return null because is not a number', async () => {
      const { component } = await setup();

      const response = component.setNumber('asd');
      expect(response).toBe(null);
    });
  });

  describe('handleParticipantConfig', () => {
    it('should set participantConfig with the event emited', async () => {
      const { component, fixture } = await setup();
      const event: ParticipantConfig = {
        awardedAmount: EvaluationParticipantsConfig.Required,
        financialScore: EvaluationParticipantsConfig.Optional,
        overallScore: EvaluationParticipantsConfig.Optional,
        technicalScore: EvaluationParticipantsConfig.Optional,
      };
      component.handleParticipantConfig(event);
      fixture.detectChanges();

      expect(component.participantConfig).toEqual(event);
    });
  });

  describe('checkPermissionForTabs', () => {
    it('should has permission to see participant tab for EXPECTED status', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.EXPECTED;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(true);
      component.checkPermissionForTabs(
        BiddingProcessProcurementProcessStatuses.EXPECTED
      );
      expect(component.hasPermissionSeeParticipant).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterParticipantTab
      );
    });
    it('should NOT has permission to see participant tab for EXPECTED status', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.EXPECTED;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(false);
      component.checkPermissionForTabs(
        BiddingProcessProcurementProcessStatuses.EXPECTED
      );
      expect(component.hasPermissionSeeParticipant).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterParticipantTab
      );
    });

    it('should has permission to see participant tab for CONTRACT UNDER EXECUTION status', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(true);
      component.checkPermissionForTabs(
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION
      );
      expect(component.hasPermissionSeeParticipant).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterParticipantTabGuest
      );
    });
    it('should NOT has permission to see participant tab for CONTRACT UNDER EXECUTION status', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(false);
      component.checkPermissionForTabs(
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION
      );
      expect(component.hasPermissionSeeParticipant).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterParticipantTabGuest
      );
    });
  });
});
const storeBiddingProcessPlanState: BiddingProcessPlanState = {
  biddingProcessPlan: null,
  biddingProcessProcurementProcesses: null,
  error: null,
  isSelectedProcessLoaded: true,
  isSelectedProcessLoading: false,
  loaded: false,
  loading: false,
  processScreenLoaded: false,
  processScreenLoading: false,
  loadingProcess: false,
  selectedBiddingProcessProcurementProcess: {
    biddingProcessPlanId: 'bb309ef8-5192-4c47-99c8-39ca201a86f3',
    code: 'EC-L1245-P0001',
    description: 'ICB TEST 1 Normal',
    sustainabilityDescription: '',
    totalComments: 0,
    totalAcumulatedAmount: 0,
    advanceMilestone: {
      totalCompleted: 0,
      total: 0,
      delayed: false,
      currentMilestone: null,
    },
    componentName: '',
    bafo: null,
    sepaPeclaId: '',
    lots: 0,
    category: {
      name: 'PROCT_GOODS',
      id: 2,
    },
    procurementMethod: {
      name: 'PROCT_ICB',
      id: 0,
    },
    supervisionMethod: {
      name: 'ExAnte',
      id: 0,
    },
    status: BiddingProcessProcurementProcessStatuses.EXPECTED,
    sustainability: null,
    goodsReference: 0,
    id: '223647d9-37fe-4c9d-99a3-31a8052d1d29',
    manualId: '',
    name: 'ICB TEST 1 Normal',
    projectAmount: {
      estimatedAmount: 3000,
      localCounterpartAmount: 0,
      idbAmount: 3000,
      cofinancedAmount: 0,
      costJustification: '',
    },
    subExecutor: '',
    justification: '',
    isMigrated: false,
    packagesUnderReview: false,
    isUpdated: true,
    procurementProcessComments: [],
    order: 4,
  },
  selectedFilterForBiddingProcess: null,
  filteredBiddingProcessProcurementProcesses: [],
};
function getInitialState(procurementProcessStatus: number) {
  return {
    participants: {
      participantsByProcess: {
        '22': {
          participants: [
            mockFirstParticipant,
            {
              biddingProcessBidderId: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
              biddingProcessParticipantId:
                'cd592ba8-dd11-47d2-81cf-3618370fb680',
              weighedTechScore: 20,
              weighedFinancialScore: 20,
              totalScore: 40,
              amount: 66,
              currency: 'USD',
              result: 0,
              bidder: {
                id: '5469a8ee-cb5f-4b54-bc52-51d3f11a2e7d',
                name: 'Fake 5',
                searchName: 'Fake 5 / CO',
                type: 1,
                nationality: 'CO',
                legalRepresentative: 'Fake 5 representative',
                economicSector: 1,
                beneficiaryOwner: 'Fake 5 benefici',
                address: '',
                zipCode: 'string',
                country: 'CO',
              },
            },
          ],
          loaded: true,
          loading: false,
          error: null,
        },
      },
    },
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
      loaded: true,
      loading: false,
      error: null,
    },
    biddingProcessPlan: {
      biddingProcessPlan: null,
      biddingProcessProcurementProcesses: [],
      selectedBiddingProcessProcurementProcess: {
        id: 'd2379cd0-8695-417b-83a8-05e8cf757e2a',
        biddingProcessPlanId: 'cb1d82ed-fc62-4cde-9f5e-18de236a0d93',
        code: '1',
        category: 5,
        procurementMethod: 0,
        supervisionMethod: 1,
        status: procurementProcessStatus,
        sustainability: 1,
        name: 'string',
        description: 'string',
        justification: 'string',
        manualId: 'string',
        sustainabilityDescription: 'string',
        subExecutor: 'string',
        projectAmount: {
          estimatedAmount: 0,
          localCounterpartAmount: 0,
          idbAmount: 0,
          cofinancedAmount: 0,
        },
        totalComments: 0,
        advanceMilestone: {
          totalCompleted: 0,
          total: 0,
        },
        componentName: '',
      },
      loaded: true,
      loading: false,
      error: null,
    },
  };
}

const mockFirstParticipant: Participant = {
  biddingProcessBidderId: '9cfee90c-bc8f-4ef1-a5b8-c8945926ec1a',
  biddingProcessParticipantId: 'cd592ba8-dd11-47d2-81cf-3618370fb680',
  weighedTechScore: 15,
  weighedFinancialScore: 15,
  totalScore: 30,
  amount: 66,
  amountUsd: 10,
  currency: 'USD',
  result: null,
  bidder: {
    id: '5469a8ee-cb5f-4b54-bc52-51d3f11a2e7d',
    name: 'Fake 4',
    searchName: 'Fake 4 / CO',
    type: 1,
    nationality: 1,
    legalRepresentative: 'Fake 3 representative',
    economicSector: 1,
    beneficiaryOwner: 'Fake3 benefici',
    address: '',
    zipCode: 'string',
    country: 'CO',
  },
};

async function setup(_mobileView = false, empty = false, status = 5) {
  const initialState = getInitialState(status);
  if (empty) {
    initialState.participants.participantsByProcess['22'].participants = [];
  }
  const { fixture } = await render(ParticipantsComponent, {
    componentProperties: {
      procurementProcessId: '22',
    },
    declarations: [ParticipantComponent],
    imports: [
      DirectivesModule,
      MsalTestModule,
      CommonModule,
      HttpClientTestingModule,
      RouterTestingModule,
      ReactiveFormsModule,
      PopupModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      ButtonsModule,
      NotificationModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      provideMockStore({ initialState }),
      provideWindowSizeMock({ mobileView: true }),
      NotificationService,

      DialogService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });

  const component = fixture.componentInstance;

  return { component, fixture };
}

async function setupSpinner(loading = true) {
  const initialState = getInitialState(
    BiddingProcessProcurementProcessStatuses.EXPECTED
  );
  initialState.participants.participantsByProcess['22'].participants = [];
  initialState.participants.participantsByProcess['22'].loading = loading;
  initialState.participants.participantsByProcess['22'].error = true;
  const { fixture } = await render(ParticipantsComponent, {
    componentProperties: {
      procurementProcessId: '22',
    },
    declarations: [ParticipantComponent],
    imports: [
      MsalTestModule,
      DirectivesModule,
      CommonModule,
      HttpClientTestingModule,
      RouterTestingModule,
      ReactiveFormsModule,
      LoaderModule,
      PopupModule,
      InputsModule,
      LabelModule,
      DropDownsModule,
      ButtonsModule,
      NotificationModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      provideMockStore({ initialState }),
      provideWindowSizeMock({ mobileView: false }),
      NotificationService,

      DialogService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });

  const component = fixture.componentInstance;

  return { component, fixture };
}
