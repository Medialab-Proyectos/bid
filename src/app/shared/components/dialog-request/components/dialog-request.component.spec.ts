import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { DialogRequestComponent } from './dialog-request.component';

describe('DialogRequestComponent', () => {
  it('should create', async () => {
    const component = setup();
    expect(component).toBeTruthy();
  });
});

async function setup() {
  const { fixture } = await render(DialogRequestComponent, {
    componentProperties: {
      content: [
        { key: 'PROCUREMENT.UNOFFICIAL_REVIEW.CONTENT_1', bold: false },
        { key: 'PROCUREMENT.UNOFFICIAL_REVIEW.CONTENT_2', bold: true },
        { key: 'PROCUREMENT.UNOFFICIAL_REVIEW.CONTENT_3', bold: false },
      ],
    },
    imports: [
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [],
  });

  const component = fixture.componentInstance;
  return {
    component,
    fixture,
  };
}
