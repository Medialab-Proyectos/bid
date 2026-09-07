import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  AppState,
  BiddingProcessPlanInitialState,
  enumsInitialState,
  SelectedProjectInitialState,
} from '@core/store';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of, throwError } from 'rxjs';
import { AppovedPlan, AppovedPlanResponse } from '../../models';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

import { ApprovedPlansComponent } from './approved-plans.component';

async function setup() {
  const { fixture } = await render(ApprovedPlansComponent, {
    declarations: [ApprovedPlansComponent],
    imports: [
      HttpClientTestingModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      MsalTestModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      TranslateEnumPipe,
      TranslatePipe,
      NotificationService,
      IFDatePipe,
      DatePipe,
      provideMockStore({ initialState }),
    ],
  });
  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('ApprovedPlansComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('donwloadErrorMessage', () => {
    it('should show error msg toast', async () => {
      const { component } = await setup();

      const toastSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();
      component.donwloadErrorMessage();

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('getApprovedPlansErrorMessage', () => {
    it('should show error msg toast', async () => {
      const { component } = await setup();

      const toastSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();
      component.getApprovedPlansErrorMessage();

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('getBiddingProcessPlan', () => {
    it('should set variable values', async () => {
      const { component } = await setup();

      const getBiddingProcessPlanSpy = jest
        .spyOn(component.biddingProcessPlanStore, 'getOrLoadBiddingProcessPlan')
        .mockReturnValue(of(biddingProcessPlan));
      component.getBiddingProcessPlan();

      expect(getBiddingProcessPlanSpy).toHaveBeenCalled();
      expect(component.enumPlanStatuses).toEqual([
        {
          id: 1,
          name: 'ENUM.PROCUREMENT.STATUS.DRAFT',
        },
      ]);
    });
  });

  describe('filterValue', () => {
    it('should filter the array given a value', async () => {
      const { component, fixture } = await setup();

      const plans: AppovedPlanResponse = {
        biddingProcessPlansApproved: [
          {
            id: 'EZSHARE-699036380-2866',
            status: 1,
            approvedBy: 'Leonor Rodriguez',
            approvedDate: new Date('2022-03-31T16:54:48.997Z'),
            submissionDate: new Date('2022-03-31T16:54:48.997Z'),
            version: '2022-24',
            document: {
              fiduciaryProcessDocumentId: '1',
              ezShareNumber: 'EZSHARE-699036380-2866',
              name: 'CO-L1229 Procurement Plan 2022 Version 2022.24.xlsx',
              disclosureDate: new Date('2022-03-31T16:54:48.997Z'),
            },
          },
          {
            id: 'EZSHARE-699036380-2866',
            status: 1,
            approvedBy: 'Juan Perez',
            approvedDate: new Date('2022-03-31T16:54:48.997Z'),
            submissionDate: new Date('2022-03-31T16:54:48.997Z'),
            version: '2022-23',
            document: {
              fiduciaryProcessDocumentId: '1',
              ezShareNumber: 'EZSHARE-699036380-2715',
              name: 'CO-L1229 Procurement Plan 2022 Version 2022.23.xlsx',
              disclosureDate: new Date('2022-03-31T16:54:48.997Z'),
            },
          },
          {
            id: 'EZSHARE-699036380-2866',
            status: 1,
            approvedBy: 'Mateo De Asambuja',
            approvedDate: new Date('2022-03-31T16:54:48.997Z'),
            submissionDate: new Date('2022-03-31T16:54:48.997Z'),
            version: '2022-22',
            document: {
              fiduciaryProcessDocumentId: '1',
              ezShareNumber: 'EZSHARE-699036380-2866',
              name: 'CO-L1229 Procurement Plan 2022 Version 2022.22.xlsx',
              disclosureDate: new Date('2022-03-31T16:54:48.997Z'),
            },
          },
        ],
      };

      component.gridData = plans.biddingProcessPlansApproved;

      component.filterValue('Leonor');
      fixture.detectChanges();

      expect(component.gridView).toEqual([
        {
          id: 'EZSHARE-699036380-2866',
          status: 1,
          approvedBy: 'Leonor Rodriguez',
          approvedDate: new Date('2022-03-31T16:54:48.997Z'),
          submissionDate: new Date('2022-03-31T16:54:48.997Z'),
          version: '2022-24',
          document: {
            fiduciaryProcessDocumentId: '1',
            ezShareNumber: 'EZSHARE-699036380-2866',
            name: 'CO-L1229 Procurement Plan 2022 Version 2022.24.xlsx',
            disclosureDate: new Date('2022-03-31T16:54:48.997Z'),
          },
        },
      ]);
    });
  });

  describe('donwloadDocument', () => {
    it('should download the document given ezshare id', async () => {
      const { component } = await setup();

      const res: ArrayBuffer = new ArrayBuffer(1);

      const fileServiceSpy = jest
        .spyOn(component.fileService, 'downloadFile')
        .mockReturnValue(of(res));

      const downloadDocumentSpy = jest
        .spyOn(component.fileSaverService, 'save')
        .mockReturnValue();

      component.donwloadDocument('123', 'name');

      expect(fileServiceSpy).toHaveBeenCalled();
      expect(downloadDocumentSpy).toHaveBeenCalled();
    });

    it('should show error msg when has an error downloading', async () => {
      const { component } = await setup();

      jest.spyOn(component.fileService, 'downloadFile').mockReturnValue(
        throwError({
          error: {
            error: 'error',
          },
        })
      );

      const showErrorSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();

      component.donwloadDocument('123', 'name');

      expect(showErrorSpy).toHaveBeenCalled();
    });
  });

  describe('getApprovedPlans', () => {
    it('should fill gridData with the approved plans from the service', async () => {
      const { component, fixture } = await setup();
      const response: AppovedPlanResponse = {
        biddingProcessPlansApproved: approvedPlans,
      };

      const getApprovedPlansSpy = jest
        .spyOn(component.biddingProcessPlanSvc, 'getApprovedPlans')
        .mockReturnValue(of(response));
      component.getApprovedPlans('1');
      fixture.detectChanges();

      expect(getApprovedPlansSpy).toHaveBeenCalled();
    });
  });
});

const enumState = { ...enumsInitialState };

enumState.biddingProcessPlanStatuses = [
  {
    id: 1,
    name: 'ENUM.PROCUREMENT.STATUS.DRAFT',
  },
];

const projectBucketId = '1235678';
const selectedProjectState = { ...SelectedProjectInitialState };
selectedProjectState.loading = false;
selectedProjectState.selectedProject = {
  name: 'name',
  operationNumber: 'operationNumber',
  executor: 'executor',
  executorAcronym: 'executorAcronym',
  contract: 'contract',
  approvedAmount: 0,
  location: 'location',
  status: null,
  institution: 'institution',
  operation: null,
  countryCode: 'countryCode',
  projectBucketId,
  id: '1',
  currentApprovedAmount: 15,
  nameEs: '',
  nameFr: '',
  namePt: '',
  favorite: false,
  nameEn: '',
  projectName: {
    en: '',
    es: '',
    fr: '',
    pt: '',
  },
};

const biddingPlanState = { ...BiddingProcessPlanInitialState };
biddingPlanState.biddingProcessPlan = {
  id: '123456',
  projectBucketId,
  status: 1,
} as any;

biddingPlanState.processScreenLoading = false;
biddingPlanState.processScreenLoaded = true;
biddingPlanState.biddingProcessProcurementProcesses = [
  {
    id: '123456',
    name: 'name',
    manualId: 'manualId',
    sustainabilityDescription: 'sustainabilityDescription',
    code: 'code',
    advanceMilestone: null,
    justification: 'justification',
    subExecutor: 'subExecutor',
    projectAmount: null,
    componentName: 'componentName',
    status: null,
    totalComments: 0,
    category: {
      id: 1,
      name: 'PROCUREMENT.CATEGORIES.PROCT_EXT_AUDIT',
    },
    procurementMethod: {
      id: 1,
      name: 'PROCUREMENT.SUPERVISION_METHOD.ExPost',
    },
    supervisionMethod: {
      id: 1,
      name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICBWP',
    },
  },
] as any;

const initialState: AppState = {
  enums: enumState,
  selectedProject: selectedProjectState,
  biddingProcessPlan: biddingPlanState,
};

const biddingProcessPlan = {
  projectState: selectedProjectState,
  biddingPlanState: biddingPlanState,
  enumState: enumState,
};

const approvedPlans: AppovedPlan[] = [
  {
    id: 'EZSHARE-699036380-2866',
    status: 1,
    approvedBy: 'Leonor Rodriguez',
    approvedDate: new Date('2022-03-31T16:54:48.997Z'),
    submissionDate: new Date('2022-03-31T16:54:48.997Z'),
    version: '2022-24',
    document: {
      fiduciaryProcessDocumentId: '1',
      ezShareNumber: 'EZSHARE-699036380-2866',
      name: 'CO-L1229 Procurement Plan 2022 Version 2022.24.xlsx',
      disclosureDate: new Date('2022-03-31T16:54:48.997Z'),
    },
  },
];
