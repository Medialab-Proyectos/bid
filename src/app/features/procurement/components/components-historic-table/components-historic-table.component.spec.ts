import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentsHistoricTableComponent } from './components-historic-table.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PipeModule } from '@fiduciary-interface/app/shared';

describe('ComponentsHistoricTableComponent', () => {
  let component: ComponentsHistoricTableComponent;
  let fixture: ComponentFixture<ComponentsHistoricTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComponentsHistoricTableComponent],
      imports: [
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentsHistoricTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
