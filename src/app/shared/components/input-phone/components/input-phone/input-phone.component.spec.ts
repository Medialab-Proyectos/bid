import { InputPhoneComponent } from './input-phone.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { inputPhone } from './input-phone-form.form';

async function setup() {
  const { fixture } = await render(InputPhoneComponent, {
    componentProperties: {
      form: inputPhone(),
      value: '+51 909 90',
    },
    declarations: [InputPhoneComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('InputPhoneComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
