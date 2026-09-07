import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementTabMenuComponent } from './procurement-tab-menu.component';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('ProcurementTabMenuComponent', () => {
  let component: ProcurementTabMenuComponent;
  let fixture: ComponentFixture<ProcurementTabMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcurementTabMenuComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementTabMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
