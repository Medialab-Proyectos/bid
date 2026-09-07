import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectStatus } from '@core/models';
import { SelectedProjectState } from '@core/store';
import {
  HttpRequestController,
  provideWindowSizeMock,
} from '@fiduciary-interface-test';
import {
  AccordionModule,
  DirectivesModule,
  KendoModule,
  NotificationModule,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { CostDistributionComponent } from '@fiduciary-interface/app/shared/components/form-sections/components/cost-distribution/cost-distribution.component';
import { environment } from '@fiduciary-interface/environments/environment';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProcessAdditionalInfoComponent } from '../process-additional-info/process-additional-info.component';
import { ProcessCommentsComponent } from '../process-comments/process-comments.component';
import { ProcessMilestonesComponent } from '../process-milestones/process-milestones.component';
import { ProcessOutputsComponent } from '../process-outputs/process-outputs.component';
import { ProcurementProcessDataComponent } from '../procurement-process-data/procurement-process-data.component';

import { ProcurementFormComponent } from './procurement-form.component';
import { GroupMethodEnum, SettingActionType, SettingType } from '@core/enums';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NotificationService } from '@progress/kendo-angular-notification';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

describe('ProcurementFormComponent', () => {
  describe('when init', () => {
    it('should load selected project data', async () => {
      const state = getState();
      const { component } = await setup(state);

      const selectedProject = state.selectedProject.selectedProject;
      expect(component.countryCode).toBe(selectedProject.countryCode);
      expect(component.attributeCountry).toEqual({
        key: 'countryCode',
        value: selectedProject.countryCode,
      });
    });

    it('should load components', async () => {
      const state = getState();
      const { httpMock } = await setup(state);

      initialRequestsMock(httpMock);
    });
  });

  describe('section process data', () => {
    it('should update procurement methods when change category', async () => {
      const { component, httpMock } = await setup(getState());
      initialRequestsMock(httpMock);
      component.valueChange({ event: 'category 1', dropdownValue: 'category' });

      expect(component.attributeCategory).toEqual({
        key: 'category',
        value: 'category 1',
      });
    });

    it('should update group methods when change procurement method', async () => {
      const state = getState();
      const { component, httpMock } = await setup(state);
      initialRequestsMock(httpMock);

      component.valueChange({ event: 'category 1', dropdownValue: 'category' });
      component.valueChange({
        event: 'procurementMethod 1',
        dropdownValue: 'procurementMethod',
      });

      expect(component.attributeProcurementMethod).toEqual({
        key: 'procurementMethod',
        value: 'procurementMethod 1',
      });
    });

    it('should update procurement methods when change threshold', async () => {
      const { component } = await setup(getState());

      component.valueChange({
        event: 'threshold 1',
        dropdownValue: 'threshold',
      });

      expect(component.attributeSupervisionMethod).toEqual({
        key: 'supervisionMethod',
        value: 'threshold 1',
      });
    });
  });

  describe('load thresholds', () => {
    it('should load thresholds', async () => {
      const state = getState();
      const { component, fixture } = await setup(state);

      const attributeCountry = null;
      const attributeCategory = null;
      const attributeProcurementMethod = null;
      const attributeGroupMethod = null;
      const attributeSupervisionMethod = null;

      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValue(of({ min: 0 }));

      component.queryThresholds(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod,
        attributeGroupMethod,
        attributeSupervisionMethod
      );
      fixture.detectChanges();

      expect(component.thresholds).toEqual({ min: 0 });
      expect(component.maxThresholdsRestriction).toBe(false);
      expect(component.minThresholdsRestriction).toBe(true);
    });

    it('should no load thresholds when no has data', async () => {
      const state = getState();
      const { component, fixture } = await setup(state);

      const attributeCountry = null;
      const attributeCategory = null;
      const attributeProcurementMethod = null;
      const attributeGroupMethod = null;
      const attributeSupervisionMethod = null;

      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValue(of(null));

      component.queryThresholds(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod,
        attributeGroupMethod,
        attributeSupervisionMethod
      );
      fixture.detectChanges();

      expect(component.thresholds).toEqual({ min: 0, max: 0 });
    });

    it('should load thresholds', async () => {
      const state = getState();
      const { component } = await setup(state);
      const attributeCountry = null;
      const attributeCategory = null;
      const attributeProcurementMethod = null;
      const attributeGroupMethod = null;
      const attributeSupervisionMethod = null;

      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValue(of({ max: 0 }));

      component.queryThresholds(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod,
        attributeGroupMethod,
        attributeSupervisionMethod
      );

      expect(component.thresholds).toEqual({ max: 0 });
      expect(component.maxThresholdsRestriction).toBe(true);
      expect(component.minThresholdsRestriction).toBe(false);
    });

    it('should load thresholds when procurement is ShoppingBidding', async () => {
      const state = getState();
      const { component } = await setup(state);

      const attributeCountry = null;
      const attributeCategory = null;
      const attributeProcurementMethod = null;
      const attributeGroupMethod = null;
      const attributeSupervisionMethod = null;

      component.attributeGroupMethod = {
        key: 'method',
        value: GroupMethodEnum.ShoppingBidding,
      };
      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValueOnce(of({ max: 0 }));
      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValueOnce(of({ min: 0, max: 0 }));

      component.queryThresholds(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod,
        attributeGroupMethod,
        attributeSupervisionMethod
      );

      expect(component.nationalBiddingThreshold).toEqual({ min: 0, max: 0 });
    });

    it('should no load thresholds for national bidding when procurement is not ShoppingBidding', async () => {
      const state = getState();
      const { component } = await setup(state);

      const attributeCountry = null;
      const attributeCategory = null;
      const attributeProcurementMethod = null;
      const attributeGroupMethod = null;
      const attributeSupervisionMethod = null;

      component.attributeGroupMethod = {
        key: 'method',
        value: GroupMethodEnum.NationalSystem,
      };
      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValueOnce(of({ max: 0 }));

      const loadNationalBiddingThresholds = jest.spyOn(
        component,
        'loadNationalBiddingThresholds'
      );

      component.queryThresholds(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod,
        attributeGroupMethod,
        attributeSupervisionMethod
      );

      expect(loadNationalBiddingThresholds).not.toHaveBeenCalled();
    });

    it('should no load thresholds when procurement is ShoppingBidding if are already loaded', async () => {
      const state = getState();
      const { component } = await setup(state);

      const attributeCountry = null;
      const attributeCategory = null;
      const attributeProcurementMethod = null;
      const attributeGroupMethod = null;
      const attributeSupervisionMethod = null;

      component.attributeGroupMethod = {
        key: 'method',
        value: GroupMethodEnum.ShoppingBidding,
      };
      component.nationalBiddingThreshold = { min: 22, max: 33 };
      const thresholdsRequest = jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValueOnce(of({ max: 0 }));
      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValueOnce(of({ min: 0, max: 0 }));

      component.queryThresholds(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod,
        attributeGroupMethod,
        attributeSupervisionMethod
      );

      expect(thresholdsRequest).toHaveBeenCalledTimes(1);
    });

    it('should no load thresholds when procurement is ShoppingBidding when no has data', async () => {
      const state = getState();
      const { component } = await setup(state);

      const attributeCountry = null;
      const attributeCategory = null;
      const attributeProcurementMethod = null;
      const attributeGroupMethod = null;
      const attributeSupervisionMethod = null;

      component.attributeGroupMethod = {
        key: 'method',
        value: GroupMethodEnum.ShoppingBidding,
      };

      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValueOnce(of({ max: 0 }));
      jest
        .spyOn((component as any).configSvc, 'thresholdSettings')
        .mockReturnValueOnce(of(null));

      component.queryThresholds(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod,
        attributeGroupMethod,
        attributeSupervisionMethod
      );

      expect(component.nationalBiddingThreshold).toEqual({ min: 0, max: 0 });
    });
  });

  describe('on supervision method change', () => {
    it('should get the field visibility config', async () => {
      const { component } = await setup();
      const spy = jest.spyOn(component, 'queryFieldsVisibility');
      component.valueChange({ dropdownValue: 'threshold', event: 'ExAnte' });
      expect(spy).toHaveBeenCalled();
    });

    describe('setReadOnlyMode', () => {
      it('should keep enable the form', async () => {
        const { component, fixture } = await setup();
        component.setReadOnlyMode();
        fixture.detectChanges();

        expect(component.form.enabled).toBe(true);
      });
    });
  });
});

function getState() {
  const selectedProjectState: SelectedProjectState = {
    error: null,
    loaded: true,
    loading: false,
    selectedProject: {
      currentApprovedAmount: 3,
      countryCode: 'CO',
      name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
      executor: 'MINISTERIO DE EDUCACION NACIONAL',
      executorAcronym: 'CO-MEN',
      contract: '4902/OC-CO',
      operationNumber: 'CO-L1229',
      approvedAmount: 60000000,
      status: ProjectStatus.Finished,
      projectBucketId: '123456789',
      institution: 'institution',
      location: 'location',
      operation: null,
      id: '1',
      nameEn: '',
      projectName: {
        en: '',
        es: '',
        fr: '',
        pt: '',
      },
      nameEs: '',
      nameFr: '',
      namePt: '',
      favorite: false,
    },
  };
  return {
    selectedProject: selectedProjectState,
  };
}

/**
 * This function has values related to tests
 * @param http
 */
function initialRequestsMock(http: HttpRequestController) {
  http.mockRequest(
    `${apiUrl}/api/v2/settings?settingActionType=${SettingActionType.Partial}&settingType=${SettingType.GroupMethod}`,
    'get',
    {
      data: {
        data: {
          settings: [
            {
              id: 'e3541104-836e-4fb3-8440-9fcae2850a8e',
              type: 'Method',
              attributes: [
                { key: 'countryCode', value: 'CO' },
                { key: 'category', value: 'PROCT_WORKS' },
              ],
              values:
                '{ "procurementMethods" : [{ "code" : "PROCT_ICB", "expired" : false }}',
              modified: 'system',
            },
          ],
        },
      },
    }
  );
}

async function setup(initialState = {}) {
  const { fixture } = await render(ProcurementFormComponent, {
    componentProperties: {
      formConfig: {
        commentsSection: {
          isDisabled: false,
        },
        costDistributionSection: {
          isDisabled: false,
        },
        outputsSection: {
          isDisabled: false,
        },
        milestoneSection: {
          isEstimatedDateDisabled: false,
          isEstimatedDateVisible: false,
          isReEstimatedDateDisabled: false,
          isReEstimatedDateVisible: false,
          isActualDateDisabled: false,
          isActualDateVisible: false,
          disabledRestimatedDates: [],
        },
        mode: null,
      },
    },
    declarations: [
      ProcurementProcessDataComponent,
      CostDistributionComponent,
      ProcessOutputsComponent,
      ProcessMilestonesComponent,
      ProcessAdditionalInfoComponent,
      ProcessCommentsComponent,
    ],
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      MsalTestModule,
      DirectivesModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      AccordionModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
      KendoModule,
      NotificationModule,
      HttpClientTestingModule,
    ],
    providers: [
      provideMockStore({ initialState }),
      provideWindowSizeMock(),
      HttpRequestController,
      NotificationService,
    ],
  });
  const component = fixture.componentInstance;
  const httpMock = TestBed.inject(HttpRequestController);
  return { component, fixture, httpMock };
}

const apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;
