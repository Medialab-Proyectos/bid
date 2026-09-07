import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RContractsRegisterContractComponent } from './r-contracts-register-contract.component';

describe('RContractsRegisterContractComponent', () => {
  let component: RContractsRegisterContractComponent;
  let fixture: ComponentFixture<RContractsRegisterContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RContractsRegisterContractComponent]
    });
    fixture = TestBed.createComponent(RContractsRegisterContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
