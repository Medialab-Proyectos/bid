import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { FinishedDocsContractsComponent } from './finished-docs-contracts.component';
import { DocEnum } from '@core/enums';
import { FiduciaryProcessDocument } from '@core/models';
import { throwError } from 'rxjs';
import { NotificationService } from '@progress/kendo-angular-notification';
import { mockNotificationService } from '../../../../../../test/test-helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockDoc = {
  id: '',
  status: 1,
  name: '',
  type: 2,
  operationsDocumentId: 1,
  ezshareNumber: '',
  created: new Date(),
  modified: new Date(),
  createdBy: '',
  relationalId: '',
  participantsOptions: [
    {
      nationality: '',
      biddingProcessBidderId: '',
      biddingProcessParticipantId: 'participant1',
      name: 'John Doe',
    },
    {
      nationality: '',
      biddingProcessBidderId: '',
      biddingProcessParticipantId: 'participant2',
      name: 'Jane Doe',
    },
  ],
};

describe('FinishedDocsComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  describe('mode setter', () => {
    it('should set enumType to biddingContractDocumentGroupCodes when mode is CONTRACTS', async () => {
      const { component } = await setup();
      component.mode = DocEnum.CONTRACTS;
      expect(component.enumType).toBe(
        component.enum.biddingContractDocumentGroupCodes
      );
    });

    it('should set enumType to biddingContractAmendmentDocumentGroupCodes when mode is AMENDMENTS', async () => {
      const { component } = await setup();
      component.mode = DocEnum.AMENDMENTS;
      expect(component.enumType).toBe(
        component.enum.biddingContractAmendmentDocumentGroupCodes
      );
    });

    it('should set enumType to biddingProcessDocumentGroupCodes when mode is not CONTRACTS or AMENDMENTS', async () => {
      const { component } = await setup();
      component.mode = DocEnum.PACKAGES;
      expect(component.enumType).toBe(
        component.enum.biddingProcessDocumentGroupCodes
      );
    });
  });

  describe('downloadDocument', () => {
    it('should call download error message on error', async () => {
      const { component } = await setup();
      const doc: FiduciaryProcessDocument = {
        id: 1,
        ...mockDoc,
        name: 'test_document.pdf',
        description: '',
      };
      const error = 'Error';

      jest
        .spyOn(component.fileServices, 'downloadFile')
        .mockReturnValue(throwError(error));

      const spy = jest.spyOn(component, 'donwloadErrorMessage');
      component.donwloadDocument(doc);

      expect(spy).toHaveBeenCalled();
      expect(component.isDowloading).toBe(false);
    });
  });
});

async function setup() {
  const { fixture } = await render(FinishedDocsContractsComponent, {
    declarations: [FinishedDocsContractsComponent],
    schemas: [],
    componentProperties: {
      _files: [],
    },
    imports: [
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
    ],
    providers: [
      {
        provide: NotificationService,
        useValue: mockNotificationService,
      },
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}
