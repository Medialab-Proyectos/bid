import { DatePipe } from '@angular/common';
import { CommentsListComponent } from './comments-list.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { StoreModule } from '@ngrx/store';

async function setup() {
  const { fixture } = await render(CommentsListComponent, {
    componentProperties: {
      comment: {
        created: new Date(),
        createdBy: 'user',
        id: '1',
        source: 0,
        status: 0,
        text: 'text',
        visibility: 0,
      },
    },
    declarations: [CommentsListComponent],
    imports: [
      StoreModule.forRoot({}),
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe, DatePipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });

  const component = fixture.componentInstance;

  return { fixture, component };
}

describe('CommentsList component', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
