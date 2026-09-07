import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpRequestController } from '@fiduciary-interface-test';
import { WorkflowApiService } from './workflow-api.service';
import { environment } from '@fiduciary-interface/environments/environment';
import {
  WorkflowLastStepRequestBody,
  WorkflowLastStepResponse,
  WorkflowLaunchRequest,
  WorkflowTriggerRequestBody,
} from '@core/models';
import {
  WorkflowEntityScreen,
  WorkflowIdEntityType,
  WorkflowModuleEnum,
} from '@core/enums';
import { ProcurementCommentGetResponse } from '@fiduciary-interface/app/shared/components/dialog-comments/models';

describe('WorkflowApiService', () => {
  let service: WorkflowApiService;
  let httpMock: HttpRequestController;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(WorkflowApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLastStep', () => {
    it('should call http.get with the correct endpoint for getLastStep', () => {
      const url = `${path}/api/workflow/workflowLastStep`;
      const responseMock: WorkflowLastStepResponse = {
        nextUsers: [],
        currentStep: null,
        nextStep: null,
        workflowInstanceId: null,
        nextActions: null,
        nextActors: null,
        actionSelected: null,
        workflowDocument: false,
      };
      const body: WorkflowLastStepRequestBody = {
        entityTypeId: 'entityTypeId',
        projectBucketId: 'projectBucketId',
        idEntityType: WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT,
      };
      service.getLastStep(body).subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
      httpMock.mockRequest(url, 'post', responseMock);
    });
  });

  describe('triggerStep', () => {
    it('should call http.get with the correct endpoint for triggerStep', () => {
      const lang = 'en';
      const mod: WorkflowModuleEnum = WorkflowModuleEnum.BIDDING_PROCESS;
      const url = `${path}/api/step/trigger?lang=${lang}&wrkmod=${mod}`;
      const responseMock = {};
      const body: WorkflowTriggerRequestBody = {
        projectBucketId: 'projectBucketId',
        instAcronym: 'instAcronym',
        roleId: 'roleId',
        workflowInstanceId: 'workflowInstanceId',
        actionSelected: 'actionSelected',
        packageId: 'packageId',
        biddingContract: 'biddingContract',
        workflowComment: {
          visibility: true,
          status: 'status',
          text: 'text',
        },
      };

      service.triggerStep(body, lang, mod).subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
      httpMock.mockRequest(url, 'post', responseMock);
    });
  });

  describe('lauchWorkflow', () => {
    it('should call http.get with the correct endpoint for lauchWorkflow', () => {
      const lang = 'en';
      const mod: WorkflowModuleEnum = WorkflowModuleEnum.BIDDING_PROCESS;
      const url = `${path}/api/launch/workflow?lang=${lang}&wrkmod=${mod}`;
      const responseMock = {};
      const request: WorkflowLaunchRequest = {
        entityTypeId: 'entityTypeId',
        isInternalVisibility: false,
        projectBucketId: 'projectBucketId',
        instAcronym: 'instAcronym',
        packageId: 'packageId',
        biddingContract: 'biddingContract',
        businessRulesRequest: {
          module: 'module',
          table: 'table',
          name: 'name',
          factors: { workflowSection: WorkflowEntityScreen.PROCUREMENT_PLAN },
        },
        role: 'role',
        workflowComment: {
          status: '',
          text: '',
          visibility: true,
        },
      };

      service.lauchWorkflow(request, lang, mod).subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
      httpMock.mockRequest(url, 'post', responseMock);
    });
  });

  describe('getComments', () => {
    it('should call http.get with the correct endpoint for getComments', () => {
      const workflowInstanceId = '1';
      const url = `${path}/api/workflows/comments?workflowInstanceId=${workflowInstanceId}`;
      const responseMock: ProcurementCommentGetResponse = {
        parentId: 'parentId',
        comments: [
          {
            created: new Date('2022-12-30T03:00:00'),
            createdBy: 'user',
            id: '2',
            source: 0,
            status: 0,
            text: 'text',
            visibility: 0,
          },
        ],
      };

      service.getComments(workflowInstanceId).subscribe((response) => {
        expect(response).toEqual(responseMock);
      });
      httpMock.mockRequest(url, 'get', responseMock);
    });
  });
});

const path = environment.hostApi.fiduciaryProcessApi.endpoint;
