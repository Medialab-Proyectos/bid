import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NewJointVentureComponent } from '../new-joint-venture/new-joint-venture.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

async function setup() {
  const { fixture } = await render(NewJointVentureComponent, {
    declarations: [],
    imports: [
      DialogModule,
      MsalTestModule,
      DirectivesModule,
      HttpClientTestingModule,
      RouterTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      NotificationService,
      provideMockStore({}),
      provideWindowSizeMock(),
    ],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('NewBidderComponent', () => {
  it('should build the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('goBack', () => {
    it('should navigate', async () => {
      const { component } = await setup();

      const navigationSpy = jest
        .spyOn(component.router, 'navigate')
        .mockImplementation();

      component.goBack();

      expect(navigationSpy).toHaveBeenCalled();
    });
  });

  describe('showRequestSuccess', () => {
    it('should call notification toast', async () => {
      const { component } = await setup();

      const spy = jest
        .spyOn(component.notificationGlobalService, 'showSuccess')
        .mockImplementation();

      component.showRequestSuccess();

      expect(spy).toHaveBeenCalled();
    });
  });
  describe('showRequestError', () => {
    it('should call notification toast', async () => {
      const { component } = await setup();

      const spy = jest
        .spyOn(component.notificationGlobalService, 'showError')
        .mockImplementation();

      component.showRequestError();

      expect(spy).toHaveBeenCalled();
    });
  });
});
