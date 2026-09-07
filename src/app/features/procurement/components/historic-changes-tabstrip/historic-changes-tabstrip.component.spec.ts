import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricChangesTabstripComponent } from './historic-changes-tabstrip.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PipeModule } from '@fiduciary-interface/app/shared';

describe('HistoricChangesTabstripComponent', () => {
  let component: HistoricChangesTabstripComponent;
  let fixture: ComponentFixture<HistoricChangesTabstripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoricChangesTabstripComponent],
      imports: [
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricChangesTabstripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
