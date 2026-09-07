import { SimpleChanges, SimpleChange } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { FinishedDocsComponent } from './finished-docs.component';
import { BiddingProcessDocumentGroupsResults, DocEnum } from '@core/enums';
import { FiduciaryProcessDocument } from '@core/models';
import { BiddingProcessPlanState } from '@core/store';
import { BiddingProcessProcurementProcessStatuses } from '@core/enums';
import { of } from 'rxjs';
import { NotificationService } from '@progress/kendo-angular-notification';
import {
  mockNotificationService,
  MsalProviders,
} from '../../../../../../test/test-helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';

/* const fileServiceMock = {
  downloadFile: jest.fn(),
}; */

const mockDoc = {
  id: '',
  status: 1,
  name: '',
  type: 2,
  operationsDocumentId: 1,
  ezshareNumber: '',
  created: new Date(),
  modified: new Date(),
  createdBy: '',
  relationalId: '',
  participantsOptions: [
    {
      nationality: '',
      biddingProcessBidderId: '',
      biddingProcessParticipantId: 'participant1',
      name: 'John Doe',
    },
    {
      nationality: '',
      biddingProcessBidderId: '',
      biddingProcessParticipantId: 'participant2',
      name: 'Jane Doe',
    },
  ],
};
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
    order: 0,
  },
  selectedFilterForBiddingProcess: null,
  filteredBiddingProcessProcurementProcesses: [],
};
describe('FinishedDocsComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  describe('getAwardeedsNames', () => {
    it('returns correct array of awardeds names', async () => {
      const { component } = await setup();
      const files: FiduciaryProcessDocument[] = [
        {
          description: '',
          ...mockDoc,
          awardeds: ['participant1'],
        },
        {
          description: '',
          id: '',
          status: 1,
          name: '',
          type: 2,
          operationsDocumentId: 1,
          ezshareNumber: '',
          created: new Date(),
          modified: new Date(),
          createdBy: '',
          relationalId: '',
          participantsOptions: [
            {
              nationality: '',
              biddingProcessBidderId: '',
              biddingProcessParticipantId: 'participant3',
              name: 'Bob Smith',
            },
            {
              nationality: '',
              biddingProcessBidderId: '',
              biddingProcessParticipantId: 'participant4',
              name: 'Alice Brown',
            },
          ],
          awardeds: ['participant3', 'participant4'],
        },
      ];
      const result = component.getAwardeedsNames(files);
      expect(result).toEqual([['John Doe'], ['Bob Smith', 'Alice Brown']]);
    });

    it('handles empty input array', async () => {
      const { component } = await setup();
      const files = [];
      const result = component.getAwardeedsNames(files);
      expect(result).toEqual([]);
    });

    it('handles files without awardeds', async () => {
      const { component } = await setup();
      const files: FiduciaryProcessDocument[] = [
        {
          description: '',
          ...mockDoc,
          awardeds: [],
        },
        {
          description: '',
          id: '',
          status: 1,
          name: '',
          type: 2,
          operationsDocumentId: 1,
          ezshareNumber: '',
          created: new Date(),
          modified: new Date(),
          createdBy: '',
          relationalId: '',
          participantsOptions: [
            {
              nationality: '',
              biddingProcessBidderId: '',
              biddingProcessParticipantId: 'participant3',
              name: 'Bob Smith',
            },
            {
              nationality: '',
              biddingProcessBidderId: '',
              biddingProcessParticipantId: 'participant4',
              name: 'Alice Brown',
            },
          ],
          awardeds: [],
        },
      ];
      const result = component.getAwardeedsNames(files);
      expect(result).toEqual([[], []]);
    });
  });

  describe('getColumnsVisibility', () => {
    it('returns correct visibility when mode is PACKAGES and some files have results', async () => {
      const { component } = await setup();
      const files: FiduciaryProcessDocument[] = [
        {
          description: '',
          ...mockDoc,
          awardeds: [],
          result: -1,
        },
        {
          description: '',
          ...mockDoc,
          awardeds: [],
          result: BiddingProcessDocumentGroupsResults.AWARDED,
        },
        {
          description: '',
          ...mockDoc,
          awardeds: [],
          result: BiddingProcessDocumentGroupsResults.REJECTED,
        },
      ];
      const mode = DocEnum.PACKAGES;
      const visibility = component.getColumnsVisibility(mode, files);
      expect(visibility.showResultColumn).toBe(true);
      expect(visibility.showAwardedsColumn).toBe(true);
    });

    it('returns correct visibility when mode is PACKAGES and no files have results', async () => {
      const { component } = await setup();
      const files: FiduciaryProcessDocument[] = [
        {
          description: '',
          ...mockDoc,
          awardeds: [],
          result: -1,
        },
        {
          description: '',
          ...mockDoc,
          awardeds: [],
          result: -1,
        },
        {
          description: '',
          ...mockDoc,
          awardeds: [],
          result: -1,
        },
      ];
      const mode = DocEnum.PACKAGES;
      const visibility = component.getColumnsVisibility(mode, files);
      expect(visibility.showResultColumn).toBe(false);
      expect(visibility.showAwardedsColumn).toBe(false);
    });

    it('returns correct visibility when mode is not PACKAGES', async () => {
      const { component } = await setup();
      const files: FiduciaryProcessDocument[] = [
        {
          description: '',
          ...mockDoc,
          awardeds: ['participant1'],
          result: -1,
        },
        {
          description: '',
          ...mockDoc,
          awardeds: ['participant1'],
          result: BiddingProcessDocumentGroupsResults.AWARDED,
        },
        {
          description: '',
          ...mockDoc,
          awardeds: ['participant1'],
          result: BiddingProcessDocumentGroupsResults.REJECTED,
        },
      ];
      const mode = DocEnum.CONTRACTS;
      const visibility = component.getColumnsVisibility(mode, files);
      expect(visibility.showResultColumn).toBe(false);
      expect(visibility.showAwardedsColumn).toBe(false);
    });
  });

  describe('mode setter', () => {
    it('should set the mode property correctly', async () => {
      const { component } = await setup();
      component.mode = DocEnum.CONTRACTS;
      expect(component._mode).toEqual(DocEnum.CONTRACTS);

      component.mode = DocEnum.AMENDMENTS;
      expect(component._mode).toEqual(DocEnum.AMENDMENTS);

      component.mode = DocEnum.TRANSACTIONS;
      expect(component._mode).toEqual(DocEnum.TRANSACTIONS);

      component.mode = DocEnum.PACKAGES;
      expect(component._mode).toEqual(DocEnum.PACKAGES);
    });

    it('should set the showMandatoryColumn property to true when mode is PACKAGES', async () => {
      const { component } = await setup();
      component.mode = DocEnum.PACKAGES;
      expect(component.showMandatoryColumn).toBe(true);
    });

    it('should set the enumType property correctly', async () => {
      const { component } = await setup();
      component.mode = DocEnum.CONTRACTS;
      expect(component.enumType).toEqual(
        component.enum.biddingContractDocumentGroupCodes
      );

      component.mode = DocEnum.AMENDMENTS;
      expect(component.enumType).toEqual(
        component.enum.biddingContractAmendmentDocumentGroupCodes
      );

      component.mode = DocEnum.TRANSACTIONS;
      expect(component.enumType).toEqual(
        component.enum.transactionDocumentGroupCodes
      );

      component.mode = DocEnum.PACKAGES;
      expect(component.enumType).toEqual(
        component.enum.biddingProcessDocumentGroupCodes
      );

      component.mode = 'invalid value' as DocEnum;
      expect(component.enumType).toEqual(
        component.enum.biddingProcessDocumentGroupCodes
      );
    });
  });

  describe('ngOnchanges', () => {
    it('should call checkPermissionTodownload if have changes meet with the conditions', async () => {
      const { component } = await setup();
      component.isDocumentTap = true;
      const mockSimpleChanges: SimpleChanges = {
        files: new SimpleChange(undefined, null, false),
        mode: new SimpleChange(undefined, null, false),
        documentDownloadDocumentGuestPermission: new SimpleChange(
          undefined,
          null,
          false
        ),
        documentDownloadDocumentPermission: new SimpleChange(
          undefined,
          null,
          false
        ),
      };
      const checkPermissionSpy = jest
        .spyOn(component, 'checkPermissionTodownload')
        .mockReturnValue();
      component.ngOnChanges(mockSimpleChanges);
      expect(checkPermissionSpy).toHaveBeenCalled();
    });

    it('should NOT call checkPermissionTodownload if DONT have changes meet with the conditions', async () => {
      const { component } = await setup();
      component.isDocumentTap = true;
      const mockSimpleChanges: SimpleChanges = {};
      const checkPermissionSpy = jest
        .spyOn(component, 'checkPermissionTodownload')
        .mockReturnValue();
      component.ngOnChanges(mockSimpleChanges);
      expect(checkPermissionSpy).not.toHaveBeenCalled();
    });
  });
  describe('checkPermissionTodownload', () => {
    it('should can download files for EXPECTED status if has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.EXPECTED;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(true);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownloadGuest).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentGuestPermission
      );
    });
    it('should CANT download files for EXPECTED status if NOT has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.EXPECTED;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(false);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownloadGuest).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentGuestPermission
      );
    });

    it('should can download files for CONTRACT UNDER EXEC status if has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(true);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownload).toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentPermission
      );
    });
    it('should can download files for CONTRACT UNDER EXEC status if has permission', async () => {
      const { component } = await setup();
      storeBiddingProcessPlanState.selectedBiddingProcessProcurementProcess.status =
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION;
      jest
        .spyOn(component.biddingStoreSvc, 'biddingProcessPlan')
        .mockReturnValue(of(storeBiddingProcessPlanState));
      const permissionService = jest
        .spyOn(component.permissionSvc, 'haveSomePermissions')
        .mockReturnValue(false);
      component.checkPermissionTodownload();
      expect(component.hasPermissionDownload).not.toBe(true);
      expect(permissionService).toHaveBeenCalledWith(
        component.documentDownloadDocumentPermission
      );
    });
  });
});

async function setup() {
  /* const initialState = getInitialState(); */
  const { fixture } = await render(FinishedDocsComponent, {
    declarations: [FinishedDocsComponent],
    schemas: [],
    componentProperties: {
      _files: [],
    },
    imports: [
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
      HttpClientTestingModule,
      RouterTestingModule,
    ],
    providers: [
      {
        provide: NotificationService,
        useValue: mockNotificationService,
      },
      provideMockStore({}),
      ...MsalProviders,
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

/* function getInitialState() {
  return {};
} */
