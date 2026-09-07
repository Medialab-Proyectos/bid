import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContractRebrandService } from './contract-rebrand.service';
import {
  Enumerator,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import {
  ContractResponse,
  ContractPaymentScheduleResponse,
} from '../rebrand-form/models';
import { BiddingContractDocumentGroupCode } from '@core/enums';
import { PaymentScheduleMode } from '../components/r-contracts-payment-schedule/r-contracts-payment-schedule.component';

describe('ContractRebrandService', () => {
  let service: ContractRebrandService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [ContractRebrandService],
    });
    service = TestBed.inject(ContractRebrandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Signal Management', () => {
    it('should set contract just updated signal', () => {
      service.setContractJustUpdated(true);
      expect(service.contractJustUpdatedSignal()).toBe(true);

      service.setContractJustUpdated(false);
      expect(service.contractJustUpdatedSignal()).toBe(false);
    });

    it('should set payment schedule mode', () => {
      const mode: PaymentScheduleMode = 1;
      service.setPaymentScheduleMode(mode);
      expect(service.paymentScheduleModeSignal()).toBe(mode);

      service.setPaymentScheduleMode(null);
      expect(service.paymentScheduleModeSignal()).toBeNull();
    });

    it('should set preloaded data', () => {
      const mockData = {
        paymentSchedule: [] as ContractPaymentScheduleResponse[],
        contractData: {} as ContractResponse,
        documents: [] as FiduciaryProcessDocumentGroup[],
      };

      service.setPreloadedData(mockData);
      expect(service.contractPreloadedDataSignal()).toEqual(mockData);
    });

    it('should update contract data', () => {
      const initialData = {
        paymentSchedule: [],
        contractData: { id: '1' } as ContractResponse,
        documents: [],
      };
      service.setPreloadedData(initialData);

      const updatedContract = { id: '2' } as ContractResponse;
      service.updateContractData(updatedContract);

      expect(service.contractPreloadedDataSignal().contractData).toEqual(
        updatedContract
      );
    });

    it('should update document groups', () => {
      const initialData = {
        paymentSchedule: [],
        contractData: {} as ContractResponse,
        documents: [],
      };
      service.setPreloadedData(initialData);

      const newDocuments = [{ id: '1' }] as FiduciaryProcessDocumentGroup[];
      service.updateDocumentGroups(newDocuments);

      expect(service.contractPreloadedDataSignal().documents).toEqual(
        newDocuments
      );
    });

    it('should set contract groups', () => {
      const groups = [{ id: '1' }] as FiduciaryProcessDocumentGroup[];
      service.setContractGroups(groups);
      expect(service.contractGroupsSignal()).toEqual(groups);
    });
  });

  describe('BehaviorSubject Management', () => {
    it('should update sign date', (done) => {
      const testDate = '2024-01-01';
      service.contractSignDate$.subscribe((date) => {
        if (date) {
          expect(date).toBe(testDate);
          done();
        }
      });
      service.setSignDate(testDate);
    });

    it('should update isSubmitted state', (done) => {
      service.isFormSubmitted$.subscribe((isSubmitted) => {
        if (isSubmitted) {
          expect(isSubmitted).toBe(true);
          done();
        }
      });
      service.isSubmitted(true);
    });

    it('should update loading state', (done) => {
      service.loading$.subscribe((loading) => {
        if (!loading) {
          expect(loading).toBe(false);
          done();
        }
      });
      service.setLoading(false);
    });
  });

  describe('Document State Management', () => {
    beforeEach(() => {
      const mockGroups: FiduciaryProcessDocumentGroup[] = [
        {
          id: '1',
          groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
          isMandatory: true,
          fiduciaryProcessDocuments: [],
        },
        {
          id: '2',
          groupCode: BiddingContractDocumentGroupCode.OTHER,
          isMandatory: false,
          fiduciaryProcessDocuments: [],
        },
      ];
      const mockEnums: Enumerator[] = [
        { id: 1, name: 'Type 1' },
        { id: 2, name: 'Type 2' },
      ];
      service.initializeDocumentState(mockEnums, mockGroups);
    });

    it('should initialize document state', () => {
      expect(service.groupEnums().length).toBe(2);
      expect(service.mandatoryDocs().length).toBe(1);
      expect(service.optionalDocs().length).toBe(1);
    });

    it('should update pending docs', () => {
      const mockDocs: FiduciaryProcessDocument[] = [
        {
          id: '1',
          name: 'doc1.pdf',
          groupCode: null,
        } as FiduciaryProcessDocument,
      ];

      service.updatePendingDocs(mockDocs);
      expect(service.allDocuments().length).toBe(1);
    });

    it('should remove pending document', () => {
      const mockDocs: FiduciaryProcessDocument[] = [
        {
          id: '1',
          name: 'doc1.pdf',
          groupCode: null,
        } as FiduciaryProcessDocument,
        {
          id: '2',
          name: 'doc2.pdf',
          groupCode: null,
        } as FiduciaryProcessDocument,
      ];

      service.updatePendingDocs(mockDocs);
      service.removePendingDocument('doc1.pdf');

      const remaining = service
        .allDocuments()
        .filter((d) => d.name === 'doc1.pdf');
      expect(remaining.length).toBe(0);
    });

    it('should remove document from state', () => {
      const mockDoc: FiduciaryProcessDocument = {
        id: 'doc-1',
        name: 'test.pdf',
        groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
      } as FiduciaryProcessDocument;

      const mockGroups: FiduciaryProcessDocumentGroup[] = [
        {
          id: '1',
          groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
          isMandatory: true,
          fiduciaryProcessDocuments: [mockDoc],
        },
      ];

      service.initializeDocumentState([], mockGroups);
      service.removeDocumentFromState('doc-1');

      const docs = service.allDocuments().filter((d) => d.id === 'doc-1');
      expect(docs.length).toBe(0);
    });

    it('should get group by document', () => {
      const mockDoc: FiduciaryProcessDocument = {
        id: '1',
        name: 'doc.pdf',
        groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
      } as FiduciaryProcessDocument;

      const group = service.getGroup(mockDoc);
      expect(group?.groupCode).toBe(
        BiddingContractDocumentGroupCode.SIGNED_CONTRACT
      );
    });

    it('should set loading state', () => {
      service.setLoadingState(true);
      expect(service.isLoading()).toBe(true);

      service.setLoadingState(false);
      expect(service.isLoading()).toBe(false);
    });

    it('should detect if document already exists', () => {
      const existingDoc: FiduciaryProcessDocument = {
        id: '1',
        name: 'existing.pdf',
        groupCode: null,
      } as FiduciaryProcessDocument;

      service.updatePendingDocs([existingDoc]);

      const newFiles = [{ name: 'existing.pdf' }];
      expect(service.documentAlreadyExists(newFiles)).toBe(true);

      const differentFiles = [{ name: 'different.pdf' }];
      expect(service.documentAlreadyExists(differentFiles)).toBe(false);
    });
  });

  describe('Document Validation', () => {
    it('should validate unique document constraint', () => {
      const mockGroup: FiduciaryProcessDocumentGroup = {
        id: '1',
        groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
        isMandatory: true,
        fiduciaryProcessDocuments: [
          { id: '1', name: 'contract.pdf' } as FiduciaryProcessDocument,
        ],
      };

      service.initializeDocumentState([], [mockGroup]);
      const state = service._documentState();

      const isValid = service.isValidOperation(state, mockGroup, false);
      expect(isValid).toBe(false);
    });

    it('should allow editing description on unique group', () => {
      const mockGroup: FiduciaryProcessDocumentGroup = {
        id: '1',
        groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
        isMandatory: true,
        fiduciaryProcessDocuments: [
          { id: '1', name: 'contract.pdf' } as FiduciaryProcessDocument,
        ],
      };

      service.initializeDocumentState([], [mockGroup]);
      const state = service._documentState();

      const isValid = service.isValidOperation(state, mockGroup, true);
      expect(isValid).toBe(true);
    });

    it('should validate description required constraint', () => {
      const mockGroup: FiduciaryProcessDocumentGroup = {
        id: '1',
        groupCode: BiddingContractDocumentGroupCode.OTHER,
        isMandatory: false,
        fiduciaryProcessDocuments: [],
      };

      service.initializeDocumentState([], [mockGroup]);
      const state = service._documentState();

      const docWithoutDesc: FiduciaryProcessDocument = {
        id: '1',
        name: 'test.pdf',
        description: '',
      } as FiduciaryProcessDocument;

      const isValid = service.isValidOperation(
        state,
        mockGroup,
        false,
        docWithoutDesc
      );
      expect(isValid).toBe(false);

      const docWithDesc: FiduciaryProcessDocument = {
        id: '1',
        name: 'test.pdf',
        description: 'Valid description',
      } as FiduciaryProcessDocument;

      const isValidWithDesc = service.isValidOperation(
        state,
        mockGroup,
        false,
        docWithDesc
      );
      expect(isValidWithDesc).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should compute canProceed correctly', () => {
      const mockMandatoryGroup: FiduciaryProcessDocumentGroup = {
        id: '1',
        groupCode: BiddingContractDocumentGroupCode.SIGNED_CONTRACT,
        isMandatory: true,
        fiduciaryProcessDocuments: [
          { id: '1', name: 'contract.pdf' } as FiduciaryProcessDocument,
        ],
      };

      service.initializeDocumentState([], [mockMandatoryGroup]);
      expect(service.canProceed()).toBe(true);

      service.updatePendingDocs([
        { id: '2', name: 'pending.pdf' } as FiduciaryProcessDocument,
      ]);
      expect(service.canProceed()).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should round to number correctly', () => {
      const result = service.roundToNumber(100, 2, 2);
      expect(result).toBe(50);

      const result2 = service.roundToNumber(100, 3, 3);
      expect(result2).toBe(33.333);
    });
  });

  describe('Form Mapping', () => {
    it('should map fees correctly', () => {
      const mockContract = {
        controls: {
          fees: {
            controls: {
              fees: {
                getRawValue: () => [
                  {
                    concept: 'Fee 1',
                    currency: 'USD',
                    hours: 10,
                    subtotal: 1000,
                  },
                ],
              },
            },
          },
        },
      } as any;

      const result = (service as any).mapFees(mockContract);
      expect(result.length).toBe(1);
      expect(result[0].concept).toBe('Fee 1');
      expect(result[0].usdEquivalent).toBe(1000);
    });

    it('should map general information correctly', () => {
      const mockContract = {
        controls: {
          generalInfo: {
            controls: {
              contractName: { getRawValue: () => 'Test Contract' },
              contractObjective: { getRawValue: () => 'Test Objective' },
              signatureDate: { getRawValue: () => '2024-01-01' },
              startDate: { getRawValue: () => '2024-01-02' },
              endDate: { getRawValue: () => '2024-12-31' },
              internalControlNumber: { getRawValue: () => 'ICN-001' },
              contractType: { getRawValue: () => 'Type A' },
              hasAdvancePayment: { getRawValue: () => true },
              conflictResolutionMethod: { getRawValue: () => 'Arbitration' },
              applicableLaw: { getRawValue: () => 'Local Law' },
              goodsSource: { getRawValue: () => ['Source1'] },
              justification: { getRawValue: () => 'Justified' },
            },
          },
        },
      } as any;

      const result = (service as any).mapGeneralInformation(mockContract);
      expect(result.name).toBe('Test Contract');
      expect(result.hasAdvancedPayment).toBe(true);
      expect(result.goodsOrigins).toEqual(['Source1']);
    });

    it('should map lots correctly', () => {
      const mockContract = {
        controls: {
          lots: {
            controls: {
              lots: {
                getRawValue: () => [
                  {
                    name: 'Lot 1',
                    unit: 'kg',
                    currency: 'USD',
                    amount: 100,
                  },
                ],
              },
            },
          },
        },
      } as any;

      const result = (service as any).mapLots(mockContract);
      expect(result.length).toBe(1);
      expect(result[0].lotNumber).toBe('Lot 1');
    });

    it('should map execution works correctly', () => {
      const mockContract = {
        controls: {
          executionPlace: {
            controls: {
              locations: {
                getRawValue: () => [
                  {
                    address: '123 Main St',
                    zipCode: '12345',
                    country: 'US',
                    locality: 'City',
                  },
                ],
              },
            },
          },
        },
      } as any;

      const result = (service as any).mapExecutionWorks(mockContract);
      expect(result.length).toBe(1);
      expect(result[0].address).toBe('123 Main St');
      expect(result[0].postalCode).toBe('12345');
    });

    it('should map guarantees correctly', () => {
      const mockContract = {
        controls: {
          additionalInformation: {
            controls: {
              guarantees: {
                getRawValue: () => [
                  {
                    guaranteeType: 'Type1',
                    currency: 'USD',
                    amount: 5000,
                    usdEquivalentAmount: 5000,
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                  },
                ],
              },
            },
          },
        },
      } as any;

      const result = (service as any).mapGuarantees(mockContract);
      expect(result.length).toBe(1);
      expect(result[0].guaranteeTypeId).toBe('Type1');
      expect(result[0].amount).toBe(5000);
    });

    it('should return null for damages when control is missing', () => {
      const mockContract = {
        controls: {
          additionalInformation: {
            controls: {
              damages: {
                controls: [],
              },
            },
          },
        },
      } as any;

      const result = (service as any).mapDamages(mockContract);
      expect(result).toBeNull();
    });

    it('should return null for bonus when control is missing', () => {
      const mockContract = {
        controls: {
          additionalInformation: {
            controls: {
              bonus: {
                controls: [],
              },
            },
          },
        },
      } as any;

      const result = (service as any).mapBonus(mockContract);
      expect(result).toBeNull();
    });
  });
});
