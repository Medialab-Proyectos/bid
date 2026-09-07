import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivitiesApiService } from './activities-api.service';

describe('ActiviesService', () => {
  let service: ActivitiesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [],
    });
    service = TestBed.inject(ActivitiesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
