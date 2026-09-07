import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { UserSideMenuComponent } from './user-side-menu.component';
import { render } from '@testing-library/angular';
import { DrawerComponent } from '@progress/kendo-angular-layout';
import { TranslateTestingModule } from 'ngx-translate-testing';

// const mockUserInfo = {
//   email: 'onlinebiddingprocess@gmail.com',
//   initials: 'OP',
//   name: 'ONLINE BIDDING PROCESS',
//   roles: [
//     {
//       code: 'OBP-Requestor',
//       id: 'e1aa8817fe004b338e531d64622816fa',
//       name: 'Executing Agency Requestor',
//       permissions: [],
//     },
//   ],
// };

async function setup() {
  const { fixture } = await render(UserSideMenuComponent, {
    declarations: [DrawerComponent],
    imports: [
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [],
  });
  const component = fixture.debugElement.componentInstance;
  return { fixture, component };
}

describe('UserSideMenuComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call the toogle event', async () => {
    const { fixture, component } = await setup();
    const eventSpy = jest.spyOn(component.drawer, 'toggle');
    component.toggle();
    fixture.detectChanges();
    expect(eventSpy).toHaveBeenCalled();
  });

  it('should call the toogle language', async () => {
    const { fixture, component } = await setup();
    component.expandedLanguage = false;
    component.toggleLanguage();
    fixture.detectChanges();
    expect(component.expandedLanguage).toBe(true);
  });
});
