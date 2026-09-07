import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProcessAdditionalInfoComponent } from './process-additional-info.component';

describe('ProcessAdditionalInfoComponent', () => {
  async function setup() {
    const { fixture } = await render(ProcessAdditionalInfoComponent, {
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      declarations: [ProcessAdditionalInfoComponent],
    });
    const component = fixture.debugElement.componentInstance;
    return { fixture, component };
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });
});
