import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Contract } from '@core/models';

import { ContractDetailsComponent } from './contract-details.component';

describe('ContractDetailsComponent', () => {
  let component: ContractDetailsComponent;
  let fixture: ComponentFixture<ContractDetailsComponent>;
  let contract: Contract = {
    id: 'CO-L1229-P0019-C01',
    name: 'Lilas Flores',
    country: 'USA',
    status: 'Revisado',
    updateDate: new Date('2020/12/24'),
    amendment: 'Borrador'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractDetailsComponent);
    component = fixture.componentInstance;
    component.contract = contract;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit go back event', () => {
    const eventSpy = jest.spyOn(component.goBack, 'emit');

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(eventSpy).toHaveBeenCalled();
  });
});
