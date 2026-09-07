import { TransactionDrpComponent } from './transaction-drp.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
async function setup() {
  const { fixture } = await render(TransactionDrpComponent, {
    declarations: [TransactionDrpComponent],
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
      provideWindowSizeMock(),
      provideMockStore(),
      {
        provide: NotificationGlobalService,
        useValue: notificationGlobalSvcMock,
      },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('TransactionDpbComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
