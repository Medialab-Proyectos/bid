import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiselectFormComponent } from './multiselect-form.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('MultiselectFormComponent', () => {
  let component: MultiselectFormComponent;
  let fixture: ComponentFixture<MultiselectFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
      declarations: [MultiselectFormComponent],
    });
    fixture = TestBed.createComponent(MultiselectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
