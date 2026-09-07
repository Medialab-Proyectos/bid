import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { TransactionDpsComponent } from './transaction-dps.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('TransactionDpsComponent', () => {
  async function setup() {
    const { fixture } = await render(TransactionDpsComponent, {
      declarations: [],
      imports: [
        DialogModule,
        RouterTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        HttpClientTestingModule,
      ],
      providers: [
        provideMockStore(),
        provideWindowSizeMock({ mobileView: false }),
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    const component = fixture.componentInstance;

    fixture.detectChanges();

    return {
      component,
      fixture,
    };
  }

  it('should be created', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
