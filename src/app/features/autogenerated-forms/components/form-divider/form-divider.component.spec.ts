import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDividerComponent } from './form-divider.component';

describe('FormDividerComponent', () => {
  let component: FormDividerComponent;
  let fixture: ComponentFixture<FormDividerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormDividerComponent],
    });
    fixture = TestBed.createComponent(FormDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
