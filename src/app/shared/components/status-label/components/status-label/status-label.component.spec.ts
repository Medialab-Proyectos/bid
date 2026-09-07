import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { StatusLabelComponent } from './status-label.component';

describe('StatusLabelComponent', () => {
  let component: StatusLabelComponent;
  let fixture: ComponentFixture<StatusLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusLabelComponent],
      imports: [
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [TranslatePipe, provideMockStore({})],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
