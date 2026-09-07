import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { AvatarModule } from '@progress/kendo-angular-layout';
import { render } from '@testing-library/angular';
import { getByText, screen } from '@testing-library/dom';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProfileCardComponent } from './profile-card.component';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';

const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('ProfileCardComponent', () => {
  it('should show languages', async () => {
    await setup();
    const list = screen.getByTestId('list');

    expect(getByText(list, /Español/i)).toBeInTheDocument();
    expect(getByText(list, /English/i)).toBeInTheDocument();
    expect(getByText(list, /Português/i)).toBeInTheDocument();
    expect(getByText(list, /Français/i)).toBeInTheDocument();
  });

  it('should open languages list', async () => {
    const { component } = await setup();

    screen.getByTestId('value').click();

    expect(component.isDropdownOpen).toBe(true);
  });

  it('should close languages list', async () => {
    const { component } = await setup();
    component.isDropdownOpen = true;
    screen.getByTestId('value').click();

    expect(component.isDropdownOpen).toBe(false);
  });
});

async function setup() {
  const { fixture } = await render(ProfileCardComponent, {
    componentProperties: {
      userInfo: {
        name: 'Nikolas',
        email: 'matamalas@iadb.org',
        initials: 'MS',
        roles: [],
      },
      languages: [
        { code: 'ES', name: 'Español' },
        { code: 'EN', name: 'English' },
        { code: 'PO', name: 'Português' },
        { code: 'FR', name: 'Français' },
      ],
      selectedLanguage: { code: 'ES', name: 'Español' },
    },
    imports: [
      MsalTestModule,
      DialogModule,
      AvatarModule,
      ButtonsModule,
      RouterTestingModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      provideMockStore(),
      {
        provide: NotificationGlobalService,
        useValue: notificationGlobalSvcMock,
      },
    ],
  });

  const component = fixture.componentInstance;
  return {
    component,
    fixture,
  };
}
