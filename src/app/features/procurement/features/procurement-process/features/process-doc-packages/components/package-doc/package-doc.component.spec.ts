import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationModule } from '@fiduciary-interface/app/shared';
import { AdvanceMilestoneComponent } from '@fiduciary-interface/app/shared/components/advance-milestone/components/advance-milestone.component';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render, screen } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { PackageDocComponent } from './package-doc.component';

describe('PackageDocComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the package name correctly', async () => {
    await setup();
    expect(
      screen.getByText(/Prequalification Opening Record/i)
    ).toBeInTheDocument();
  });

  it('should render the documents counter', async () => {
    await setup();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render the document status', async () => {
    await setup();
    expect(screen.getByText(/Not Started/i)).toBeInTheDocument();
  });

  describe('collapseBtn', () => {
    it('should emit collapse item', async () => {
      const { component } = await setup();
      jest.spyOn(component.collapse, 'emit');
      component.collapseBtn(component.item);
      expect(component.collapse.emit).toHaveBeenCalled();
    });
  });

  describe('updateActualDate', () => {
    it('should call action updateActualDate', async () => {
      const { component } = await setup();
      const date = new Date();
      const spy = jest.spyOn(
        component.biddingProcessDocumentPackagesStoreSvc,
        'changeDocumentPackageStatusActualDateAction'
      );
      component.updateActualDate(date);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('routeToProcessComments', () => {
    it('should call route serivce', async () => {
      const { component } = await setup();

      const spy = jest.spyOn(component.route, 'navigate');
      component.routeToProcessComments();

      expect(spy).toHaveBeenCalled();
    });
  });
});

async function setup() {
  const initialState = getInitialState();
  const { fixture } = await render(PackageDocComponent, {
    declarations: [
      PackageDocComponent,
      TranslateEnumPipe,
      AdvanceMilestoneComponent,
    ],
    componentProperties: {
      item: {
        actualDate: new Date(),
        code: 1,
        id: '2',
        totalComments: 2,
        totalUploadedDocuments: 2,
        totalMandatoryDocuments: 4,
        order: 2,
        requireNonObjection: true,
        status: 1,
        documentsToUpload: [],
        bidValidityExtensionDate: new Date(),
        actualDateState: {
          loading: false,
        },
      },
      processId: '2',
    },
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      MsalTestModule,
      DateInputsModule,
      RouterTestingModule,
      HttpClientTestingModule,
      NotificationModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      provideMockStore({ initialState }),
      TranslatePipe,
      NotificationService,
      { provide: 'windowObject', useValue: window },
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

function getInitialState() {
  return {
    enums: {
      biddingProcessDocumentPackageStatuses: [
        {
          id: 0,
          name: 'ENUM.PROCESS.DOCUMENT.PACKAGE.STATUS.DRAFT',
        },
        {
          id: 1,
          name: 'ENUM.PROCESS.DOCUMENT.PACKAGE.STATUS.NOT_STARTED',
        },
      ],
      biddingProcessDocumentPackageCodes: [
        {
          id: 0,
          name: 'ENUM.PROCESS.DOCUMENT.PACKAGE.CODE.PUBLICATION_SPN_INVITATION',
        },
        {
          id: 1,
          name: 'ENUM.PROCESS.DOCUMENT.PACKAGE.CODE.PREQUALIFICATION_OPENING_RECORD',
        },
        {
          id: 2,
          name: 'ENUM.PROCESS.DOCUMENT.PACKAGE.CODE.PUBLICATION_SPN',
        },
      ],

      loaded: true,
      loading: false,
      error: null,
    },
  };
}
