import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KendoModule } from '@fiduciary-interface/app/shared';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import userEvent from '@testing-library/user-event';

import { FileSelectorComponent } from './file-selector.component';
import { DirectivesModule } from '@fiduciary-interface/app/shared/directives/directives.module';
import { provideMockStore } from '@ngrx/store/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

describe('FileSelectorComponent', () => {
  describe('when select files', () => {
    it('should emit value change event with selected files', async () => {
      const { component } = await setup();
      const eventSpy = jest.spyOn(component.valueChange, 'emit');

      const file = new File(['hello'], 'hello.png', { type: 'image/png' });

      const input = screen
        .getByTestId('File_InpFile-test')
        .querySelector('input');
      userEvent.upload(input, file);

      expect(input.files[0]).toEqual(file);
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should no emit selected files than has a not allowed extension', async () => {
      const { component } = await setup();
      const eventSpy = jest.spyOn(component.valueChange, 'emit');

      const file = new File(['hello'], 'hello.xml', {
        type: 'application/xml',
      });

      const input = screen
        .getByTestId('File_InpFile-test')
        .querySelector('input');
      userEvent.upload(input, file);

      expect(input.files[0]).toEqual(file);
      expect(eventSpy).toHaveBeenCalledWith([]);
    });
  });
});

async function setup() {
  const { fixture } = await render(FileSelectorComponent, {
    declarations: [],
    providers: [provideMockStore({})],
    imports: [
      DirectivesModule,
      KendoModule,
      MsalTestModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}
