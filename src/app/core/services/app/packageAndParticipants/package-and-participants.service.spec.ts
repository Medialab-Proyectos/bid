import { TestBed } from '@angular/core/testing';
import { PackageAndParticipantsService } from './package-and-participants.service';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('PackageAndParticipantsService', () => {
  let packageAndParticipantsService;
  let mockProjectSvc;
  let mockBiddingProcessPlanStore;
  let mockDocumentsApi;
  let mockConfigSvc;
  let mockParticipantsApi;
  let mockBidderApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})],
    });

    mockProjectSvc = {
      selectedProject: jest.fn(),
    };
    mockBiddingProcessPlanStore = {
      biddingProcessPlan: jest.fn(),
    };
    mockDocumentsApi = {
      getBiddingProcessDocumentPackages: jest.fn(),
    };
    mockConfigSvc = {
      settings: jest.fn(),
    };
    mockParticipantsApi = {
      getParticipants: jest.fn(),
    };
    mockBidderApi = {
      searchBidderById: jest.fn(),
      searchBidderLocationsById: jest.fn(),
    };

    packageAndParticipantsService = new PackageAndParticipantsService(
      mockProjectSvc,
      mockBiddingProcessPlanStore,
      mockDocumentsApi,
      mockConfigSvc,
      mockParticipantsApi,
      mockBidderApi,
      null
    );
  });

  it('should be created', () => {
    expect(packageAndParticipantsService).toBeTruthy();
  });
  describe('checkData', () => {
    it('should return the expected result when all conditions are met', () => {
      const selectedProject = { selectedProject: 'project', loaded: true };
      const selectedPlan = {
        selectedBiddingProcessProcurementProcess: { id: 'plan' },
        isSelectedProcessLoaded: true,
      };
      const documentPackages = [
        { isOptional: false, order: 1, status: 'NOT_STARTED', code: 1 },
        { isOptional: true, order: 2, status: 'RETURNED', code: 2 },
      ];
      const settings = [
        {
          values: JSON.stringify({
            attribute1: 'R',
            attribute2: 'N',
            attribute3: 'R',
          }),
        },
      ];
      const participants = [
        { biddingProcessBidderId: 'bidder1' },
        { biddingProcessBidderId: 'bidder2' },
      ];

      // Mock selectedProject
      mockProjectSvc.selectedProject.mockReturnValue(of(selectedProject));

      // Mock biddingProcessPlan
      mockBiddingProcessPlanStore.biddingProcessPlan.mockReturnValue(
        of(selectedPlan)
      );

      // Mock getBiddingProcessDocumentPackages
      mockDocumentsApi.getBiddingProcessDocumentPackages.mockReturnValue(
        of({ biddingProcessDocumentPackage: documentPackages })
      );

      // Mock settings
      mockConfigSvc.settings.mockReturnValue(of({ settings }));

      // Mock getParticipants
      mockParticipantsApi.getParticipants.mockReturnValue(
        of({ participantsDetail: participants })
      );

      // Mock searchBidderById
      mockBidderApi.searchBidderById.mockReturnValue(
        of({ biddingProcessBidder: { id: 'bidder1' } })
      );

      // Mock searchBidderLocationsById
      mockBidderApi.searchBidderLocationsById.mockReturnValue(
        of({
          additionalData: {
            locations: [
              { address: 'Address', zipCode: '12345', country: 'Country' },
            ],
          },
        })
      );

      // Call the method
      const result$ = packageAndParticipantsService.checkData();
      const expectedResult = {
        packages: documentPackages,
        code: 1,
        selectedProject,
        selectedPlan,
        configValues: {
          attribute1: 'R',
          attribute2: 'N',
          attribute3: 'R',
        },
        participants: [
          {
            biddingProcessBidderId: 'bidder1',
            bidder: {
              id: 'bidder1',
              address: 'Address',
              zipCode: '12345',
              country: 'Country',
            },
            allowToEdit: true,
          },
          {
            biddingProcessBidderId: 'bidder2',
            bidder: {
              id: 'bidder1',
              address: '',
              zipCode: '',
              country: null,
            },
            allowToEdit: true,
          },
        ],
        disabledBtn: true,
      };

      // Assert the result
      result$.subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

      // Check the calls
      expect(mockProjectSvc.selectedProject).toHaveBeenCalled();
      expect(mockBiddingProcessPlanStore.biddingProcessPlan).toHaveBeenCalled();
      expect(
        mockDocumentsApi.getBiddingProcessDocumentPackages
      ).toHaveBeenCalledWith('plan', false);
    });
  });

  describe('addDisabledProperty', () => {
    it('should add the allowToEdit property to each participant', () => {
      const participants = [
        { biddingContractAwarded: true, biddingProcessDocumentAwarded: false },
        { biddingContractAwarded: false, biddingProcessDocumentAwarded: true },
        { biddingContractAwarded: false, biddingProcessDocumentAwarded: false },
      ];
      const expectedResult = [
        {
          biddingContractAwarded: true,
          biddingProcessDocumentAwarded: false,
          allowToEdit: false,
        },
        {
          biddingContractAwarded: false,
          biddingProcessDocumentAwarded: true,
          allowToEdit: false,
        },
        {
          biddingContractAwarded: false,
          biddingProcessDocumentAwarded: false,
          allowToEdit: true,
        },
      ];

      const result =
        packageAndParticipantsService.addDisabledProperty(participants);

      expect(result).toEqual(expectedResult);
    });
  });
});
