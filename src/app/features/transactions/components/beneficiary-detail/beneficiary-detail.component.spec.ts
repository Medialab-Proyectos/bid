import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionPanelComponent } from '@fiduciary-interface/app/shared/components/accordion/components/accordion-panel/accordion-panel.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { BeneficiaryDetailComponent } from './beneficiary-detail.component';

describe('BeneficiaryDetailComponent', () => {
  let component: BeneficiaryDetailComponent;
  let fixture: ComponentFixture<BeneficiaryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BeneficiaryDetailComponent, AccordionPanelComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiaryDetailComponent);
    component = fixture.componentInstance;
    (component.sectionKey = ''), (component.detail = {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
