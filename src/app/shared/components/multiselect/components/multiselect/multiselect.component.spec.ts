import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { MultiselectComponent } from './multiselect.component';

async function setup() {
  const { fixture } = await render(MultiselectComponent, {
    componentProperties: {
      data: [{ biddingProcessParticipantId: '123' }],
    },
    declarations: [MultiselectComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('MultiselectComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('valueChange', () => {
    it('should emit multiSelectChange', async () => {
      const { component } = await setup();

      const spy = jest.spyOn(component.multiSelectChange, 'emit');

      component.valueChange(['test']);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('set values', () => {
    it('should set values', async () => {
      const { component } = await setup();

      component.values = [];
      expect(component._values).toEqual([]);
    });
  });
});
