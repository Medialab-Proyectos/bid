import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ParticipantsAwardedComponent } from './participants-awarded.component';

async function setup() {
  const { fixture } = await render(ParticipantsAwardedComponent, {
    declarations: [ParticipantsAwardedComponent],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [TranslatePipe],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ParticipantsAwardedComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
