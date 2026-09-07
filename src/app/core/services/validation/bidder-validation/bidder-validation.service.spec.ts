import { TestBed } from '@angular/core/testing';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { BidderValidationService } from './bidder-validation.service';

describe('BidderValidationService', () => {
  let service: BidderValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BidderValidationService],
    });
    service = TestBed.inject(BidderValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate bidders count', () => {
    const formGroup = new FormGroup({
      bidders: new FormArray([
        new FormGroup({
          name: new FormControl('', Validators.required),
          type: new FormControl('', Validators.required),
          parent: new FormControl('', Validators.required),
          nationality: new FormControl('', Validators.required),
        }),
      ]),
    });

    const errors = service.validateAllFormFields(formGroup);

    expect(errors.length).toBe(5);
    expect(errors).toContain('Joint Venture should contain at least 2 bidders');
  });

  it('should handle nested form arrays', () => {
    const formGroup = new FormGroup({
      bidders: new FormArray([
        new FormGroup({
          partners: new FormArray([
            new FormGroup({
              name: new FormControl('', Validators.required),
              type: new FormControl('', Validators.required),
              parent: new FormControl('', Validators.required),
              nationality: new FormControl('', Validators.required),
            }),
          ]),
        }),
      ]),
    });

    const errors = service.validateAllFormFields(formGroup);

    expect(errors.length).toBe(6);
    expect(errors).toContain('Participant Name is required');
    expect(errors).toContain('Participant Type is required');
    expect(errors).toContain('Participant Nationality is required');
    expect(errors).toContain('Joint Venture should contain at least 2 bidders');
  });
});
