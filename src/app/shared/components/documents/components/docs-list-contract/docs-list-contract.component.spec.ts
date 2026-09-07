import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DocsListContractComponent } from './docs-list-contract.component';
import { DocEnum } from '@core/enums';
import { Enums } from '@core/models';

describe('DocsListComponent', () => {
  async function setup(empty = false, mode = null) {
    let documents = [];
    if (empty === false) {
      documents = [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          status: 0,
          type: 0,
          operationsDocumentId: 0,
          documentGroupId: '',
          ezshareNumber: 'string',
          name: 'BID 2020 Revisado.docx',
          created: '2021-11-12T20:51:50.946Z',
          createdBy: 'string',
          modified: '2021-11-12T20:51:50.946Z',
        },
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          status: 1,
          type: 1,
          operationsDocumentId: 2,
          documentGroupId: '',
          ezshareNumber: 'string',
          name: 'BID 2021 Revisado.docx',
          created: '2021-11-12T20:51:50.946Z',
          createdBy: 'string',
          modified: '2021-11-12T20:51:50.946Z',
        },
      ];
    }
    const { fixture } = await render(DocsListContractComponent, {
      declarations: [],
      componentProperties: {
        mandatoryDocs: [
          {
            id: 'cb1d82ed-fc62-4cde-9f5e-18de236a0d93',
            groupCode: 0,
            isMandatory: true,
            fiduciaryProcessDocuments: documents,
          },
        ],
        mode: mode,
      },
      imports: [
        TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
          'en'
        ),
      ],
      schemas: [],
      providers: [],
    });
    const component = fixture.debugElement.componentInstance;
    return {
      fixture,
      component,
    };
  }

  it('should not show uploaded icon', async () => {
    await setup(true);
    expect(screen.queryByTestId('checkedIcon')).not.toBeInTheDocument();
  });
  describe('set mode', () => {
    it('should set groupEnum with biddingContractDocumentGroupCodes enums', async () => {
      const { component } = await setup(true, DocEnum.CONTRACTS);
      expect(component.groupEnum).toBe(Enums.biddingContractDocumentGroupCodes);
    });
    it('should set groupEnum with biddingContractAmendmentDocumentGroupCodes enums ', async () => {
      const { component } = await setup(true, DocEnum.AMENDMENTS);
      expect(component.groupEnum).toBe(
        Enums.biddingContractAmendmentDocumentGroupCodes
      );
    });
    it('should set groupEnum with biddingProcessDocumentGroupCodes enums ', async () => {
      const { component } = await setup(true, DocEnum.PACKAGES);
      expect(component.groupEnum).toBe(Enums.biddingProcessDocumentGroupCodes);
    });
  });
});
