import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTimePickerComponent } from './date-time-picker.component';
import { provideMockStore } from '@ngrx/store/testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DateTimePickerComponent', () => {
  let component: DateTimePickerComponent;
  let fixture: ComponentFixture<DateTimePickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DateTimePickerComponent, NoopAnimationsModule],
      providers: [provideMockStore(), ...commonTestProviders],
    });
    fixture = TestBed.createComponent(DateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
