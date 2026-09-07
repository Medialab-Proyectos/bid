import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@fiduciary-interface/environments/environment';
import { StoreModule } from '@ngrx/store';
import { FiTransactionsApiService } from '..';
import { TransactionsTypes } from '../../enums';
import { TransactionAudiTrailCreateRequest } from '../../models';
import { TransactionSubmitDocumentRequest } from '../../models/request/transaction-submit-doc-request.model';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('TransactionsApiService', () => {
  let service: FiTransactionsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot({})],
    });
    service = TestBed.inject(FiTransactionsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function mockRequest(
    uri: string,
    method: string,
    response: unknown,
    error = null
  ) {
    const req = httpMock.expectOne(`${basePath}${uri}`);
    expect(req.request.method).toBe(method.toUpperCase());
    if (error) {
      req.flush(response, error);
    } else {
      req.flush(response);
    }
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get project transactions', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const responseMock = 'response';
    service.getProjectTransactions(projectBucketId).subscribe((transaction) => {
      expect(transaction).toEqual(responseMock);
    });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions`,
      'get',
      responseMock
    );
  });

  it('should get get project transaction types', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const responseMock = 'response';
    service
      .getProjectTransactionTypes(projectBucketId)
      .subscribe((transactionType) => {
        expect(transactionType).toEqual(responseMock);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/types`,
      'get',
      responseMock
    );
  });

  it('should get transaction components', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionType = 'ANT';
    const responseMock = {
      amountAssignIdb: 0,
      amountAssignLocalCounterpart: 0,
      amountAssignCofinancing: 0,
      components: [
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
      ],
    };
    service
      .getTransactionComponents(projectBucketId, transactionType)
      .subscribe((component) => {
        expect(component).toEqual(responseMock);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/components`,
      'get',
      responseMock
    );
  });

  it('should get approved currencies', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const responseMock = 'USD';
    service.getApprovedCurrency(projectBucketId).subscribe((currencie) => {
      expect(currencie).toEqual(responseMock);
    });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/approvedCurrencies`,
      'get',
      responseMock
    );
  });

  it('should get beneficiaries', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const responseMock = {
      beneficiaries: [
        {
          institutionName: 'string',
          acronym: 'string',
          beneficiaryName: 'string',
          beneficiaryId: 'string',
          accountNumber: 'string',
          bankFlowId: 'string',
          details: {
            intermediaryBank: {
              name: 'string',
              branchName: 'string',
              swiftCode: 'string',
              abaRoutingCode: 'string',
              streetAddress: 'string',
              city: 'string',
              country: 'string',
              zipCode: 'string',
              specialInstructions: 'string',
            },
            beneficiaryBank: {
              name: 'string',
              branchName: 'string',
              swiftCode: 'string',
              abaRoutingCode: 'string',
              streetAddress: 'string',
              city: 'string',
              country: 'string',
              zipCode: 'string',
              specialInstructions: 'string',
            },
            beneficiaryBasicData: {
              institutionName: 'string',
              streetAddress: 'string',
              city: 'string',
              country: 'string',
              zipCode: 'string',
              typeName: 'string',
              type: 'string',
              id: 'string',
              contactFirstName: 'string',
              contactEmail: 'string',
            },
            beneficiaryAccountData: {
              name: 'string',
              bankAccountNumber: 'string',
              accountCurrency: 'string',
              accountSpecialInstructions: 'string',
            },
          },
        },
      ],
      itemsCount: 0,
    };
    service.getBeneficiaries(projectBucketId).subscribe((beneficiaries) => {
      expect(beneficiaries).toEqual(responseMock);
    });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/beneficiaries`,
      'get',
      responseMock
    );
  });

  it('should getBeneficiaries', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const searchText = 'asd';
    const pageNumber = 1;
    const pageSize = 1;
    const transactionType = TransactionsTypes.ANJ;
    const responseMock = 'USD';
    service
      .getBeneficiaries(
        projectBucketId,
        searchText,
        transactionType,
        pageNumber,
        pageSize
      )
      .subscribe((res) => {
        expect(res).toEqual(responseMock);
      });

    const attrs = [];

    attrs.push(`?searchText=${searchText}`);
    attrs.push(`&pageNumber=${pageNumber}`);
    attrs.push(`&pageSize=${pageSize}`);
    attrs.push(`&transactionType=${transactionType}`);

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/beneficiaries${attrs.join('')}`,
      'get',
      responseMock
    );
  });

  it('should get beneficiary detatail', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const beneficiaryId = '05054861000176';
    const responseMock = 'USD';
    service
      .getBeneficiaryDetail(projectBucketId, beneficiaryId)
      .subscribe((beneficiaryDetails) => {
        expect(beneficiaryDetails).toEqual(responseMock);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/beneficiaries/${beneficiaryId}`,
      'get',
      responseMock
    );
  });

  it('should save new Ant Transaction', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const ant = {
      requestDetails: {
        requestNumber: 1,
        partNumber: 2,
      },
      requestAmounts: {
        requestedCurrency: 'USD',
        requiredAmount: 10000,
        equivalentApprovedCurrency: 10000,
      },
      beneficiary: {
        bankFlowId: 'string',
        country: 'SPAIN',
        numberId: 'string',
      },
      beneficiaryId: 'string',
      documents: [],
    };

    service
      .saveNewAntTransaction(projectBucketId, ant)
      .subscribe((newTransaction) => {
        expect(newTransaction).toEqual(ant);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/ant`,
      'post',
      ant
    );
  });

  it('should save new Anj Transaction', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const request = {
      requestDetails: {
        requestNumber: 1,
        partNumber: 2,
      },
      requestAmounts: {
        bid: 0,
        localCounterpart: 0,
        cofinancing: 0,
      },
      components: [
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
      ],
      documents: [],
    };

    service
      .saveAnjTransaction(projectBucketId, request)
      .subscribe((newTransactionAnj) => {
        expect(newTransactionAnj).toEqual(request);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/anj`,
      'post',
      request
    );
  });

  it('should update an Ant Transaction', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 12;
    const ant = {
      requestDetails: {
        requestNumber: 1,
        partNumber: 2,
      },
      requestAmounts: {
        requestedCurrency: 'USD',
        requiredAmount: 10000,
        equivalentApprovedCurrency: 10000,
      },
      beneficiary: {
        bankFlowId: 'string',
        country: 'SPAIN',
        numberId: 'string',
      },
      beneficiaryId: 'string',
      documents: [],
    };
    const mockResponse = { message: 'Success' };

    service
      .updateAntTransaction(projectBucketId, transactionId, ant)
      .subscribe((updatedTransaction) => {
        expect(updatedTransaction).toEqual(ant);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/ant`,
      'put',
      mockResponse
    );
  });

  it('get an Ant Transaction', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 384088;
    const mockResponse = {
      transactionId: 384088,
      requestDetails: {
        requestNumber: 1,
        partNumber: 2,
      },
      requestAmounts: {
        requestedCurrency: 'USD',
        requiredAmount: 10000,
        equivalentApprovedCurrency: 10000,
      },
      beneficiary: {
        bankFlowId: 'string',
        country: 'SPAIN',
        numberId: 'string',
      },
      beneficiaryId: 'string',
      documents: [],
    };

    service
      .getAntTransactionById(projectBucketId, transactionId)
      .subscribe((antTransaction) => {
        expect(antTransaction).toEqual(mockResponse);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/ant`,
      'get',
      mockResponse
    );
  });

  it('should delete a Transaction', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 12;
    const mockResponse = { message: 'Success' };
    service
      .deleteTransaction(projectBucketId, transactionId)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });
    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionId}`,
      'delete',
      mockResponse
    );
  });

  it('should getAuditTrails', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 12;
    const mockResponse = 'response';
    service.currentLanguage = 'en';
    service
      .getAuditTrails(projectBucketId, transactionId)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });
    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/AuditTrail/${service.currentLanguage}`,
      'get',
      mockResponse
    );
  });

  it('should getProjectBalances', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';

    const mockResponse = 'response';
    service.getProjectBalances(projectBucketId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
    mockRequest(
      `/api/projectBuckets/${projectBucketId}/balances`,
      'get',
      mockResponse
    );
  });

  it('should getAnjTransactionById', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 1;

    const mockResponse = 'response';
    service
      .getAnjTransactionById(projectBucketId, transactionId)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/anj`,
      'get',
      mockResponse
    );
  });

  it('should updateAnjTransaction', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 1;
    const request = {
      requestDetails: {
        requestNumber: 1,
        partNumber: 2,
      },
      requestAmounts: {
        bid: 0,
        localCounterpart: 0,
        cofinancing: 0,
      },
      components: [
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
      ],
      documents: [],
    };

    const response = 'response';
    service
      .updateAnjTransaction(projectBucketId, transactionId, request)
      .subscribe((response) => {
        expect(response).toEqual(response);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionId}/anj`,
      'put',
      response
    );
  });

  it('should getTransactionById', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 1;
    const transactionType = 'ANT';

    const mockResponse = 'response';
    service
      .getTransactionById(projectBucketId, transactionId, transactionType)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/${transactionId}`,
      'get',
      mockResponse
    );
  });

  it('should getDocumentGroups', () => {
    const transactionId = 1;
    const transactionType = 'ANJ';

    const mockResponse = 'response';
    service
      .getDocumentGroups(transactionId, transactionType)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });
    mockRequest(
      `/api/transactions/${transactionType}/${transactionId}/transactionsDocumentGroups`,
      'get',
      mockResponse
    );
  });

  it('should postTransactionById', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionType = 'ANT';
    const request = null;

    const mockResponse = 'response';
    service
      .postTransactionById(projectBucketId, transactionType, request)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionType}`,
      'post',
      mockResponse
    );
  });

  it('should updateTransactionById', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionId = 1;
    const transactionType = 'ANT';
    const request = null;

    const mockResponse = 'response';
    service
      .updateTransactionById(
        projectBucketId,
        transactionId,
        transactionType,
        request
      )
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/${transactionId}`,
      'put',
      mockResponse
    );
  });

  it('should checkIfInstitutionExist', () => {
    const institutionSapId = '1';
    const mockResponse = {
      intitutionExist: true,
    };

    service.checkIfInstitutionExist(institutionSapId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    mockRequest(
      `/api/transactions/checkIfInstitutionExist/${institutionSapId}`,
      'get',
      mockResponse
    );
  });

  it('should createAuditTrail', () => {
    const request: TransactionAudiTrailCreateRequest = {
      createAuditTrailListRequests: [],
    };
    const res = true;

    service.createAuditTrail(request).subscribe((response) => {
      expect(response).toEqual(res);
    });

    mockRequest(`/api/transaction/CreateAuditTrails`, 'post', res);
  });

  it('should changeTransactionStatus', () => {
    const transactionId = 1;
    const transactionStatusId = 1;

    const res = 'res';

    service
      .changeTransactionStatus(transactionId, transactionStatusId)
      .subscribe((response) => {
        expect(response).toEqual(res);
      });

    mockRequest(
      `/api/transactions/changeTransactionStage?transactionId=${transactionId}&transactionStatusId=${transactionStatusId}`,
      'post',
      res
    );
  });

  it('should getTransactionGuid', () => {
    const transactionId = 1;
    const res = 'res';

    service.getTransactionGuid(transactionId).subscribe((response) => {
      expect(response).toEqual(res);
    });

    mockRequest(
      `/api/transactions/GetGuidByOriginalId?originalId=${String(
        transactionId
      )}`,
      'get',
      res
    );
  });

  it('should submitDocuments', () => {
    const request: TransactionSubmitDocumentRequest = {
      operationNumber: '1',
      transactionId: 1,
    };
    const res = 'res';

    service.submitDocuments(request).subscribe((response) => {
      expect(response).toEqual(res);
    });

    mockRequest(`/api/transactions/submitDocuments`, 'put', res);
  });

  it('should documentsSync', () => {
    const res = 'res';
    const transactionId = 1;

    service.documentsSync(transactionId, 'body').subscribe((response) => {
      expect(response).toEqual(res);
    });

    mockRequest(
      `/api/transactions/${transactionId}/documentsSyncs`,
      'post',
      res
    );
  });

  it('should transactionsPartRequestNumbervalidate', () => {
    const res = 'res';
    const partNumber = 1;
    const requestNumber = 1;
    const projectBucketId = '1';
    const transactionId = 123456;

    service
      .transactionsPartRequestNumbervalidate(
        projectBucketId,
        requestNumber,
        partNumber,
        transactionId
      )
      .subscribe((response) => {
        expect(response).toEqual(res);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/requestNumber/${requestNumber}/partNumber/${partNumber}/validate?transactionId=${transactionId}`,
      'get',
      res
    );
  });

  it('should availableRequestAndPartNumber', () => {
    const res = 'res';
    const projectBucketId = '1';

    service
      .availableRequestAndPartNumber(projectBucketId)
      .subscribe((response) => {
        expect(response).toEqual(res);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/availableRequestAndPartNumber`,
      'get',
      res
    );
  });

  it('should getDownloadAudit', () => {
    const transactionId = 1;
    const lang = 'en';

    const mockResponse: ArrayBuffer = new ArrayBuffer(0);
    service.getDownloadAudit(transactionId, lang).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    mockRequest(
      `/api/transactions/${transactionId}/auditTrailReport/${lang}`,
      'get',
      mockResponse
    );
  });

  it('should get project transactions', () => {
    const projectBucketId = 'c47a774f-4a28-4a0e-aed8-0610e5fbf666';
    const transactionType = TransactionsTypes.ANI;
    const responseMock = 'response';
    service
      .getAniHeaderDetail(projectBucketId, transactionType)
      .subscribe((ani) => {
        expect(ani).toEqual(responseMock);
      });

    mockRequest(
      `/api/projectBuckets/${projectBucketId}/transactions/${transactionType}/actionsContent`,
      'get',
      responseMock
    );
  });

  it('should transactionAddDocumentGroup', () => {
    const transactionId = 12;
    const transactionType = TransactionsTypes.ANI;
    const documents = [
      {
        createdUser: 'test',
        createdDate: 'test',
        documentNumber: 'test',
        documentName: 'test',
        documentGroup: 1,
        transactionType: 'test',
        originalTransactionId: 1,
      },
    ];

    const mockResponse = 'response';
    service
      .transactionAddDocumentGroup(transactionId, transactionType, documents)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    mockRequest(
      `/api/transactions/${transactionId}/${transactionType}/addDocumentGroup`,
      'post',
      mockResponse
    );
  });
});
