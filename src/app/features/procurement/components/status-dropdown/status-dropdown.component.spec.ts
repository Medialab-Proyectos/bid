import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { StatusDropdownComponent } from './status-dropdown.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

describe('StatusDropdownComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should create a valid Obs on Dropdown open when there is a mongo valid config', async () => {
    const { component, fixture } = await setup();
    jest.spyOn(component.configSvc, 'settings').mockReturnValue(
      of({
        settings: [
          {
            id: 'f26cccf9-f68f-45b7-8175-ed9c9d82afd6',
            type: 'Method',
            attributes: [],
            values: '{ "status" : ["EXPECTED"] }',
            modified: 'system',
          },
        ],
      })
    );
    component.open();
    fixture.detectChanges();
    await expect(component.data$.pipe(first()).toPromise()).resolves.toEqual([
      { text: 'ENUM.PROCUREMENT.PROCESS.STATUS.EXPECTED', value: 0 },
    ]);
  });

  it('should create a valid Obs on Dropdown open when there is a mongo invalid config', async () => {
    const { component, fixture } = await setup();
    jest.spyOn(component.configSvc, 'settings').mockReturnValue(
      of({
        settings: [
          {
            id: 'f26cccf9-f68f-45b7-8175-ed9c9d82afd6',
            type: 'Method',
            attributes: [],
            values: '',
            modified: 'system',
          },
        ],
      })
    );
    component.open();
    fixture.detectChanges();
    await expect(component.data$.pipe(first()).toPromise()).resolves.toEqual([
      { text: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONFIRMED', value: 1 },
    ]);
  });

  it('should create a valid Obs on Dropdown with the actual status on failed settings response', async () => {
    const { component, fixture } = await setup();
    const error = {
      status: 401,
      message: 'You are not logged in',
    };
    jest
      .spyOn(component.configSvc, 'settings')
      .mockReturnValue(throwError(error));
    component.open();
    fixture.detectChanges();
    await expect(component.data$.pipe(first()).toPromise()).resolves.toEqual([
      { text: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONFIRMED', value: 1 },
    ]);
  });

  describe('valueChange', () => {
    it('should call updateProcurementStatusAction', async () => {
      const { component } = await setup();

      const actionSpy = jest
        .spyOn(component.procurementStore, 'updateProcurementStatusAction')
        .mockReturnValue();
      component.valueChange(0);

      expect(actionSpy).toHaveBeenCalled();
    });
  });
});

async function setup() {
  const { fixture } = await render(StatusDropdownComponent, {
    componentProperties: {
      prefix: 'ENUM.PROCUREMENT.PROCESS.STATUS.',
      countryCode: 'CO',
      item: {
        id: '',
        name: '',
        description: '',
        category: {
          id: 1,
          name: 'category',
        },
        categoryEnum: {
          id: 0,
          name: 'string',
        },
        procurementMethod: {
          id: 2,
          name: 'procurement',
        },
        procurementMethodEnum: {
          id: 0,
          name: 'string',
        },
        supervisionMethod: {
          id: 3,
          name: 'supervision',
        },
        isNotExante: true,
        supervisionMethodEnum: {
          id: 0,
          name: 'string',
        },
        justification: '',
        status: 1,
        statusEnum: {
          id: 0,
          name: 'ENUM.PROCUREMENT.PROCESS.STATUS.CONFIRMED',
        },
        bafo: '',
        lots: 1,
        manualId: '',
        sepaId: '',
        goodReference: '',
        processStartDate: '',
        contractSignedDate: '',
        destination: '',
        sustainabilityDescription: '',
        sustainability: '',
        components: '',
        outputs: [],
        deliverables: [],
        biddingMilestones: [],
        comments: [],
        componentHistories: [],
        documentPackages: [],
        created: '',
        createdBy: '',
        modified: '',
        modifiedBy: '',
        totalAmount: 1,
        code: '',
        totalComments: 1,

        advanceMilestone: {
          total: 1,
          totalCompleted: 2,
          delayed: true,
          currentMilestone: null,
        },
        subExecutor: '',
        projectAmount: {
          cofinancedAmount: 3,
          estimatedAmount: 3,
          idbAmount: 3,
          localCounterpartAmount: 3,
        },
        componentName: '',

        crudActions: [],
        progress: '',
        isMigrated: true,
        packagesUnderReview: true,
        isUpdated: true,
        milestonesDelayed: 'string',
        marked: false,
        order: 4,
      },
    },
    declarations: [],
    imports: [
      MsalTestModule,
      RouterTestingModule,
      HttpClientTestingModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
      TranslatePipe,
      provideMockStore({
        initialState,
      }),
      NotificationService,
    ],
  });

  const component = fixture.componentInstance;

  return { component, fixture };
}

const initialState = {
  enums: {
    biddingProcessProcurementProcessStatuses: [
      {
        id: 0,
        name: 'ENUM.PROCUREMENT.PROCESS.STATUS.EXPECTED',
      },
    ],
  },
};
