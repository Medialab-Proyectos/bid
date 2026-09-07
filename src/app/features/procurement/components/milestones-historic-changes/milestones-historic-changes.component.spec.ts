import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MilestonesHistoricChangesComponent } from './milestones-historic-changes.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { PipeModule } from '@fiduciary-interface/app/shared';

describe('MilestonesHistoricChangesComponent', () => {
  let component: MilestonesHistoricChangesComponent;
  let fixture: ComponentFixture<MilestonesHistoricChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MilestonesHistoricChangesComponent],
      imports: [
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MilestonesHistoricChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
