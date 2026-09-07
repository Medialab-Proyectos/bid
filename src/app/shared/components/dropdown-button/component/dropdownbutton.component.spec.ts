import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { DropdownbuttonComponent } from './dropdownbutton.component';

async function setup() {
  const { fixture } = await render(DropdownbuttonComponent, {
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

describe('DropdownbuttonComponent', () => {
  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should emit on item click', async () => {
    const { component, fixture } = await setup();

    const spy = jest.spyOn(component.selectedOption, 'emit');
    component.onItemClick('option');
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });
});
