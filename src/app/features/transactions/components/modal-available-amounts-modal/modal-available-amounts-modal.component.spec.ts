import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAvailableAmountsModalComponent } from './modal-available-amounts-modal.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';

describe('ModalAvailableAmountsModalComponent', () => {
  let component: ModalAvailableAmountsModalComponent;
  let fixture: ComponentFixture<ModalAvailableAmountsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAvailableAmountsModalComponent, IfNumberPipe],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAvailableAmountsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
