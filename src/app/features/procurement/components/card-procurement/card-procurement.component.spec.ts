import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardProcurementComponent } from './card-procurement.component';

describe('CardProcurementComponent', () => {
  let component: CardProcurementComponent;
  let fixture: ComponentFixture<CardProcurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardProcurementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardProcurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
