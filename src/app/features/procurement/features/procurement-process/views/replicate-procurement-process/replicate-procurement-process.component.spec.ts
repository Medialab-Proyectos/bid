import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import {
  DirectivesModule,
  KendoModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { EditProcurementProcessComponent } from '../edit-procurement-process/edit-procurement-process.component';

describe('EditProcurementProcessComponent', () => {
  async function setup() {
    const { fixture } = await render(EditProcurementProcessComponent, {
      componentProperties: {
        isLoading: false,
      },
      imports: [
        MsalTestModule,
        LayoutModule,
        DirectivesModule,
        RouterTestingModule,
        ReactiveFormsModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
        KendoModule,
        NotificationModule,
        HttpClientTestingModule,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideWindowSizeMock(),
        provideMockStore({}),
        NotificationService,
      ],
    });
    const component = fixture.componentInstance;
    return { component, fixture };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
