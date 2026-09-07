import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ErrorListComponent } from './error-list.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('ErrorListComponent', () => {
  let component: ErrorListComponent;
  let fixture: ComponentFixture<ErrorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ErrorListComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
