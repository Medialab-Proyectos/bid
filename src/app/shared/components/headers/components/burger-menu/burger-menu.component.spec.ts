import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BurgerMenuComponent } from './burger-menu.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { render } from '@testing-library/angular';
import { DrawerMenuItem } from '@core/models';

async function setup() {
  const { fixture } = await render(BurgerMenuComponent, {
    declarations: [BurgerMenuComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      NoopAnimationsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('BurgerMenuComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('selectedMenuItem', () => {
    it('should set selectedMenuItem', async () => {
      const { component } = await setup();

      const item: DrawerMenuItem = null;

      const spy = jest.spyOn(component.pathEmitter, 'emit');

      component.selectedMenuItem(item);
      expect(spy).toHaveBeenCalled();
    });
  });
});
