import { ProcurementDraftCommentsComponent } from './procurement-process-draft-comments.component';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { MsalService } from '@azure/msal-angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { StoreModule } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { render } from '@testing-library/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import {
  CommentProcurementFormGroup,
  FormProcurementComments,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models/commentsForm.model';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
function createMockForm() {
  return new FormGroup<FormProcurementComments>({
    comments: new FormArray<FormGroup<CommentProcurementFormGroup>>([]),
  });
}

async function setup() {
  const { fixture } = await render(ProcurementDraftCommentsComponent, {
    componentProperties: {
      generalForm: createMockForm(),
    },
    imports: [
      MsalTestModule,
      StoreModule.forRoot({}),
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    declarations: [ProcurementDraftCommentsComponent],
    providers: [
      MsalService,
      {
        provide: NotificationGlobalService,
        useValue: notificationGlobalSvcMock,
      },
    ],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}

describe('ProcurementDraftCommentsComponent', () => {
  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });
});
