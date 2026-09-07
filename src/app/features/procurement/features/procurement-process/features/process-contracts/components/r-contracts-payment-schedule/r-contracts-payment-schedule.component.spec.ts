import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  RContractsPaymentScheduleComponent,
  PaymentScheduleMode,
} from './r-contracts-payment-schedule.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BiddingContractApiService } from '@core/services/apis';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import { NotificationGlobalService } from '../../../../../../../../shared';
import { FileSaverService } from 'ngx-filesaver';
import { MatDialog } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';
import { ProjectTask } from '@core/models';

describe('RContractsPaymentScheduleComponent', () => {
  let component: RContractsPaymentScheduleComponent;
  let fixture: ComponentFixture<RContractsPaymentScheduleComponent>;
  let contractApiService: jest.Mocked<BiddingContractApiService>;
  let contractsService: jest.Mocked<ContractRebrandService>;
  let notificationService: jest.Mocked<NotificationGlobalService>;
  let fileSaverService: jest.Mocked<FileSaverService>;
  let dialogService: jest.Mocked<MatDialog>;
  let translateService: jest.Mocked<TranslateService>;

  const mockPaymentSchedule = [
    {
      paymentNumber: 1,
      description: 'Payment 1',
      estimatedDate: '2024-01-01',
      componentId: 'comp-1',
      productId: 'prod-1',
      paymentRequestTypeId: 1,
      currency: 'USD',
      idbAmount: 1000,
      lcAmount: 500,
      cfAmount: 500,
      paymentAmount: 2000,
    },
  ];

  const mockContractData = {
    costDistribution: [
      {
        currency: 'USD',
        componentId: 'comp-1',
        detail: [
          {
            productId: 'prod-1',
            idbTotal: 1000,
            lcTotal: 500,
            cfTotal: 500,
          },
        ],
      },
    ],
  };

  const mockProjectTasks: ProjectTask[] = [
    {
      id: 'comp-1',
      name: 'Component 1',
      actualEndDate: '',
      actualStartDate: '',
      bidActualCost: 0,
      bidEstimatedAmount: 0,
      coFinancingActualCost: 0,
      coFinancingAmount: 0,
      currency: '',
      estimatedEndDate: '',
      estimatedStartDate: '',
      executionWbs: '',
      localCounterpartActualCost: 0,
      localCounterpartAmount: 0,
      status: 0,
      totalActualAmount: 0,
      totalEstimatedAmount: 0,
      type: 0,
    },
    {
      id: 'comp-2',
      name: 'Component 2',
      actualEndDate: '',
      actualStartDate: '',
      bidActualCost: 0,
      bidEstimatedAmount: 0,
      coFinancingActualCost: 0,
      coFinancingAmount: 0,
      currency: '',
      estimatedEndDate: '',
      estimatedStartDate: '',
      executionWbs: '',
      localCounterpartActualCost: 0,
      localCounterpartAmount: 0,
      status: 0,
      totalActualAmount: 0,
      totalEstimatedAmount: 0,
      type: 0,
    },
  ];

  const mockProducts: ProjectTask[] = [
    {
      id: 'prod-1',
      name: 'Product 1',
      actualEndDate: '',
      actualStartDate: '',
      bidActualCost: 0,
      bidEstimatedAmount: 0,
      coFinancingActualCost: 0,
      coFinancingAmount: 0,
      currency: '',
      estimatedEndDate: '',
      estimatedStartDate: '',
      executionWbs: '',
      localCounterpartActualCost: 0,
      localCounterpartAmount: 0,
      status: 0,
      totalActualAmount: 0,
      totalEstimatedAmount: 0,
      type: 0,
    },
    {
      id: 'prod-2',
      name: 'Product 2',
      actualEndDate: '',
      actualStartDate: '',
      bidActualCost: 0,
      bidEstimatedAmount: 0,
      coFinancingActualCost: 0,
      coFinancingAmount: 0,
      currency: '',
      estimatedEndDate: '',
      estimatedStartDate: '',
      executionWbs: '',
      localCounterpartActualCost: 0,
      localCounterpartAmount: 0,
      status: 0,
      totalActualAmount: 0,
      totalEstimatedAmount: 0,
      type: 0,
    },
  ];

  const translations = {
    'R.CONTRACT.PAYMENT_SCHEDULE.MODE.REGULAR.TITLE': 'Regular Entry',
    'R.CONTRACT.PAYMENT_SCHEDULE.MODE.REGULAR.DESCRIPTION':
      'Regular Description',
    'R.CONTRACT.PAYMENT_SCHEDULE.MODE.FILE.TITLE': 'File Upload',
    'R.CONTRACT.PAYMENT_SCHEDULE.MODE.FILE.DESCRIPTION': 'File Description',
    'R.CONTRACT.NOTIFICATIONS.FILE_PROCESSED': 'File processed',
    'R.CONTRACT.NOTIFICATIONS.FILE_ERROR': 'File error',
    'R.CONTRACT.NOTIFICATIONS.SCHEDULE_SAVED': 'Schedule saved',
    'R.CONTRACT.NOTIFICATIONS.SCHEDULE_ERROR': 'Schedule error',
    'R.CONTRACT.NOTIFICATIONS.TEMPLATE_DOWNLOADED': 'Template downloaded',
    'R.CONTRACT.NOTIFICATIONS.TEMPLATE_ERROR': 'Template error',
    'R.CONTRACT.NOTIFICATIONS.SCHEDULE_RESET': 'Schedule reset',
    'R.CONTRACT.NOTIFICATIONS.SCHEDULE_RESET_ERROR': 'Reset error',
  };

  function createTranslateServiceMock() {
    return {
      instant: jest.fn((key: string) => translations[key] || key),
      get: jest.fn((key: string | string[]) => {
        if (Array.isArray(key)) {
          const result = {};
          key.forEach((k) => (result[k] = translations[k] || k));
          return of(result);
        }
        return of(translations[key] || key);
      }),
    };
  }

  beforeEach(() => {
    contractApiService = {
      uploadFilledTemplate: jest.fn(),
      getPaymentScheduleTemplate: jest.fn(),
      postPaymentSchedule: jest.fn(),
      getPaymentSchedule: jest.fn(),
      deletePaymentSchedule: jest.fn(),
    } as any;

    contractsService = {
      paymentScheduleModeSignal: jest.fn().mockReturnValue(null),
      setPaymentScheduleMode: jest.fn(),
      updatePaymentSchedule: jest.fn(),
      setPaymentScheduleFileUploaded: jest.fn(),
      setLoading: jest.fn(),
    } as any;

    notificationService = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
    } as any;

    fileSaverService = {
      save: jest.fn(),
    } as any;

    dialogService = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true)),
      }),
    } as any;

    translateService = createTranslateServiceMock() as any;

    TestBed.configureTestingModule({
      declarations: [RContractsPaymentScheduleComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        FormBuilder,
        { provide: BiddingContractApiService, useValue: contractApiService },
        { provide: ContractRebrandService, useValue: contractsService },
        { provide: NotificationGlobalService, useValue: notificationService },
        { provide: FileSaverService, useValue: fileSaverService },
        { provide: MatDialog, useValue: dialogService },
        { provide: TranslateService, useValue: translateService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(RContractsPaymentScheduleComponent);
    component = fixture.componentInstance;

    // Setup inputs
    component.contractId = 'contract-123';
    component.contractsPaymentRequests = [{ id: 1, name: 'Advance' }];
    component.allCurrenciesRegistered = ['USD', 'EUR'];
    component.contractStartDate = '2024-01-01';
    component.contractEndDate = '2024-12-31';
    component.componentProducts = new Map([['comp-1', mockProducts]]);
    component.allProjectTasks$ = of(mockProjectTasks);
    component.contractData = mockContractData as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize payment schedule modes', () => {
      component.ngOnInit();
      expect(component.paymentScheduleModes.length).toBe(2);
      expect(component.paymentScheduleModes[0].id).toBe(
        PaymentScheduleMode.REGULAR
      );
      expect(component.paymentScheduleModes[1].id).toBe(
        PaymentScheduleMode.FILE
      );
    });

    it('should set selectedMode to REGULAR when paymentSchedule has data', () => {
      component.paymentSchedule = mockPaymentSchedule;
      component.ngOnInit();
      expect(component.selectedMode).toBe(PaymentScheduleMode.REGULAR);
    });

    it('should use saved mode from service', () => {
      contractsService.paymentScheduleModeSignal.mockReturnValue(
        PaymentScheduleMode.FILE
      );
      component.ngOnInit();
      expect(component.selectedMode).toBe(PaymentScheduleMode.FILE);
    });
  });

  describe('Mode Selection', () => {
    it('should change mode', () => {
      component.onModeChange(PaymentScheduleMode.REGULAR);

      expect(component.selectedMode).toBe(PaymentScheduleMode.REGULAR);
      expect(contractsService.setPaymentScheduleMode).toHaveBeenCalledWith(
        PaymentScheduleMode.REGULAR
      );
    });

    it('should show mode selector when no schedule and no mode selected', () => {
      component.paymentSchedule = [];
      component.selectedMode = null;

      expect(component.shouldShowModeSelector()).toBe(true);
    });

    it('should show reset button when schedule exists and mode selected', () => {
      component.paymentSchedule = mockPaymentSchedule;
      component.selectedMode = PaymentScheduleMode.REGULAR;

      expect(component.shouldShowResetButton()).toBe(true);
    });

    it('should show back button when no schedule and mode selected', () => {
      component.paymentSchedule = [];
      component.selectedMode = PaymentScheduleMode.REGULAR;

      expect(component.shouldShowBackToModeSelector()).toBe(true);
    });

    it('should go back to mode selector', () => {
      component.selectedMode = PaymentScheduleMode.REGULAR;
      component.addPayment();

      component.backToModeSelector();

      expect(component.selectedMode).toBeNull();
      expect(component.payments.length).toBe(0);
      expect(contractsService.setPaymentScheduleMode).toHaveBeenCalledWith(
        null
      );
    });
  });

  describe('Validation', () => {
    it('should validate matching currency totals', () => {
      component.contractData = mockContractData as any;
      component.paymentSchedule = mockPaymentSchedule;
      component['initializePaymentSchedule']();

      const validation = component.paymentValidationSignal();

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect exceeded amounts', () => {
      component.contractData = mockContractData as any;
      component.paymentSchedule = [
        {
          ...mockPaymentSchedule[0],
          idbAmount: 2000, // Exceeded
        },
      ];
      component['initializePaymentSchedule']();

      const validation = component.paymentValidationSignal();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect missing payments in form', () => {
      component.contractData = mockContractData as any;
      component.paymentSchedule = []; // No payments for available amounts
      component['initializePaymentSchedule']();

      const validation = component.paymentValidationSignal();

      expect(validation.isValid).toBe(false);
    });
  });

  describe('File Operations', () => {
    it('should upload file', (done) => {
      const mockFile = new File(['content'], 'test.xlsx');
      contractApiService.uploadFilledTemplate.mockReturnValue(
        of(mockPaymentSchedule)
      );

      component.onFileSelected([mockFile]);

      setTimeout(() => {
        expect(contractApiService.uploadFilledTemplate).toHaveBeenCalledWith(
          'contract-123',
          mockFile
        );
        expect(notificationService.showSuccess).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should download template', (done) => {
      const mockResponse = new HttpResponse({
        body: new ArrayBuffer(8),
        headers: new Map([['Content-Type', 'application/xlsx']]) as any,
      });
      contractApiService.getPaymentScheduleTemplate.mockReturnValue(
        of(mockResponse)
      );

      component.downloadTemplate();

      setTimeout(() => {
        expect(
          contractApiService.getPaymentScheduleTemplate
        ).toHaveBeenCalledWith('contract-123');
        expect(fileSaverService.save).toHaveBeenCalled();
        expect(notificationService.showSuccess).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Save Operations', () => {
    it('should save payment schedule', (done) => {
      component.paymentSchedule = [];
      component.addPayment();
      const payment = component.payments.at(0);
      payment.patchValue({
        componentId: 'comp-1',
        productId: 'prod-1',
        currency: 'USD',
        idbAmount: 1000,
      });

      contractApiService.postPaymentSchedule.mockReturnValue(of(null));
      contractApiService.getPaymentSchedule.mockReturnValue(
        of(mockPaymentSchedule)
      );

      component.savePaymentSchedule();

      setTimeout(() => {
        expect(contractApiService.postPaymentSchedule).toHaveBeenCalled();
        expect(notificationService.showSuccess).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should not save when validation fails', () => {
      component.paymentSchedule = [];

      expect(component.canSave()).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    it('should get component name', () => {
      const name = component.getComponentName('comp-1');
      expect(name).toBe('Component 1');
    });

    it('should get product name', () => {
      const name = component.getProductName('prod-1', 'comp-1');
      expect(name).toBe('Product 1');
    });

    it('should group payments by currency/component/product', () => {
      const grouped =
        component.groupPaymentsByCurrencyComponentProduct(mockPaymentSchedule);

      expect(grouped['USD']['comp-1']['prod-1']).toBeDefined();
      expect(grouped['USD']['comp-1']['prod-1'].idbTotal).toBe(1000);
    });

    it('should sort payments by date', () => {
      component.paymentSchedule = [
        { ...mockPaymentSchedule[0], estimatedDate: '2024-03-01' },
        { ...mockPaymentSchedule[0], estimatedDate: '2024-01-01' },
        { ...mockPaymentSchedule[0], estimatedDate: '2024-02-01' },
      ];

      const sorted = component['sortByDate'](component.paymentSchedule);

      expect(sorted[0].estimatedDate).toBe('2024-01-01');
      expect(sorted[1].estimatedDate).toBe('2024-02-01');
      expect(sorted[2].estimatedDate).toBe('2024-03-01');
    });
  });

  describe('Reset Operations', () => {
    it('should confirm and reset payment schedule', (done) => {
      contractApiService.deletePaymentSchedule.mockReturnValue(of([]));

      component.confirmResetPaymentSchedule();

      setTimeout(() => {
        expect(dialogService.open).toHaveBeenCalled();
        expect(contractApiService.deletePaymentSchedule).toHaveBeenCalledWith(
          'contract-123'
        );
        done();
      }, 100);
    });

    it('should reset to original schedule', () => {
      component.paymentSchedule = mockPaymentSchedule;
      component.addPayment(); // Add extra payment

      component.resetToOriginalSchedule();

      expect(component.payments.length).toBe(mockPaymentSchedule.length);
    });
  });

  describe('Signals', () => {
    it('should calculate payment totals', () => {
      component.paymentSchedule = mockPaymentSchedule;
      component['initializePaymentSchedule']();

      const totals = component.paymentsTotalSignal();

      expect(totals[0]).toBe(2000);
    });
  });
});
