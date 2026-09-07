import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SidebarApiService } from './sidebar-api.service';
import { MenuItem } from '@progress/kendo-angular-menu';
import { HttpRequestController } from '@fiduciary-interface-test';
import { environment } from '@fiduciary-interface/environments/environment';
describe('SidebarApiService', () => {
  let service: SidebarApiService;
  let httpMock: HttpRequestController;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(SidebarApiService);
    httpMock = TestBed.inject(HttpRequestController);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call http.get with the correct endpoint', () => {
    const url = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/configurations/sidebar`;
    const responseMock: MenuItem[] = [{ text: 'Item 1' }, { text: 'Item 2' }];

    service.getSidebar().subscribe((response) => {
      expect(response).toEqual(responseMock);
    });
    httpMock.mockRequest(url, 'get', responseMock);
  });
});
