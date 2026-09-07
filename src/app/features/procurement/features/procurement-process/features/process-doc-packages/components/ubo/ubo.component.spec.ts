import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UBOComponent } from './ubo.component';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';

describe('UBOComponent', () => {
  let component: UBOComponent;
  let fixture: ComponentFixture<UBOComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UBOComponent],
      imports: [
        DialogModule,
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [TranslatePipe, NotificationService, provideMockStore({})],
    });
    fixture = TestBed.createComponent(UBOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
