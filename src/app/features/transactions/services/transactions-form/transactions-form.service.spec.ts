import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Currency, Project } from '@core/models';
import { SelectedProjectState } from '@core/store';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { Observable, of, throwError } from 'rxjs';
import { Totals } from '../../components/transaction-components/transaction-components.form';
import { TransactionsStatus, TransactionsTypes } from '../../enums';
import {
  AvailableNumbers,
  ExecutorBeneficiaries,
  GetTransactionComponentsResponse,
  RequestAndPartNumberValid,
  TransactionComponent,
  TransactionsCardsResponse,
} from '../../models';

import { TransactionsFormService } from './transactions-form.service';

const project: Project = {
  name: 'name',
  operationNumber: 'operationNumber',
  executor: 'executor',
  executorAcronym: 'executorAcronym',
  contract: 'contract',
  approvedAmount: 0,
  location: 'location',
  status: null,
  institution: 'institution',
  operation: null,
  countryCode: 'countryCode',
  projectBucketId: '123',
  id: '1',
  nameEn: '',
  projectName: {
    en: '',
    es: '',
    fr: '',
    pt: '',
  },
  currentApprovedAmount: 15,
  nameEs: '',
  nameFr: '',
  namePt: '',
  favorite: false,
};

const mockComponents: TransactionComponent[] = [
  {
    id: 0,
    code: 1,
    name: 'string',
    amountsDistribute: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    amountsProjectedAvailable: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    readOnly: true,
  },
  {
    id: 0,
    code: 0,
    name: 'string',
    amountsDistribute: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    amountsProjectedAvailable: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    readOnly: true,
  },
];

const mockComponents2: TransactionComponent[] = [
  {
    id: 0,
    code: 0,
    name: 'string',
    amountsDistribute: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    amountsProjectedAvailable: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    readOnly: true,
  },
  {
    id: 0,
    code: 1,
    name: 'string',
    amountsDistribute: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    amountsProjectedAvailable: {
      distributeIbd: 0,
      distributeLocalCounterpart: 0,
      distributeCofinancing: 0,
    },
    readOnly: true,
  },
];

const mockSelectedProject: SelectedProjectState = {
  selectedProject: {
    countryCode: 'CO',
    name: 'string',
    nameEs: 'string',
    nameFr: 'string',
    namePt: 'string',
    executor: 'MINISTERIO DE EDUCACION NACIONAL',
    executorAcronym: 'CO-MEN',
    contract: '4902/OC-CO',
    operationNumber: 'CO-L1229',
    approvedAmount: 60000000,
    currentApprovedAmount: 60000000,
    id: '1',
    nameEn: '',
    projectName: {
      en: '',
      es: '',
      fr: '',
      pt: '',
    },
    projectBucketId: '1',
    favorite: false,
  },
  loaded: false,
  loading: false,
  error: null,
};

const initialState = {
  selectedProject: { ...mockSelectedProject },
};

describe('TransactionsFormService', () => {
  let service: TransactionsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MsalTestModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [provideMockStore({ initialState }), NotificationService],
    });
    service = TestBed.inject(TransactionsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getApprovedCurrency', () => {
    it('Should return an string observable or the currency ', () => {
      jest
        .spyOn(service.transactionsApi, 'getApprovedCurrency')
        .mockReturnValue(of('USD'));

      service.getApprovedCurrency().subscribe((currency) => {
        expect(currency).toBe('USD');
      });
    });
  });

  describe('loadCurrencies', () => {
    it('should set currencyList', async () => {
      const mockCurrencyList: Currency[] = [
        {
          currency: 'USD',
          isHard: false,
          isBorrowing: false,
          numberOfDecimals: 2,
        },
      ];

      jest
        .spyOn(service.commonApi, 'getCurrencies')
        .mockReturnValue(of(mockCurrencyList));

      service.loadCurrencies().subscribe((currencies) => {
        expect(currencies).toBe(mockCurrencyList);
      });
    });
  });

  describe('sortComponentsByCodeAsc', () => {
    it('should sort components by code asc', async () => {
      const components = mockComponents;
      const sortedComponents = service.sortComponentsByCodeAsc(components);
      expect(sortedComponents[0].code).toEqual(0);
    });

    it('should sort components by code asc', async () => {
      const components = mockComponents2;
      const sortedComponents = service.sortComponentsByCodeAsc(components);
      expect(sortedComponents[0].code).toEqual(0);
    });
  });

  describe('showErrorToast', () => {
    it('should show error msg toast', async () => {
      const toastSpy = jest
        .spyOn(service.notificationService, 'showError')
        .mockReturnValue();
      service.showErrorToast('error');

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('showSuccessToast', () => {
    it('should show success msg toast', async () => {
      const toastSpy = jest
        .spyOn(service.notificationService, 'showSuccess')
        .mockReturnValue();
      service.showSuccessToast('text');

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('showTransacctionSuccessToast', () => {
    it('should show success msg toast', async () => {
      const toastSpy = jest
        .spyOn(service.notificationService, 'showSuccess')
        .mockReturnValue();
      service.showTransacctionSuccessToast('text', TransactionsTypes.ANJ, '1');

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('exportToPdf', () => {
    it('should export to pdf', async () => {
      service
        .exportToPdf(1, '1', TransactionsTypes.ANJ, [123])
        .subscribe(() => {
          const exportSpy = jest
            .spyOn(service.fileSaverService, 'save')
            .mockReturnValue();

          expect(exportSpy).toHaveBeenCalled();
        });
    });
  });

  describe('downloadAudit', () => {
    it('should export to pdf', async () => {
      service.downloadAudit(1, 'en', '1').subscribe(() => {
        const exportSpy = jest
          .spyOn(service.fileSaverService, 'save')
          .mockReturnValue();

        expect(exportSpy).toHaveBeenCalled();
      });
    });
  });
  describe('getTransactionComponents$', () => {
    it('should return observable of components', async () => {
      const components$: Observable<GetTransactionComponentsResponse> = of({
        amountAssignIdb: 0,
        amountAssignLocalCounterpart: 0,
        amountAssignCofinancing: 0,
        components: [
          {
            id: 0,
            type: 0,
            code: 0,
            name: 'string',
            amountsDistribute: {
              distributeIbd: 0,
              distributeLocalCounterpart: 0,
              distributeCofinancing: 0,
            },
            amountsProjectedAvailable: {
              distributeIbd: 0,
              distributeLocalCounterpart: 0,
              distributeCofinancing: 0,
            },
            readOnly: true,
          },
        ],
        componentsTotalAmountCurrentIdb: 0,
        componentsTotalAmountCurrentLc: 0,
        componentsTotalAmountCurrentCf: 0,
        componentsTotalAmountDisbursedIdb: 0,
        componentsTotalAmountDisbursedLc: 0,
        componentsTotalAmountDisbursedCf: 0,
        componentsTotalAmountAvailableIdb: 0,
        componentsTotalAmountAvailableLc: 0,
        componentsTotalAmountAvailableCf: 0,
        componentsTotalAmountProjectedIdb: 0,
        componentsTotalAmountProjectedLc: 0,
        componentsTotalAmountProjectedCf: 0,
      });

      jest
        .spyOn(service.transactionsApi, 'getTransactionComponents')
        .mockReturnValue(components$);

      service
        .getTransactionComponents$('1', TransactionsTypes.ANJ)
        .subscribe((components$) => {
          expect(components$).toEqual(components$);
        });
    });
  });

  describe('getBeneficiaries$', () => {
    it('should return observable of beneficiaries', async () => {
      const getBeneficiaries: ExecutorBeneficiaries = {
        itemsCount: 1,
        beneficiaries: [
          {
            institutionName: 'string',
            acronym: 'string',
            beneficiaryName: 'string',
            accountNumber: 'string',
            bankFlowId: 'string',
          },
        ],
      };

      jest
        .spyOn(service.transactionsApi, 'getBeneficiaries')
        .mockReturnValue(of(getBeneficiaries));

      service.getBeneficiaries$('1').subscribe((getBeneficiaries) => {
        expect(getBeneficiaries).toEqual(getBeneficiaries);
      });
    });
  });

  describe('checkPartNumbers', () => {
    it('should return an observable of RequestAndPartNumberValid', async () => {
      const projectBucketId = '1';
      const requestNumber = 1;
      const partNumber = 1;
      const transactionId = 123456;
      const formGroup = new FormGroup({
        formControl: new FormControl(''),
      });
      const formControl = 'formControl';

      const requestAndPartNumberValid: RequestAndPartNumberValid = {
        requestAndPartNumberValid: false,
      };

      jest
        .spyOn(service.transactionsApi, 'transactionsPartRequestNumbervalidate')
        .mockReturnValue(of(requestAndPartNumberValid));

      service
        .checkPartNumbers(
          projectBucketId,
          requestNumber,
          partNumber,
          transactionId,
          formGroup,
          formControl
        )
        .subscribe((res) => {
          expect(res).toEqual(requestAndPartNumberValid);
          expect(formGroup.get(formControl).hasError).toEqual({
            invalidPartNumber: true,
          });
        });
    });
  });

  describe('launchWorkflow', () => {
    it('should return an observable of LaunchWorkflowResponse', async () => {
      const launchWorkflowResponse = 'res';
      const transactionId = 1;
      const selectedProject = project;
      const selectedLanguage = 'en';
      const transactionType = TransactionsTypes.ANJ;
      const transactionIdsATJ = [];

      jest
        .spyOn(service.workflowTransactionSvc, 'launch')
        .mockReturnValue(of(launchWorkflowResponse));

      service
        .launchWorkflow(
          transactionId,
          selectedProject,
          selectedLanguage,
          transactionType,
          transactionIdsATJ,
          ''
        )
        .subscribe((res) => {
          expect(res).toEqual(launchWorkflowResponse);
        });
    });
  });

  describe('loadWorkflowActions', () => {
    it('should return and observable of strin when call loadActions', async () => {
      const workflowActions = 'workflowActions';
      const transactionId = 1;
      const selectedProject = project;
      const transactionType = TransactionsTypes.ANJ;
      const transactionIdsATJ = [];

      jest
        .spyOn(service.workflowTransactionSvc, 'getTransactionGuid')
        .mockReturnValue(of(workflowActions));

      service
        .loadWorkflowActions(
          transactionId,
          selectedProject,
          transactionType,
          transactionIdsATJ
        )
        .subscribe((res) => {
          expect(res).toEqual(workflowActions);
        });
    });
  });

  describe('getComponentTotals', () => {
    it('should return totals', async () => {
      const totals: Totals = {
        amountsDistribute: {
          distributeCofinancing: 0,
          distributeIbd: 0,
          distributeLocalCounterpart: 0,
        },
        amountsProjectedAvailable: {
          distributeCofinancing: 0,
          distributeIbd: 0,
          distributeLocalCounterpart: 0,
        },
      };

      expect(service.getComponentTotals(mockComponents)).toEqual(totals);
    });
  });

  describe('isExportToPdfVisible', () => {
    it('should return true when is EDRAFT', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.EDRAFT;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
    it('should return true when is EPREV ', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.EPREV;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
    it('should return true when is EPVAL ', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.EPVAL;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
    it('should return true when is EPAUT ', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.EPAUT;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
    it('should return true when is EREJECT ', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.EREJECT;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
    it('should return true when is EPENDINGAUTHONE ', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.EPENDINGAUTHONE;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
    it('should return true when is ERETURNED ', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.ERETURNED;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
    it('should return true when is ERETURNEDBYIDB', async () => {
      const isExportToPdfVisible = true;
      const transactionStatusId = TransactionsStatus.ERETURNEDBYIDB;

      expect(service.isExportToPdfVisible(transactionStatusId)).toEqual(
        isExportToPdfVisible
      );
    });
  });

  describe('areReqPartNumberOcupied', () => {
    it('should return true if formControlValue is include in numbers array', async () => {
      const numbers = [1, 2, 3];
      const formControlValue = 1;

      const res = service.areReqPartNumberOcupied(numbers, formControlValue);

      expect(res).toBe(true);
    });
    it('should return false because numbers are empty', async () => {
      const numbers = [];
      const formControlValue = 4;

      const res = service.areReqPartNumberOcupied(numbers, formControlValue);
      expect(res).toBe(false);
    });
  });

  describe('availableRequestAndPartNumber', () => {
    it('should call availableRequestAndPartNumber', async () => {
      const availableNumbers: AvailableNumbers = null;

      service.availableRequestAndPartNumber('1').subscribe(() => {
        const spy = jest
          .spyOn(service.transactionsApi, 'availableRequestAndPartNumber')
          .mockReturnValue(of(availableNumbers));

        expect(spy).toHaveBeenCalled();
      });
    });
    it('should call showErrorToast on error response', async () => {
      jest
        .spyOn(service.transactionsApi, 'availableRequestAndPartNumber')
        .mockReturnValue(throwError('error'));

      service.availableRequestAndPartNumber('1').subscribe(
        () => {},
        () => {
          const spy = jest.spyOn(service, 'showErrorToast').mockReturnValue();

          expect(spy).toHaveBeenCalled();
        }
      );
    });
  });

  describe('canActivateTransaction', () => {
    it('should return true if the transaction has no error msg', async () => {
      const mockCardRes: TransactionsCardsResponse = {
        transactionsType: [
          {
            type: 'ANT',
            icon: 'string',
            title: 'ANT',
            description: 'ANT',
            errorMessage: '',
          },
          {
            type: 'DPB',
            icon: 'string',
            title: 'DPB',
            description: 'DPB',
            errorMessage: 'Error msg',
          },
        ],
      };

      const canActivateMock = {
        canActivate: false,
        errorMsg: 'Error',
      };

      jest
        .spyOn(service.transactionsApi, 'getProjectTransactionTypes')
        .mockReturnValue(of(mockCardRes));

      service
        .canActivateTransaction('123', TransactionsTypes.ANT)
        .subscribe((res) => expect(res).toEqual(canActivateMock));
    });
  });
});
