import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionsFormsComponent } from './options-forms.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { commonTestProviders } from '@fiduciary-interface/test/test-helpers';

describe('OptionsFormsComponent', () => {
  let component: OptionsFormsComponent;
  let fixture: ComponentFixture<OptionsFormsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OptionsFormsComponent, TranslateTestingModule],
      providers: [...commonTestProviders],
    });
    fixture = TestBed.createComponent(OptionsFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
