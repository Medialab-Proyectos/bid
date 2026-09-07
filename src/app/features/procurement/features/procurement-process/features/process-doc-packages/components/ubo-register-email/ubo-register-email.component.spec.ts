import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UboRegisterEmailComponent } from './ubo-register-email.component';
import { createBidder } from '../modal/ubo-modal/ubo.form';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';

describe('UboRegisterEmailComponent', () => {
  let component: UboRegisterEmailComponent;
  let fixture: ComponentFixture<UboRegisterEmailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UboRegisterEmailComponent],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [TranslatePipe],
    });
    fixture = TestBed.createComponent(UboRegisterEmailComponent);
    component = fixture.componentInstance;
    component.bidderForm = createBidder('name', 'id1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addRow', () => {
    it('should add an email when addRow is called', () => {
      const emailsLength = component.emails.length;
      component.addRow();
      const newLength = component.emails.length;

      expect(emailsLength).toEqual(newLength - emailsLength);
    });
  });

  describe('deleteRow', () => {
    it('should delete an email when deleteRow is called', () => {
      const emailsLength = component.emails.length;
      component.deleteRow(0);
      const newLength = component.emails.length;

      expect(emailsLength).toEqual(newLength + 1);
    });
  });
});
