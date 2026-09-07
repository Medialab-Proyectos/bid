import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionalFieldComponent } from './optional-field.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('OptionalFieldComponent', () => {
  let component: OptionalFieldComponent;
  let fixture: ComponentFixture<OptionalFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OptionalFieldComponent],
      imports: [TranslateTestingModule],
      providers: [commonTestProviders],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(OptionalFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
