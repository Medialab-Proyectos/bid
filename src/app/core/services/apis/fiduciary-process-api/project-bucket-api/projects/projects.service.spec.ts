import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProjectsApiService } from '@core/services/apis';
import { environment } from '@fiduciary-interface/environments/environment';
import { HttpRequestController } from '@fiduciary-interface-test';
import { ProjectTaskResponse } from '@core/models';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';

describe('ProjectsApiService', () => {
  let service: ProjectsApiService;
  let httpMock: HttpRequestController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MsalTestModule],
      providers: [HttpRequestController, provideMockStore({})],
    });
    service = TestBed.inject(ProjectsApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  const apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  it('should get project task', () => {
    const projectBucketId = '1123';
    const responseMock: ProjectTaskResponse = { projectTasks: [] };

    service.getProjectTasks(projectBucketId).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    const url = `${apiUrl}/api/projectBuckets/${projectBucketId}/projectTasks`;
    httpMock.mockRequest(url, 'get', responseMock);
  });

  it('should get project task with type parameter', () => {
    const projectBucketId = '1123';
    const type = 1;
    const responseMock: ProjectTaskResponse = { projectTasks: [] };

    service.getProjectTasks(projectBucketId, type).subscribe((response) => {
      expect(response).toEqual(responseMock);
    });

    const url = `${apiUrl}/api/projectBuckets/${projectBucketId}/projectTasks?type=${type}`;
    httpMock.mockRequest(url, 'get', responseMock);
  });
});
