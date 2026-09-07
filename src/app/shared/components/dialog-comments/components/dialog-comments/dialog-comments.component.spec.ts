import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { DialogCommentsComponent } from './dialog-comments.component';

async function setup() {
  const { fixture } = await render(DialogCommentsComponent, {
    componentProperties: {
      commentList: [
        {
          created: new Date(),
          createdBy: 'user',
          id: '1',
          source: 0,
          status: 0,
          text: 'text',
          visibility: 0,
        },
      ],
    },
    declarations: [DialogCommentsComponent],
    imports: [
      ReactiveFormsModule,
      FormsModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, DialogRef],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });

  const component = fixture.componentInstance;

  return { fixture, component };
}

describe('Comments component', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
