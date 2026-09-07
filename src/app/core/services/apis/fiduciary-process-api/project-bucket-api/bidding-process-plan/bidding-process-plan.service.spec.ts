import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  CreateBiddingProcessRequest,
  GetBiddingProcurementProcessesByProcessPlanIdResponse,
  GetBiddingProcessPlanResponse,
  GetBiddingProcurementProcessByIdResponse,
  BiddingContractByProcess,
  GetBiddingProcurementProcessCommentResponse,
} from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpRequestController } from '@fiduciary-interface-test';
import { BiddingProcessPlanService } from './bidding-process-plan.service';

describe('BiddingProcessPlanService', () => {
  let service: BiddingProcessPlanService;
  let httpMock: HttpRequestController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(BiddingProcessPlanService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  const apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  it('should get bidding process plan', () => {
    const projectBucketId = '1123';
    const responseMock: GetBiddingProcessPlanResponse = {
      biddingProcessPlan: null,
    };

    service.getBiddingProcessPlan(projectBucketId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${apiUrl}/api/projectBuckets/${projectBucketId}/biddingProcessPlans`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get bidding process procurement processes', () => {
    const biddingProcessPlanId = '1123';
    const responseMock: GetBiddingProcurementProcessesByProcessPlanIdResponse =
      { biddingProcessProcurementProcess: [] };

    service
      .getBiddingProcurementProcessesByProcessPlanId(biddingProcessPlanId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/biddingProcessPlans/${biddingProcessPlanId}/biddingProcessProcurementProcesses`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should create bidding process procurement process', () => {
    const projectBucketId = '1123';
    const biddingProcessRequest: CreateBiddingProcessRequest = null;
    const responseMock = '1234567';

    service
      .createBiddingProcessProcurementProcess(
        projectBucketId,
        biddingProcessRequest
      )
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/projectBuckets/${projectBucketId}/biddingProcessProcurementProcesses`;
    httpMock.mockRequest(url, 'post', responseMock);
  });

  it('should get bidding processess by id', () => {
    const procurementProcessId = '1123';
    const responseMock: GetBiddingProcurementProcessByIdResponse = {
      biddingProcessProcurementProcess: null,
    };

    service
      .getBiddingProcessProcurementProcessesById(procurementProcessId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should delete bidding process by id', () => {
    const procurementProcessId = '1123';
    const responseMock = null;

    service
      .deleteBiddingProcessProcurementProcess(procurementProcessId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}`;
    httpMock.mockRequest(url, 'delete', responseMock);
  });

  it('should get bidding process contracts', () => {
    const procurementProcessId = '1123';
    const responseMock: BiddingContractByProcess[] = [];

    service.getBiddingContracts(procurementProcessId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingContracts`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get bidding process comments', () => {
    const procurementProcessId = '1123';
    const responseMock: GetBiddingProcurementProcessCommentResponse = {
      biddingProcurementProcessComments: [],
    };

    service.getBiddingComments(procurementProcessId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessProcurementProcessComments`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should update bidding process', () => {
    const biddingProcessProcurementProcessId = '1123';
    const biddingProcess: CreateBiddingProcessRequest = null;
    const responseMock = '1234567';

    service
      .updateProcessProcurementProcess(
        biddingProcessProcurementProcessId,
        biddingProcess
      )
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${biddingProcessProcurementProcessId}`;
    httpMock.mockRequest(url, 'put', responseMock);
  });

  it('should get outputs', () => {
    const procurementProcessId = '1123';
    const responseMock = {
      componentId: null,
      componentName: null,
      outputs: [],
    };

    service
      .getBiddingProcessComponents(procurementProcessId)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/outputs`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get process milestone', () => {
    const procurementProcessId = '1123';
    const responseMock = 'response';

    service.getProcessMilestones(procurementProcessId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${procurementProcessId}/biddingProcessMilestones`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should update status', () => {
    const biddingProcessId = '1123';
    const newStatus = 0;
    const countryCode = 'ES';
    const responseMock = 'response';

    service
      .updateStatus(biddingProcessId, newStatus, countryCode)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/biddingProcessProcurementProcesses/${biddingProcessId}/status`;
    httpMock.mockRequest(url, 'put', responseMock);
  });

  it('should put requestApproval', () => {
    const biddingProcessPlanId = '1123';
    const responseMock = 'response';

    service
      .requestApproval(biddingProcessPlanId, null)
      .subscribe((response) => {
        expect(response).toEqual(responseMock);
      });

    const url = `${apiUrl}/api/v2/procurement-plans/${biddingProcessPlanId}/approval`;
    httpMock.mockRequest(url, 'put', responseMock);
  });

  it('should get approvedPlans', () => {
    const projectBucketId = '1123';
    const responseMock = 'response';

    service.getApprovedPlans(projectBucketId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    const url = `${apiUrl}/api/projectBuckets/${projectBucketId}/biddingProcessPlans/approved`;
    httpMock.mockRequest(url, 'get', responseMock);
  });
});
