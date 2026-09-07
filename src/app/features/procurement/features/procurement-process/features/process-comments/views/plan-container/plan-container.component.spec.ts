import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanContainerComponent } from './plan-container.component';

describe('PlanContainerComponent', () => {
  let component: PlanContainerComponent;
  let fixture: ComponentFixture<PlanContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanContainerComponent]
    });
    fixture = TestBed.createComponent(PlanContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
