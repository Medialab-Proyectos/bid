import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RContractErrorComponent } from './r-contract-error.component';

describe('PaymentScheduleErrorComponent', () => {
  let component: RContractErrorComponent;
  let fixture: ComponentFixture<RContractErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RContractErrorComponent],
    });
    fixture = TestBed.createComponent(RContractErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
