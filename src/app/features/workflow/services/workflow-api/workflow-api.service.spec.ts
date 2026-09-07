import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpRequestController } from '@fiduciary-interface-test';
import { environment } from '@fiduciary-interface/environments/environment';
import { provideMockStore } from '@ngrx/store/testing';
import { WorkflowActive, WorkflowConfig } from '../../models';
import { WorkflowODApiService } from './workflow-api.service';

const basePath = environment.hostApi.fiduciaryProcessApi.endpoint;

describe('WorkflowApiService', () => {
  let service: WorkflowODApiService;
  let http: HttpRequestController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController, provideMockStore({})],
    });
    service = TestBed.inject(WorkflowODApiService);
    http = TestBed.inject(HttpRequestController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getWorkflow', () => {
    const response = 'response';
    const projectBucketId = '123';

    service.getWorkflow(projectBucketId).subscribe((res) => {
      expect(res).toEqual(response);
    });

    http.mockRequest(
      `${basePath}/api/workFlowOD/${projectBucketId}/configuration`,
      'get',
      response
    );
  });

  it('should createWorkflow', () => {
    const response = 'response';
    const projectBucketId = '123';
    const executorAcronym = 'abc';

    service
      .createWorkflow(projectBucketId, executorAcronym)
      .subscribe((res) => {
        expect(res).toEqual(response);
      });

    http.mockRequest(
      `${basePath}/api/workFlowOD/${projectBucketId}/configuration`,
      'post',
      response
    );
  });

  it('should updateWorkflow', () => {
    const response = 'response';
    const projectBucketId = '123';
    const data: WorkflowConfig = {
      workFlowConfig: [],
    };

    service.updateWorkflow(projectBucketId, data, 'en').subscribe((res) => {
      expect(res).toEqual(response);
    });

    http.mockRequest(
      `${basePath}/api/workFlowOD/${projectBucketId}/configuration/en`,
      'put',
      response
    );
  });

  it('should getWorkflowInstitutions', () => {
    const response = 'response';
    const projectBucketId = '123';

    service.getWorkflowInstitutions(projectBucketId).subscribe((res) => {
      expect(res).toEqual(response);
    });

    http.mockRequest(
      `${basePath}/api/workFlowOD/${projectBucketId}/institutions`,
      'get',
      response
    );
  });

  it('should getWorkflowAssignedUsers', () => {
    const response = 'response';
    const institutionCode = '1234';
    const projectBucketId = '123';

    service
      .getWorkflowAssignedUsers(projectBucketId, institutionCode)
      .subscribe((res) => {
        expect(res).toEqual(response);
      });

    http.mockRequest(
      `${basePath}/api/workFlowOD/${projectBucketId}/institutions/${institutionCode}/users`,
      'get',
      response
    );
  });

  it('should getWorkflowAssignedUsers', () => {
    const response = 'response';
    const action = 'action';
    const projectBucketId = '123';

    service.getTransactionStatus(projectBucketId, action).subscribe((res) => {
      expect(res).toEqual(response);
    });

    http.mockRequest(
      `${basePath}/api/workFlowOD/${projectBucketId}/action/${action}/status`,
      'get',
      response
    );
  });

  it('should getAllWorkflowActive', () => {
    const response = 'response';
    const request: WorkflowActive = {
      projectBucketId: '123',
      idEntityType: 123,
    };

    service.getAllWorkflowActive(request).subscribe((res) => {
      expect(res).toEqual(response);
    });

    http.mockRequest(
      `${basePath}/api/workflow/getAllWorkflowActive`,
      'post',
      request
    );
  });
});
