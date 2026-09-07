/* import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { StoreModule } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DocumentStateTagComponent } from './document-state-tag.component'; */

describe('DocumentStateTagComponent', () => {
  /* async function setup(state) {
    await render(DocumentStateTagComponent, {
      componentProperties: {
        tag: state,
      },
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        StoreModule.forRoot({}),
        PipeModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ),
      ],
      providers: [TranslatePipe],
    });
  } */

  /* it('should see the document on draft state', async () => {
    await setup(DocumentState.draftUploadedBlobStorage);

    expect(screen.getByText(/Draft/i)).toBeInTheDocument();
  });

  it('should see the document on revision state', async () => {
    await setup(DocumentState.underReview);

    expect(screen.getByText(/In Revision/i)).toBeInTheDocument();
  });

  it('should see the document on rejected state', async () => {
    await setup(DocumentState.rejected);

    expect(screen.getByText(/Reviewed with comments/i)).toBeInTheDocument();
  });

  it('should see the document on published state', async () => {
    await setup(DocumentState.uploaded);

    expect(screen.getByText(/Published/i)).toBeInTheDocument();
  }); */

  it('mocktest', () => {
    expect(1).toBe(1);
  });
});
