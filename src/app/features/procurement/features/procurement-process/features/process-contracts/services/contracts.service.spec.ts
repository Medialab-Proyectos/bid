import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { NotificationService } from '@progress/kendo-angular-notification';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { ContractsService } from './contracts.service';
import { of, throwError } from 'rxjs';
import {
  ModalService,
  NotificationGlobalService,
} from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { BiddingContractByProcess, ModalOptions } from '@core/models';
import { BiddingContractApiService } from '@core/services/apis';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
const translateServiceMock = {
  instant: jest.fn(),
};
const modalServiceMock = {
  open: jest.fn(),
};
const binddingContractsApiMock = {
  terminateContract: jest.fn(),
  deleteContract: jest.fn(),
};
describe('ContractsService', () => {
  let service: ContractsService;
  let notificationGlobalService: NotificationGlobalService;
  let translateService: TranslateService;
  let fiModalSvc: ModalService;
  let binddingContractsApi: BiddingContractApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DialogModule,
        HttpClientTestingModule,
        MsalTestModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        NotificationService,
        provideMockStore({}),
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
        {
          provide: ModalService,
          useValue: modalServiceMock,
        },
        {
          provide: BiddingContractApiService,
          useValue: binddingContractsApiMock,
        },
      ],
    });
    service = TestBed.inject(ContractsService);
    notificationGlobalService = TestBed.inject(NotificationGlobalService);
    translateService = TestBed.inject(TranslateService);
    fiModalSvc = TestBed.inject(ModalService);
    binddingContractsApi = TestBed.inject(BiddingContractApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call fiModalSvc with specifict keys  when terminateContractModal is called', () => {
    const modalSpy = jest.spyOn(fiModalSvc, 'open').mockReturnValue(of());
    service.terminateContractModal();

    expect(modalSpy).toHaveBeenCalledWith(
      service['modalTerminateTitle'],
      [
        { text: 'CONTRACT.MODAL_TERMINATE_CONTRACT.CANCEL' },
        {
          text: 'CONTRACT.MODAL_TERMINATE_CONTRACT.TERMINATE_CONTRACT',
          cssClass: 'k-primary',
        },
      ],
      [{ key: 'CONTRACT.MODAL_TERMINATE_CONTRACT.CONTENT1', bold: false }]
    );
  });

  it('should call fiModalSvc with specifict keys when completeContractModal is called', () => {
    const modalSpy = jest.spyOn(fiModalSvc, 'open').mockReturnValue(of());
    service.completeContractModal();

    expect(modalSpy).toHaveBeenCalledWith(
      service['modalCompleteTitle'],
      [
        { text: 'CONTRACT.MODAL_COMPLETE_CONTRACT.CANCEL' },
        {
          text: 'CONTRACT.MODAL_COMPLETE_CONTRACT.COMPLETE_CONTRACT',
          cssClass: 'k-primary',
        },
      ],
      [{ key: 'CONTRACT.MODAL_COMPLETE_CONTRACT.CONTENT1', bold: false }]
    );
  });

  describe('terminateContract', () => {
    it('should return an Observable with the expected response', () => {
      const contractId = 'contractId';
      const lang = 'en';
      const mockResponse = 'success';
      const spy = jest
        .spyOn(binddingContractsApi, 'terminateContract')
        .mockReturnValue(of(mockResponse));
      const result = service.terminateContract(contractId, lang);

      expect(spy).toHaveBeenCalledWith(contractId, lang);

      result.subscribe((response) => {
        expect(response).toBe(mockResponse);
      });
    });

    it('should return an Observable with an error response', () => {
      const contractId = 'contractId';
      const lang = 'en';
      const mockError = 'error';
      const spy = jest
        .spyOn(binddingContractsApi, 'terminateContract')
        .mockReturnValue(throwError(mockError));
      const result = service.terminateContract(contractId, lang);

      expect(spy).toHaveBeenCalledWith(contractId, lang);

      result.subscribe((response) => {
        expect(response).toBe(mockError);
      });
    });
  });

  it('should call notificationGlobalService.showSuccess() with the correct arguments for terminateToastSuccess', () => {
    const translatedKey = 'translated';
    const showSuccessSpy = jest.spyOn(notificationGlobalService, 'showSuccess');
    const translateSpy = jest
      .spyOn(translateService, 'instant')
      .mockReturnValue(translatedKey);

    service.terminateToastSuccess();

    expect(translateSpy).toHaveBeenCalled();

    expect(showSuccessSpy).toHaveBeenCalled();
  });

  it('should call notificationGlobalService.showSuccess() with the correct arguments for deleteToastSuccess', () => {
    const showSuccessSpy = jest.spyOn(notificationGlobalService, 'showSuccess');
    const translateSpy = jest.spyOn(translateService, 'instant');

    service.deleteToastSuccess();

    expect(translateSpy).toHaveBeenCalled();

    expect(showSuccessSpy).toHaveBeenCalled();
  });

  it('should call fiModalSvc with specifict keys when deleteContractModal is called', () => {
    const modalSpy = jest.spyOn(fiModalSvc, 'open').mockReturnValue(of());
    service.deleteContractModal();

    expect(modalSpy).toHaveBeenCalledWith(
      service['modalDeleteTitle'],
      [
        { text: 'CONTRACT.MODAL_DELETE_CONTRACT.CANCEL' },
        {
          text: 'CONTRACT.MODAL_DELETE_CONTRACT.DELETE_CONTRACT',
          cssClass: 'k-primary',
        },
      ],
      [{ key: 'CONTRACT.MODAL_DELETE_CONTRACT.CONTENT1', bold: false }]
    );
  });

  it('should return an Observable with the expected response for deleteContract', () => {
    const contractId = 'contractId';
    const mockResponse = 'success';
    const spy = jest
      .spyOn(binddingContractsApi, 'deleteContract')
      .mockReturnValue(of(mockResponse));
    const result = service.deleteContract(contractId);

    expect(spy).toHaveBeenCalledWith(contractId);

    result.subscribe((response) => {
      expect(response).toBe(mockResponse);
    });
  });

  it('should call notificationGlobalService.showError() with the correct arguments for deleteErrorMessage', () => {
    const showErrorSpy = jest.spyOn(notificationGlobalService, 'showError');
    const translateSpy = jest.spyOn(translateService, 'instant');

    service.deleteErrorMessage();

    expect(translateSpy).toHaveBeenCalled();

    expect(showErrorSpy).toHaveBeenCalled();
  });

  it('should call notificationGlobalService.showError() with the correct arguments for terminateErrorMessage', () => {
    const showErrorSpy = jest.spyOn(notificationGlobalService, 'showError');
    const translateSpy = jest.spyOn(translateService, 'instant');

    service.terminateErrorMessage();

    expect(translateSpy).toHaveBeenCalled();

    expect(showErrorSpy).toHaveBeenCalled();
  });

  describe('terminateContractLogic', () => {
    it('should terminate contract when modal result is ACCEPT', () => {
      const procurementProcessId = 'procurementProcessId';
      const lang = 'en';
      const terminateContractModalSpy = jest
        .spyOn(service, 'terminateContractModal')
        .mockReturnValue(of({ result: ModalOptions.ACCEPT }));
      const storeSpy = jest.spyOn(service['store'], 'terminateContractAction');
      service.terminateContractLogic(contractMock, procurementProcessId, lang);

      expect(terminateContractModalSpy).toHaveBeenCalled();

      expect(storeSpy).toHaveBeenCalledWith(
        procurementProcessId,
        contractMock.biddingContractId,
        lang
      );
    });

    it('should NOT terminate contract when modal result is CANCEL', () => {
      const procurementProcessId = 'procurementProcessId';
      const lang = 'en';
      const terminateContractModalSpy = jest
        .spyOn(service, 'terminateContractModal')
        .mockReturnValue(of({ result: ModalOptions.CANCEL }));
      const storeSpy = jest.spyOn(service['store'], 'terminateContractAction');
      service.terminateContractLogic(contractMock, procurementProcessId, lang);

      expect(terminateContractModalSpy).toHaveBeenCalled();

      expect(storeSpy).not.toHaveBeenCalled();
    });
  });

  describe('completeContractLogic', () => {
    it('should complete contract when modal result is ACCEPT', () => {
      const procurementProcessId = 'procurementProcessId';
      const lang = 'en';
      const completeContractLogicSpy = jest
        .spyOn(service, 'completeContractModal')
        .mockReturnValue(of({ result: ModalOptions.ACCEPT }));
      const storeSpy = jest.spyOn(service['store'], 'completeContractAction');
      service.completeContractLogic(contractMock, procurementProcessId, lang);

      expect(completeContractLogicSpy).toHaveBeenCalled();

      expect(storeSpy).toHaveBeenCalledWith(
        procurementProcessId,
        contractMock.biddingContractId,
        lang
      );
    });

    it('should NOT complete contract when modal result is CANCEL', () => {
      const procurementProcessId = 'procurementProcessId';
      const lang = 'en';
      const completeContractLogicSpy = jest
        .spyOn(service, 'completeContractModal')
        .mockReturnValue(of({ result: ModalOptions.CANCEL }));
      const storeSpy = jest.spyOn(service['store'], 'completeContractAction');
      service.completeContractLogic(contractMock, procurementProcessId, lang);

      expect(completeContractLogicSpy).toHaveBeenCalled();

      expect(storeSpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteContractLogic', () => {
    it('should delete contract when modal result is ACCEPT', () => {
      const procurementProcessId = 'procurementProcessId';
      const biddingContractId = 'biddingContractId';
      const isCopy = true;
      const deleteContractLogiccSpy = jest
        .spyOn(service, 'deleteContractModal')
        .mockReturnValue(of({ result: ModalOptions.ACCEPT }));
      const storeSpy = jest.spyOn(service['store'], 'deleteContractAction');
      service.deleteContractLogic(
        biddingContractId,
        procurementProcessId,
        isCopy
      );

      expect(deleteContractLogiccSpy).toHaveBeenCalled();

      expect(storeSpy).toHaveBeenCalledWith(
        procurementProcessId,
        biddingContractId,
        isCopy
      );
    });

    it('should NOT delete contract when modal result is CANCEL', () => {
      const procurementProcessId = 'procurementProcessId';
      const biddingContractId = 'biddingContractId';
      const isCopy = true;
      const deleteContractLogiccSpy = jest
        .spyOn(service, 'deleteContractModal')
        .mockReturnValue(of({ result: ModalOptions.CANCEL }));
      const storeSpy = jest.spyOn(service['store'], 'deleteContractAction');
      service.deleteContractLogic(
        biddingContractId,
        procurementProcessId,
        isCopy
      );

      expect(deleteContractLogiccSpy).toHaveBeenCalled();

      expect(storeSpy).not.toHaveBeenCalled();
    });
  });

  describe(' deleteContractLogic$', () => {
    it('should call binddingContractsApi.deleteContract when modal result is ACCEPT', () => {
      const biddingContractId = 'biddingContractId';
      const mockResponse = 'success';
      const deleteContractLogiccSpy = jest
        .spyOn(service, 'deleteContractModal')
        .mockReturnValue(of({ result: ModalOptions.ACCEPT }));

      jest
        .spyOn(binddingContractsApi, 'deleteContract')
        .mockReturnValue(of(mockResponse));

      service.deleteContractLogic$(biddingContractId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      expect(deleteContractLogiccSpy).toHaveBeenCalled();
    });

    it('should throw an error when modal result is not ACCEPT', () => {
      const biddingContractId = 'biddingContractId';
      const deleteContractLogiccSpy = jest
        .spyOn(service, 'deleteContractModal')
        .mockReturnValue(of({ result: ModalOptions.CANCEL }));

      service.deleteContractLogic$(biddingContractId).subscribe({
        error: (err) => {
          expect(err.message).toEqual('Cancel');
        },
      });
      expect(deleteContractLogiccSpy).toHaveBeenCalled();
    });
  });
});

const contractMock: BiddingContractByProcess = {
  visualCode: '',
  biddingContractId: '1',
  parentId: '',
  code: '',
  version: 0,
  biddingContractsAwarded: [
    {
      biddingProcessParticipantId: 'string',
      biddingProcessBidderId: 'string',
      name: 'string',
      nationality: 'string',
    },
  ],
  contractType: 0,
  contractStatus: 0,
  nationality: '',
  idbAmount: 10,
  localCounterpartAmount: 10,
  cofinancedAmount: 10,
  startDate: '',
  endDate: '',
  amendments: [],
};
