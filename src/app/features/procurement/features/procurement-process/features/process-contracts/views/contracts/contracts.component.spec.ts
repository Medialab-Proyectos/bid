import { ContractsComponent } from './contracts.component';
import { ContractDetailsComponent } from '../../components/contract-details/contract-details.component';
import { render, screen } from '@testing-library/angular';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { WindowSizeService } from '@core/services/view';
import { BehaviorSubject, of } from 'rxjs';
import {
  DirectivesModule,
  NotificationModule,
  PipeModule,
  TablesModule,
} from '@fiduciary-interface/app/shared';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TranslatePipe } from '@ngx-translate/core';
import { BiddingContractByProcess } from '@core/models';
import {
  BiddingContractStatusesEnum,
  BiddingProcessProcurementProcessStatuses,
  ContractMenuOptionsEnum,
} from '@core/enums';
import { DialogService } from '@progress/kendo-angular-dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { DatePipe } from '@angular/common';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { BiddingProcessPlanState } from '@core/store';

describe('ContractsComponent', () => {
  describe('should return if the array contains an amendment with pending signature', () => {
    it('should return false', async () => {
      const { component } = await setup();
      const amendments: BiddingContractByProcess[] = [];
      expect(component.checkHasPendingAmendment(amendments)).toBe(false);
    });

    it('should return false with PENDING_SIGNATURE status', async () => {
      const { component } = await setup();
      const amendments: BiddingContractByProcess[] = [
        {
          visualCode: '',
          biddingContractId: 'string',
          parentId: 'string',
          code: 'string',
          version: 1,
          biddingContractsAwarded: [],
          contractType: 1,
          contractStatus: BiddingContractStatusesEnum.PENDING_SIGNATURE,
          nationality: 'string',
          idbAmount: 2,
          startDate: 'string',
          endDate: 'string',
          amendments: [],
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
        },
      ];
      expect(component.checkHasPendingAmendment(amendments)).toBe(true);
    });

    it('should return false with AMENDMENT_UNDER_REV status', async () => {
      const { component } = await setup();
      const amendments: BiddingContractByProcess[] = [
        {
          visualCode: '',
          biddingContractId: 'string',
          parentId: 'string',
          code: 'string',
          version: 1,
          biddingContractsAwarded: [],
          contractType: 1,
          contractStatus: BiddingContractStatusesEnum.AMENDMENT_UNDER_REV,
          nationality: 'string',
          idbAmount: 2,
          startDate: 'string',
          endDate: 'string',
          amendments: [],
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
        },
      ];
      expect(component.checkHasPendingAmendment(amendments)).toBe(true);
    });

    it('should return false with AMENDMENT_REVIEWED status', async () => {
      const { component } = await setup();
      const amendments: BiddingContractByProcess[] = [
        {
          visualCode: '',
          biddingContractId: 'string',
          parentId: 'string',
          code: 'string',
          version: 1,
          biddingContractsAwarded: [],
          contractType: 1,
          contractStatus: BiddingContractStatusesEnum.AMENDMENT_REVIEWED,
          nationality: 'string',
          idbAmount: 2,
          startDate: 'string',
          endDate: 'string',
          amendments: [],
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
        },
      ];
      expect(component.checkHasPendingAmendment(amendments)).toBe(true);
    });
  });

  describe('remove the amendment option', () => {
    it('should return an empty array', async () => {
      const { component } = await setup();
      const options: string[] = [ContractMenuOptionsEnum.AMENDMENT];
      expect(component.removeAddAmendmentOption(options)).toEqual([]);
    });

    it('should return the same array', async () => {
      const { component } = await setup();
      const options: string[] = [ContractMenuOptionsEnum.EDIT];
      expect(component.removeAddAmendmentOption(options)).toEqual([
        ContractMenuOptionsEnum.EDIT,
      ]);
    });
  });

  it('should show add contract button if status BiddingProcessProcurementProcessStatuses is 4, 6, 10', async () => {
    const contract: BiddingContractByProcess = {
      biddingContractId: '',
      code: '',
      amendments: [],
      visualCode: '',
      parentId: '',
      biddingContractsAwarded: null,
      contractStatus: BiddingContractStatusesEnum.EXPIRED,
      contractType: 1,
      endDate: '',
      idbAmount: 1,
      nationality: '',
      startDate: '',
      version: 1,
      cofinancedAmount: 0,
      localCounterpartAmount: 0,
    };
    const { component, fixture } = await setupForContractRow(
      contract,
      BiddingProcessProcurementProcessStatuses.EVAL_BID_PROPOSAL
    );
    component.showAddContract = true;
    component.displayAddContractBtn = true;
    component.hasPermissionSeeContract = true;
    component.procurementProcessStatus =
      BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
    fixture.detectChanges();

    expect(screen.getByTestId('Btn_AddContract')).toBeInTheDocument();
  });

  it('should upate the selectedContract var', async () => {
    const { component } = await setup();
    const mockContract = {
      amendment: null,
      country: '',
      id: '',
      name: '',
      status: '',
      updateDate: new Date(),
    };
    component.showDetails(mockContract);
    expect(component.selectedContract).toEqual(mockContract);
  });

  it('should upate the selectedContract var set to null', async () => {
    const { component } = await setup();
    component.hideDetails();
    expect(component.selectedContract).toEqual(null);
  });

  describe('sortContractsByCode', () => {
    it('should sort contracts by code', async () => {
      const { component } = await setup();
      const contracts: BiddingContractByProcess[] = [
        {
          visualCode: 'contrato1',
          biddingContractId: 'string',
          parentId: 'string',
          code: '2',
          version: 0,
          biddingContractsAwarded: [],
          contractType: 0,
          contractStatus: BiddingContractStatusesEnum.EXECUTION,
          nationality: 'string',
          idbAmount: 0,
          localCounterpartAmount: 0,
          cofinancedAmount: 0,
          startDate: 'string',
          endDate: 'string',
          amendments: [
            {
              visualCode: 'enmieda1',
              biddingContractId: 'string',
              parentId: 'string',
              code: '1',
              version: 0,
              biddingContractsAwarded: [],
              contractType: 0,
              contractStatus: BiddingContractStatusesEnum.EXECUTION,
              nationality: 'string',
              idbAmount: 0,
              localCounterpartAmount: 0,
              cofinancedAmount: 0,
              startDate: 'string',
              endDate: 'string',
              amendments: [],
            },
            {
              visualCode: 'enmieda2',
              biddingContractId: 'string',
              parentId: 'string',
              code: '1',
              version: 1,
              biddingContractsAwarded: [],
              contractType: 0,
              contractStatus: BiddingContractStatusesEnum.EXECUTION,
              nationality: 'string',
              idbAmount: 0,
              localCounterpartAmount: 0,
              cofinancedAmount: 0,
              startDate: 'string',
              endDate: 'string',
              amendments: [],
            },
          ],
        },
        {
          visualCode: 'contrato2',
          biddingContractId: 'string',
          parentId: 'string',
          code: '1',
          version: 0,
          biddingContractsAwarded: [],
          contractType: 0,
          contractStatus: BiddingContractStatusesEnum.EXECUTION,
          nationality: 'string',
          idbAmount: 0,
          localCounterpartAmount: 0,
          cofinancedAmount: 0,
          startDate: 'string',
          endDate: 'string',
          amendments: [],
        },
      ];
      component.sortContractsByCode(contracts);
      expect(contracts[0].code).toEqual('2');
    });
  });

  describe('sortAmendmentsByCode', () => {
    it('should sort amendments by code', async () => {
      const { component } = await setup();
      const contracts: BiddingContractByProcess[] = [
        {
          visualCode: 'contrato1',
          biddingContractId: 'string',
          parentId: 'string',
          code: '2',
          version: 0,
          biddingContractsAwarded: [],
          contractType: 0,
          contractStatus: BiddingContractStatusesEnum.EXECUTION,
          nationality: 'string',
          idbAmount: 0,
          localCounterpartAmount: 0,
          cofinancedAmount: 0,
          startDate: 'string',
          endDate: 'string',
          amendments: [
            {
              visualCode: '1',
              biddingContractId: 'string',
              parentId: 'string',
              code: '2',
              version: 0,
              biddingContractsAwarded: [],
              contractType: 0,
              contractStatus: BiddingContractStatusesEnum.EXECUTION,
              nationality: 'string',
              idbAmount: 0,
              localCounterpartAmount: 0,
              cofinancedAmount: 0,
              startDate: 'string',
              endDate: 'string',
              amendments: [],
            },
            {
              visualCode: '2',
              biddingContractId: 'string',
              parentId: 'string',
              code: '2',
              version: 1,
              biddingContractsAwarded: [],
              contractType: 0,
              contractStatus: BiddingContractStatusesEnum.EXECUTION,
              nationality: 'string',
              idbAmount: 0,
              localCounterpartAmount: 0,
              cofinancedAmount: 0,
              startDate: 'string',
              endDate: 'string',
              amendments: [],
            },
          ],
        },
        {
          visualCode: 'contrato2',
          biddingContractId: 'string',
          parentId: 'string',
          code: '2',
          version: 1,
          biddingContractsAwarded: [],
          contractType: 0,
          contractStatus: BiddingContractStatusesEnum.EXECUTION,
          nationality: 'string',
          idbAmount: 0,
          localCounterpartAmount: 0,
          cofinancedAmount: 0,
          startDate: 'string',
          endDate: 'string',
          amendments: [
            {
              visualCode: '1',
              biddingContractId: 'string',
              parentId: 'string',
              code: '2',
              version: 0,
              biddingContractsAwarded: [],
              contractType: 0,
              contractStatus: BiddingContractStatusesEnum.EXECUTION,
              nationality: 'string',
              idbAmount: 0,
              localCounterpartAmount: 0,
              cofinancedAmount: 0,
              startDate: 'string',
              endDate: 'string',
              amendments: [],
            },
            {
              visualCode: '2',
              biddingContractId: 'string',
              parentId: 'string',
              code: '2',
              version: 1,
              biddingContractsAwarded: [],
              contractType: 0,
              contractStatus: BiddingContractStatusesEnum.EXECUTION,
              nationality: 'string',
              idbAmount: 0,
              localCounterpartAmount: 0,
              cofinancedAmount: 0,
              startDate: 'string',
              endDate: 'string',
              amendments: [],
            },
          ],
        },
      ];

      component.sortAmendments(contracts);
      expect(contracts[0].amendments[0].version).toEqual(0);
    });
  });

  describe('navigateContract', () => {
    it('should navigate to create contract', async () => {
      const { component } = await setup();

      const navigationSpy = jest
        .spyOn(component.router, 'navigate')
        .mockImplementation();
      component.createContract();
      expect(navigationSpy).toHaveBeenCalled();
    });
  });

  describe('checkPermissionForTabs', () => {
    it('should has permission to see contract tab for EXPECTED status', async () => {
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
      expect(component.hasPermissionSeeContract).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterContractsTab
      );
    });
    it('should NOT has permission to see contract tab for EXPECTED status', async () => {
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
      expect(component.hasPermissionSeeContract).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterContractsTab
      );
    });

    it('should has permission to see contract tab for CONTRACT UNDER EXECUTION status', async () => {
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
      expect(component.hasPermissionSeeContract).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterContractsTabGuest
      );
    });
    it('should NOT has permission to see contract tab for CONTRACT UNDER EXECUTION status', async () => {
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
      expect(component.hasPermissionSeeContract).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.enterContractsTabGuest
      );
    });
  });
});

async function setupForContractRow(
  contract: BiddingContractByProcess,
  processStatus = BiddingProcessProcurementProcessStatuses.DRAFT
) {
  const initialState = {
    preferences: {
      preferences: {
        defaultLanguage: 'en',
        preferredLanguage: 'en',
        favoriteOperations: [],
      },
      selectedLanguage: {
        code: 'en',
        name: 'English',
      },
      loaded: true,
      loading: false,
      error: null,
    },
    contact: {
      contact: {
        contactId: 'f8c85952-a09b-4fc3-9f69-dba5b0f063f4',
        name: 'Chavez Gonzalez, Favio',
        username: 'FAVIOC',
        email: 'FAVIOC@IADB.ORG',
        family_name: 'Chavez Gonzalez',
        given_name: 'Favio',
        is_internal: true,
      },
      loaded: true,
      loading: false,
      error: null,
    },
    selectedProject: {
      selectedProject: {
        countryCode: 'CR',
        name: 'Road Infrastructure Program and promotion of Public-Private Partnerships (PPP)',
        nameEs:
          'Programa de Infraestructura Vial y promoción de Asociaciones Público-Privadas (APP)',
        nameFr: '',
        namePt: '',
        executor: 'MINISTERIO DE OBRAS PUBLICAS Y TRANSPORTE',
        executorAcronym: 'CR-MOPT',
        contract: '4864/OC-CR',
        operationNumber: 'CR-L1139',
        approvedAmount: 125000000,
        status: 'In progress',
        projectBucketId: '9137520d-7bcb-45bc-9fb4-219ce6ac948c',
        currentApprovedAmount: 125000000,
        favorite: false,
      },
      loaded: true,
      loading: false,
      error: null,
    },
    procurementContracts: {
      contractsByProcess: {
        '1': {
          procurementContracts: [contract],
          loading: false,
          loaded: true,
        },
      },
    },
    biddingProcessPlan: {
      biddingProcessPlan: {
        projectBucketId: '9137520d-7bcb-45bc-9fb4-219ce6ac948c',
        version: 44,
        id: '6582e6be-b54c-4b7b-81c3-4b702eafc7b4',
        status: 0,
        approvedDate: null,
        approvedBy: null,
      },
      selectedBiddingProcessProcurementProcess: {
        id: 'id',
        biddingProcessPlanId: 'biddingProcessPlanId',
        category: 0,
        procurementMethod: 0,
        supervisionMethod: 0,
        status: processStatus,
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
        projectAmount: null,
        componentName: 'componentName',
      },
    },
    enums: {
      biddingProcessProcurementProcessStatuses: [
        {
          id: 0,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CANCELLED',
        },
        {
          id: 1,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.PROCUREMENT_COMPLETE',
        },
        {
          id: 2,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONTRACT_FINISHED',
        },
        {
          id: 3,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONTRACT_TERMINATED',
        },
        {
          id: 4,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONTRACT_UNDER_EXECUTION',
        },
        {
          id: 5,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.DRAFT',
        },
        {
          id: 6,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.EVAL_BID_PROPOSAL',
        },
        {
          id: 7,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.EXPECTED',
        },
        {
          id: 8,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.PROCUREMENT_INELIGIBLE',
        },
        {
          id: 9,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.MODIFIED',
        },
        {
          id: 10,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.PROCESS_ONGOING',
        },
        {
          id: 11,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.REJECTION_BIDS',
        },
        {
          id: 12,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.TECH_EVAL_PHASE_COMPLETED',
        },
        {
          id: 13,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.UNDER_REVIEW',
        },
        {
          id: 14,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.UNDER_REVIEW_MODIFIED',
        },
        {
          id: 15,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.UNSUCCESFUL_PROCESS',
        },
        {
          id: 16,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.UNDER_REVIEW_CANCELLED',
        },
        {
          id: 17,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.DELETED',
        },
        {
          id: 18,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONTRACTEXPIRED',
        },
        {
          id: 19,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.TECHNICALEVALUATIONOFBIDSPROPOSALS',
        },
        {
          id: 20,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONTRACT_UNDER_EXECUTION_AME',
        },
        {
          id: 21,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.PENDING_CANCELLATION',
        },
        {
          id: 22,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CANCELLATION_UNDER_REVIEW',
        },
        {
          id: 23,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONTRACTSIGNED',
        },
      ],
      biddingContractStatuses: [
        {
          id: 0,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.AMENDMENT_UNDER_REV',
        },
        {
          id: 1,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.EXECUTION',
        },
        {
          id: 2,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.EXECUTION_AMENDMENTS',
        },
        {
          id: 3,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.FINISHED',
        },
        {
          id: 4,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.PENDING_SIGNATURE',
        },
        {
          id: 5,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.SIGNED',
        },
        {
          id: 6,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.TERMINATED',
        },
        {
          id: 7,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.TERMINATION_UNDER_REV',
        },
        {
          id: 8,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.DELETED',
        },
        {
          id: 9,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.AMENDMENTREVIEWED',
        },
        {
          id: 10,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.EXPIRED',
        },
      ],
      biddingProcessPlanStatuses: [
        {
          id: 0,
          name: 'ENUM.PROCUREMENT.PLAN.STATUS.DRAFT',
        },
        {
          id: 1,
          name: 'ENUM.PROCUREMENT.PLAN.STATUS.RETURNED',
        },
        {
          id: 2,
          name: 'ENUM.PROCUREMENT.PLAN.STATUS.UNDER_REVIEW',
        },
        {
          id: 3,
          name: 'ENUM.PROCUREMENT.PLAN.STATUS.NON_OBJECTION',
        },
        {
          id: 4,
          name: 'ENUM.PROCUREMENT.PLAN.STATUS.COMPLETED',
        },
      ],
      biddingProcessProcurementProcessCategories: [
        {
          id: 0,
          name: 'PROCUREMENT.CATEGORIES.PROCT_CSTFRM',
        },
        {
          id: 1,
          name: 'PROCUREMENT.CATEGORIES.PROCT_EXT_AUDIT',
        },
        {
          id: 2,
          name: 'PROCUREMENT.CATEGORIES.PROCT_GOODS',
        },
        {
          id: 3,
          name: 'PROCUREMENT.CATEGORIES.PROCT_INDCST',
        },
        {
          id: 4,
          name: 'PROCUREMENT.CATEGORIES.PROCT_NCSVC',
        },
        {
          id: 5,
          name: 'PROCUREMENT.CATEGORIES.PROCT_WORKS',
        },
      ],
      biddingProcessProcurementProcessSupervisionMethods: [
        {
          id: 0,
          name: 'PROCUREMENT.SUPERVISION_METHOD.ExAnte',
        },
        {
          id: 1,
          name: 'PROCUREMENT.SUPERVISION_METHOD.ExPost',
        },
        {
          id: 2,
          name: 'PROCUREMENT.SUPERVISION_METHOD.NationalSystem',
        },
        {
          id: 4,
          name: 'PROCUREMENT.SUPERVISION_METHOD.Local',
        },
      ],
      biddingProcessProcurementProcessProcurementMethods: [
        {
          id: 0,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICB',
        },
        {
          id: 1,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICBWP',
        },
        {
          id: 2,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CRLP',
        },
        {
          id: 3,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_NCB',
        },
        {
          id: 4,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SRQOI',
        },
        {
          id: 5,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SRMQ',
        },
        {
          id: 6,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_DCS',
        },
        {
          id: 7,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LIB',
        },
        {
          id: 8,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_FA',
        },
        {
          id: 9,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ANPEB',
        },
        {
          id: 10,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_PFA',
        },
        {
          id: 11,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_QCBS',
        },
        {
          id: 12,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_QBS',
        },
        {
          id: 13,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ECCE',
        },
        {
          id: 14,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LCS',
        },
        {
          id: 15,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_FBS',
        },
        {
          id: 16,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SSS',
        },
        {
          id: 17,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SSSIC',
        },
        {
          id: 18,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_3CV',
        },
        {
          id: 19,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICSOI',
        },
        {
          id: 20,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ESLOCP',
        },
        {
          id: 21,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CDCA1',
        },
        {
          id: 22,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CCIBSN2',
        },
        {
          id: 23,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CLP1',
        },
        {
          id: 24,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CLP2',
        },
        {
          id: 25,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_TP1',
        },
        {
          id: 26,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CNVT1',
        },
        {
          id: 27,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SBMT1',
        },
        {
          id: 28,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SBMT2',
        },
        {
          id: 29,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_PREGAO',
        },
        {
          id: 30,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_GPE',
        },
        {
          id: 31,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_APE',
        },
        {
          id: 32,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_RGSPE',
        },
        {
          id: 33,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_MGSPE',
        },
        {
          id: 34,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_RJPE',
        },
        {
          id: 35,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LICPUB1',
        },
        {
          id: 36,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CM1',
        },
        {
          id: 37,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LCSBCP1',
        },
        {
          id: 38,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LCSBCP2',
        },
        {
          id: 39,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LICPRIV1',
        },
        {
          id: 40,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LICPRIV2',
        },
        {
          id: 41,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_TD',
        },
        {
          id: 42,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CECM1',
        },
        {
          id: 43,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LACD1',
        },
        {
          id: 44,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CI2',
        },
        {
          id: 45,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LIC1',
        },
        {
          id: 46,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CMC1',
        },
        {
          id: 47,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LC2',
        },
        {
          id: 48,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CPC2',
        },
        {
          id: 49,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SUBINV',
        },
        {
          id: 50,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LG1',
        },
        {
          id: 51,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LIMTEN1',
        },
        {
          id: 52,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CNTTM1',
        },
        {
          id: 53,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICM3P1',
        },
        {
          id: 54,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_AD1',
        },
        {
          id: 55,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_OSD',
        },
        {
          id: 56,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CNVM1',
        },
        {
          id: 57,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LCO1',
        },
        {
          id: 58,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SBE',
        },
        {
          id: 59,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_NCBWP',
        },
        {
          id: 60,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_COT1',
        },
        {
          id: 61,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_GULP',
        },
        {
          id: 62,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_LC1',
        },
        {
          id: 63,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CD1',
        },
        {
          id: 64,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_COMPMEN1',
        },
        {
          id: 65,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CP1',
        },
        {
          id: 66,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_PERPE',
        },
        {
          id: 67,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_COCOI',
        },
        {
          id: 68,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_PECI',
        },
        {
          id: 69,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_COLPN',
        },
        {
          id: 70,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_COCP',
        },
        {
          id: 71,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_COCM',
        },
        {
          id: 72,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_HOLP',
        },
        {
          id: 73,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_HOCMCE',
        },
        {
          id: 74,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_PELPN',
        },
        {
          id: 75,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_PECECM',
        },
        {
          id: 76,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ECSIE1',
        },
        {
          id: 77,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_GUSEI',
        },
        {
          id: 78,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CBSSTE',
        },
        {
          id: 79,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_CBSSTEWP',
        },
        {
          id: 80,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SBCQ',
        },
        {
          id: 81,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URLABV',
        },
        {
          id: 82,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URCD',
        },
        {
          id: 83,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URLABR',
        },
        {
          id: 84,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_HOLPU',
        },
        {
          id: 85,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SSS_EA',
        },
        {
          id: 86,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URCM',
        },
        {
          id: 87,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URCP',
        },
        {
          id: 88,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URLP',
        },
        {
          id: 89,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URPPB',
        },
        {
          id: 90,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_URSP',
        },
        {
          id: 91,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ANPECI',
        },
        {
          id: 92,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_DCS_ADIR',
        },
        {
          id: 93,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SSS_ADIR',
        },
        {
          id: 94,
          name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_SSSIC_ADIR',
        },
      ],
      enumsLoaded: {
        biddingProcessDocumentGroupCodes: true,
        biddingProcessDocumentgroupResults: true,
        biddingProcessDocumentGroupVisibilities: true,
        biddingProcessDocumentPackageCodes: true,
        biddingProcessDocumentPackageStatuses: true,
        biddingProcessMilestoneCodes: true,
        biddingProcessMilestoneStatuses: true,
        biddingProcessPlanStatuses: true,
        biddingProcessProcurementProcessProcurementMethods: true,
        biddingProcessProcurementProcessGoodsReferences: true,
        biddingProcessProcurementProcessCategories: true,
        biddingProcessProcurementProcessStatuses: true,
        biddingProcessProcurementProcessSupervisionMethods: true,
        biddingProcessProcurementProcessSustainabilities: true,
        fiduciaryProcessDocumentsStatuses: true,
        fiduciaryProcessDocumentsTypes: true,
        workflowActions: true,
        onlineDisburmentWorkflowSteps: true,
        onlineDisburmentWorkflowActions: true,
        workflowSteps: true,
        workflowRoles: true,
        workflowTypes: true,
        WorkFlowDocumentVisibilities: true,
        transactionDocumentGroupCodes: true,
        TransactionStatuses: true,
        biddingContractStatuses: true,
        biddingContractTypes: true,
        biddingContractBonusTypes: true,
        biddingContractConflictResolutionMethods: true,
        biddingContractLiquidatedDamageTypes: true,
        biddingContractBonusPaymentFrequency: true,
        biddingContractSecurityTypes: true,
        biddingContractDocumentGroupCodes: true,
        biddingContractDocumentGroupVisibilities: true,
        biddingContractAmendmentDocumentGroupCodes: true,
        countries: true,
        beneficiaryCountries: true,
        memberCountries: true,
        commentSources: true,
        commentStatuses: true,
        commentVisibilities: true,
        projectTaskTypes: true,
        documentDomain: true,
        projectBucketStatuses: true,
        projectTaskStatuses: true,
      },
    },
  };

  const windowSizeServiceMock = {
    windowSizeChanged: new BehaviorSubject({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      mobileView: false,
    }),
  };

  const { fixture } = await render(ContractsComponent, {
    declarations: [ContractDetailsComponent, IfNumberPipe],
    componentProperties: {
      isPlanNotInSync: true,
    },
    /*   componentProperties: {
      displayCompleteContracts: true,
      isPlanNotInSync: true,
      hasPermissionSeeContract: true,
      showAddContract: true,
      displayAddContractBtn: true,
    }, */
    imports: [
      MsalTestModule,
      DirectivesModule,
      HttpClientTestingModule,
      RouterTestingModule,
      TablesModule,
      PopupModule,
      NotificationModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      NotificationService,
      DialogService,
      TranslatePipe,
      DatePipe,
      IFDatePipe,
      provideMockStore({ initialState }),
      { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
      { provide: ActivatedRoute, useValue: mockActivatedRoute },
      { provide: WindowSizeService, useValue: windowSizeServiceMock },
    ],
  });

  const component = fixture.componentInstance;

  return {
    fixture,
    component,
  };
}

async function setup(mobileView = false, empty = false) {
  const windowSizeServiceMock = {
    windowSizeChanged: new BehaviorSubject({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      mobileView: mobileView,
    }),
  };

  const initialState = getInitialState(empty);

  const { fixture } = await render(ContractsComponent, {
    declarations: [ContractDetailsComponent, IfNumberPipe],
    componentProperties: {
      displayCompleteContracts: true,
      isPlanNotInSync: true,
      hasPermissionSeeContract: true,
      showAddContract: true,
      displayAddContractBtn: true,
    },
    imports: [
      MsalTestModule,
      DirectivesModule,
      HttpClientTestingModule,
      RouterTestingModule,
      TablesModule,
      PopupModule,
      NotificationModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      NotificationService,
      DialogService,
      TranslatePipe,
      IFDatePipe,
      DatePipe,
      provideMockStore({ initialState }),
      { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
      { provide: ActivatedRoute, useValue: mockActivatedRoute },
      { provide: WindowSizeService, useValue: windowSizeServiceMock },
    ],
  });

  const component = fixture.componentInstance;

  return {
    fixture,
    component,
  };
}
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
    order: 3,
  },
  selectedFilterForBiddingProcess: null,
  filteredBiddingProcessProcurementProcesses: [],
};
const biddingProcessPlanState = {
  biddingProcessPlan: {
    projectBucketId: '9137520d-7bcb-45bc-9fb4-219ce6ac948c',
    version: 44,
    id: '6582e6be-b54c-4b7b-81c3-4b702eafc7b4',
    status: 0,
    approvedDate: null,
    approvedBy: null,
  },
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
    projectAmount: null,
    componentName: 'componentName',
  },
};

const mockActivatedRoute = {
  snapshot: {
    params: {
      processId: '1',
    },
  },
};

function getInitialState(state) {
  let contracts: BiddingContractByProcess[];

  contracts = state
    ? (contracts = [])
    : (contracts = [
        {
          biddingContractId: 'CO-L1229-P0019-C01',
          version: 0,
          visualCode: '123',
          amendments: [],
          code: '',
          parentId: '',
          biddingContractsAwarded: [
            {
              biddingProcessParticipantId: '123',
              biddingProcessBidderId: '123',
              name: 'Lilas Flores',
              nationality: 'CH',
            },
          ],
          contractType: 1,
          contractStatus: 0,
          nationality: 'CH',
          idbAmount: 1500000,
          startDate: '2021-12-10T09:41:11.027Z',
          endDate: '2021-12-10T09:41:11.027Z',
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
          options: [],
        },
        {
          biddingContractId: 'CO-L1229-P0019-C02',
          version: 5,
          visualCode: '345',
          amendments: [],
          code: '',
          parentId: '',
          biddingContractsAwarded: [
            {
              biddingProcessParticipantId: '123',
              biddingProcessBidderId: '123',
              name: 'Favio Chavez',
              nationality: 'PE',
            },
            {
              biddingProcessParticipantId: '123',
              biddingProcessBidderId: '123',
              name: 'Nikolas Matamala',
              nationality: 'CH',
            },
          ],
          contractType: 2,
          contractStatus: 1,
          nationality: 'ES',
          idbAmount: 10000,
          startDate: '2021-12-15T09:41:11.027Z',
          endDate: '2022-09-10T09:41:11.027Z',
          cofinancedAmount: 0,
          localCounterpartAmount: 0,
          options: [],
        },
      ]);

  return {
    procurementContracts: {
      contractsByProcess: {
        '1': {
          procurementContracts: contracts,
          loaded: true,
          loading: false,
          error: null,
        },
      },
    },
    biddingProcessPlan: biddingProcessPlanState,
    enums: {
      biddingContractStatuses: [
        {
          id: 0,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.AMENDMENT_UNDER_REV',
        },
        {
          id: 1,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.EXECUTION',
        },
        {
          id: 2,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.EXECUTION_AMENDMENTS',
        },
        {
          id: 3,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.FINISHED',
        },
        {
          id: 4,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.PENDING_SIGNATURE',
        },
        {
          id: 5,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.SIGNED',
        },
        {
          id: 6,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.TERMINATED',
        },
        {
          id: 7,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.TERMINATION_UNDER_REV',
        },
        {
          id: 8,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.DELETED',
        },
        {
          id: 9,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.AMENDMENTREVIEWED',
        },
        {
          id: 10,
          name: 'ENUM.BIDDING.CONTRACT.STATUS.EXPIRED',
        },
      ],
    },
  };
}
