import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AdditionalDocPackagesService } from './additional-doc-packages.service';

describe('AdditionalDocPackagesService', () => {
  let service: AdditionalDocPackagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdditionalDocPackagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
