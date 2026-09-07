import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContractProgressService } from './contract-progress.service';
import {
  BiddingContractApiService,
  GeneralProcurementDocumentsApiService,
} from '@core/services/apis';

describe('ContractProgressService', () => {
  let service: ContractProgressService;
  let contractApiService: jest.Mocked<BiddingContractApiService>;
  let documentsApiService: jest.Mocked<GeneralProcurementDocumentsApiService>;

  beforeEach(() => {
    const contractApiMock = {
      getContractByIdV2: jest.fn(),
      getPaymentSchedule: jest.fn(),
    } as any;

    const documentsApiMock = {
      getGroups: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ContractProgressService,
        { provide: BiddingContractApiService, useValue: contractApiMock },
        {
          provide: GeneralProcurementDocumentsApiService,
          useValue: documentsApiMock,
        },
      ],
    });

    service = TestBed.inject(ContractProgressService);
    contractApiService = TestBed.inject(
      BiddingContractApiService
    ) as jest.Mocked<BiddingContractApiService>;
    documentsApiService = TestBed.inject(
      GeneralProcurementDocumentsApiService
    ) as jest.Mocked<GeneralProcurementDocumentsApiService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.invalidateCache('test-contract-id');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProgress', () => {
    it('should return false for contractExists when API fails', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(
        throwError(() => new Error('Contract not found'))
      );
      contractApiService.getPaymentSchedule.mockReturnValue(of([]));
      documentsApiService.getGroups.mockReturnValue(of([]));

      service.getProgress(contractId).subscribe((progress) => {
        expect(progress.contractExists).toBe(false);
        done();
      });
    });

    it('should return false for hasPaymentSchedule when schedule is empty', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(of({} as any));
      contractApiService.getPaymentSchedule.mockReturnValue(of([]));
      documentsApiService.getGroups.mockReturnValue(of([]));

      service.getProgress(contractId).subscribe((progress) => {
        expect(progress.hasPaymentSchedule).toBe(false);
        done();
      });
    });

    it('should return false for hasPaymentSchedule when API fails', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(of({} as any));
      contractApiService.getPaymentSchedule.mockReturnValue(
        throwError(() => new Error('Payment schedule error'))
      );
      documentsApiService.getGroups.mockReturnValue(of([]));

      service.getProgress(contractId).subscribe((progress) => {
        expect(progress.hasPaymentSchedule).toBe(false);
        done();
      });
    });

    it('should return false for hasDocuments when documents array is empty', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(of({} as any));
      contractApiService.getPaymentSchedule.mockReturnValue(of([]));
      documentsApiService.getGroups.mockReturnValue(of([]));

      service.getProgress(contractId).subscribe((progress) => {
        expect(progress.hasDocuments).toBe(false);
        done();
      });
    });

    it('should return false for hasDocuments when API fails', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(of({} as any));
      contractApiService.getPaymentSchedule.mockReturnValue(of([]));
      documentsApiService.getGroups.mockReturnValue(
        throwError(() => new Error('Documents error'))
      );

      service.getProgress(contractId).subscribe((progress) => {
        expect(progress.hasDocuments).toBe(false);
        done();
      });
    });

    it('should use cached result on subsequent calls', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(of({} as any));
      contractApiService.getPaymentSchedule.mockReturnValue(
        of([{ id: 1 }] as any)
      );
      documentsApiService.getGroups.mockReturnValue(of([{ id: 1 }] as any));

      // Primera llamada
      service.getProgress(contractId).subscribe(() => {
        // Segunda llamada (debe usar cache)
        service.getProgress(contractId).subscribe((progress) => {
          expect(progress.hasPaymentSchedule).toBe(true);
          // Verificar que solo se llamó una vez
          expect(contractApiService.getContractByIdV2).toHaveBeenCalledTimes(1);
          expect(contractApiService.getPaymentSchedule).toHaveBeenCalledTimes(
            1
          );
          expect(documentsApiService.getGroups).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('should bypass cache when forceRefresh is true', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(of({} as any));
      contractApiService.getPaymentSchedule.mockReturnValue(
        of([{ id: 1 }] as any)
      );
      documentsApiService.getGroups.mockReturnValue(of([{ id: 1 }] as any));

      // Primera llamada
      service.getProgress(contractId).subscribe(() => {
        // Segunda llamada con forceRefresh
        service.getProgress(contractId, true).subscribe(() => {
          // Verificar que se llamó dos veces
          expect(contractApiService.getContractByIdV2).toHaveBeenCalledTimes(2);
          expect(contractApiService.getPaymentSchedule).toHaveBeenCalledTimes(
            2
          );
          expect(documentsApiService.getGroups).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });
  });

  describe('invalidateCache', () => {
    it('should remove contract from cache', (done) => {
      const contractId = 'contract-123';

      contractApiService.getContractByIdV2.mockReturnValue(of({} as any));
      contractApiService.getPaymentSchedule.mockReturnValue(of([]));
      documentsApiService.getGroups.mockReturnValue(of([]));

      // Cargar en cache
      service.getProgress(contractId).subscribe(() => {
        // Invalidar cache
        service.invalidateCache(contractId);

        // Llamar de nuevo
        service.getProgress(contractId).subscribe(() => {
          // Debería haber hecho 2 llamadas (no usó cache)
          expect(contractApiService.getContractByIdV2).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });
  });

  describe('canAccessStep', () => {
    it('should return true for step 0 (always accessible)', () => {
      const progress = {
        contractExists: false,
        hasPaymentSchedule: false,
        hasDocuments: false,
      };

      expect(service.canAccessStep(0, progress)).toBe(true);
    });

    it('should return true for step 1 when contract exists', () => {
      const progress = {
        contractExists: true,
        hasPaymentSchedule: false,
        hasDocuments: false,
      };

      expect(service.canAccessStep(1, progress)).toBe(true);
    });

    it('should return false for step 1 when contract does not exist', () => {
      const progress = {
        contractExists: false,
        hasPaymentSchedule: false,
        hasDocuments: false,
      };

      expect(service.canAccessStep(1, progress)).toBe(false);
    });

    it('should return true for step 2 when contract exists', () => {
      const progress = {
        contractExists: true,
        hasPaymentSchedule: false,
        hasDocuments: false,
      };

      expect(service.canAccessStep(2, progress)).toBe(true);
    });

    it('should return false for step 2 when contract does not exist', () => {
      const progress = {
        contractExists: false,
        hasPaymentSchedule: false,
        hasDocuments: false,
      };

      expect(service.canAccessStep(2, progress)).toBe(false);
    });

    it('should return true for step 3 when contract exists and has documents', () => {
      const progress = {
        contractExists: true,
        hasPaymentSchedule: false,
        hasDocuments: true,
      };

      expect(service.canAccessStep(3, progress)).toBe(true);
    });

    it('should return false for step 3 when contract exists but has no documents', () => {
      const progress = {
        contractExists: true,
        hasPaymentSchedule: false,
        hasDocuments: false,
      };

      expect(service.canAccessStep(3, progress)).toBe(false);
    });

    it('should return false for step 3 when contract does not exist', () => {
      const progress = {
        contractExists: false,
        hasPaymentSchedule: false,
        hasDocuments: true,
      };

      expect(service.canAccessStep(3, progress)).toBe(false);
    });

    it('should return false for invalid step index', () => {
      const progress = {
        contractExists: true,
        hasPaymentSchedule: true,
        hasDocuments: true,
      };

      expect(service.canAccessStep(4, progress)).toBe(false);
      expect(service.canAccessStep(-1, progress)).toBe(false);
      expect(service.canAccessStep(999, progress)).toBe(false);
    });
  });
});
