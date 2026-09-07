import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProcessChangesService } from './process-changes.service';

describe('ProcessChangesService', () => {
  let service: ProcessChangesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProcessChangesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
