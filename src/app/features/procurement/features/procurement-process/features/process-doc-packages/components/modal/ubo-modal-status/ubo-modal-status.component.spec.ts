import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UboModalStatusComponent } from './ubo-modal-status.component';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('UboModalStatusComponent', () => {
  let component: UboModalStatusComponent;
  let fixture: ComponentFixture<UboModalStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UboModalStatusComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [TranslatePipe],
    });
    fixture = TestBed.createComponent(UboModalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('getCellClasses', () => {
    const mockfirstIndex = ['border-0', 'pt-0', 'pb-3', 'px-3'];
    const mockOtherIndex = ['px-3', 'py-3'];
    it('should return specific classes for index 0', () => {
      const result = component.getCellClasses(0);
      expect(result).toEqual(mockfirstIndex);
    });
    it('should return specific classes for index diff of 0', () => {
      const result = component.getCellClasses(1);
      expect(result).toEqual(mockOtherIndex);
    });
  });
});
