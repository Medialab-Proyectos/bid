import { FilesListContractComponent } from './files-list-contract.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { render, screen } from '@testing-library/angular';
import {
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
} from '@core/models';
import { of, throwError } from 'rxjs';
import { DocEnum } from '@core/enums';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import {
  MatDialogProviders,
  mockNotificationService,
  MsalProviders,
} from '../../../../../../test/test-helpers';
import { provideMockStore } from '@ngrx/store/testing';

describe('FilesListContractComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  it('should render the document name correctly', async () => {
    await setup();
    expect(screen.getByText(/DOC_PRUEBA_MATAMALA/)).toBeInTheDocument();
  });

  describe('donwloadErrorMessage', () => {
    it('should show error message', async () => {
      const { component, fixture } = await setup();

      const notificationSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();

      component.donwloadErrorMessage();
      fixture.detectChanges();

      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  describe('donwloadDocument', () => {
    it('should call donwloadDocument', async () => {
      const { component, fixture } = await setup();

      const arrayBuffer = new ArrayBuffer(0);

      const donwloadDocumentSpy = jest
        .spyOn(component.fileServices, 'downloadFile')
        .mockReturnValue(of(arrayBuffer));
      const fileSaverSpy = jest
        .spyOn(component.fileSaverService, 'save')
        .mockReturnValue();

      component.donwloadDocument(mockFiles[0]);
      fixture.detectChanges();

      expect(donwloadDocumentSpy).toHaveBeenCalled();
      expect(fileSaverSpy).toHaveBeenCalled();
    });

    it('should show error msg when has an error donwloadDocument', async () => {
      const { component } = await setup();

      jest.spyOn(component.fileServices, 'downloadFile').mockReturnValue(
        throwError({
          error: {
            error: 'error',
          },
        })
      );
      const showErrorSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();
      component.donwloadDocument(mockFiles[0]);

      expect(showErrorSpy).toHaveBeenCalled();
    });
  });

  describe('populateEnumsGroupCodes', () => {
    it('should populate enumsGroupCodes in PACKAGES', async () => {
      const { component, fixture } = await setup();

      component._mode = DocEnum.PACKAGES;
      component.auxgroupEnum = [
        {
          id: 0,
          name: 'AMENDMENT_REQUEST_QUOTATIONS',
        },
        {
          id: 1,
          name: 'AMENDMENTS_PREQUALIFICATION',
        },
      ];

      component.populateEnumsGroupCodes();
      fixture.detectChanges();

      component.groupTypes$.subscribe((data) => {
        expect(data).toEqual(component.auxgroupEnum);
      });
    });

    it('should populate enumsGroupCodes in other modes', async () => {
      const { component, fixture } = await setup();

      component._mode = DocEnum.PACKAGES;
      component.groupsList = fiduciaryProcessDocumentGroup;
      component.auxgroupEnum = [
        {
          id: 0,
          name: 'AMENDMENT_REQUEST_QUOTATIONS',
        },
        {
          id: 1,
          name: 'AMENDMENTS_PREQUALIFICATION',
        },
      ];

      component.populateEnumsGroupCodes();
      fixture.detectChanges();

      component.groupTypes$.subscribe((data) => {
        expect(data).toEqual(component.auxgroupEnum);
      });
    });
  });

  describe('onChangeDocumentType', () => {
    it('should emit event with isResult true if mode is CONTRACTS', async () => {
      const { component, fixture } = await setup();
      component._mode = DocEnum.CONTRACTS;
      const emitSpy = jest.spyOn(component.editFile, 'emit');
      component.onChangeDocumentType(0, mockFiles[0]);
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});

async function setup() {
  /* const initialState = getInitialState(); */
  const { fixture } = await render(FilesListContractComponent, {
    declarations: [FilesListContractComponent],
    componentProperties: {
      files: mockFiles,
    },
    schemas: [],
    imports: [
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
    ],
    providers: [
      {
        provide: NotificationService,
        useVale: mockNotificationService,
      },
      ...MsalProviders,
      provideMockStore({}),
      ...MatDialogProviders,
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

/* function getInitialState() {
  const enumsState = { ...enumsInitialState };
  enumsState.biddingProcessDocumentGroupCodes = [
    { id: 1, name: 'Doc 1' },
    { id: 2, name: 'Doc 2' },
  ];
  return {
    enums: enumsState,
  };
} */

const mockFiles: FiduciaryProcessDocument[] = [
  {
    description: '',
    id: 'c07b2c70-190b-467b-bef7-f26eba026668',
    relationalId: 'c07b2c70-190b-467b-bef7-f26eba026668',
    status: 2,
    type: 1,
    operationsDocumentId: 1,
    ezshareNumber: '111666',
    name: 'DOC_PRUEBA_MATAMALA',
    created: new Date('2021-11-10T17:05:37.6466667'),
    createdBy: 'RPANTOJA',
    modified: new Date('2021-11-10T17:05:37.6466667'),
  },
  {
    description: '',
    id: 'c07b2c70-190b-467b-bef7-f26eba026668',
    relationalId: 'c07b2c70-190b-467b-bef7-f26eba026668',
    status: 2,
    type: 1,
    operationsDocumentId: 1,
    ezshareNumber: '111666',
    name: 'DOC_PRUEBA_RUSO',
    created: new Date('2021-11-10T17:05:37.6466667'),
    createdBy: 'RPANTOJA',
    modified: new Date('2021-11-10T17:05:37.6466667'),
  },
];

const fiduciaryProcessDocumentGroup: FiduciaryProcessDocumentGroup[] = [
  {
    id: '1',
    groupCode: 1,
    isMandatory: true,
  },
];
