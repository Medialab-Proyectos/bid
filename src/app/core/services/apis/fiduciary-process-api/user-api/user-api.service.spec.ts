import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserApiService } from './user-api.service';
import { HttpRequestController } from '@fiduciary-interface-test';

describe('SidebarApiService', () => {
  let service: UserApiService;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpRequestController],
    });
    service = TestBed.inject(UserApiService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
