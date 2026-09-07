import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimePickerComponent } from './time-picker.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimePickerComponent],
      imports: [TranslateTestingModule],
      providers: [commonTestProviders],
    });
    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
