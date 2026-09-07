import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ScrollButtonComponent } from './scroll-button.component';

async function setup() {
  const { fixture } = await render(ScrollButtonComponent, {
    imports: [
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ScrollButtonComponent', () => {
  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should go top', async () => {
    const { component, fixture } = await setup();

    const spy = jest.spyOn(component, 'scrollTopButton');

    screen.getByTestId('Scroll_btn').click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });
});
