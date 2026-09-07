import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionEnum } from '@core/enums';
import { ProjectStatus } from '@core/models';
import { ContactState, SelectedProjectState } from '@core/store';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of, throwError } from 'rxjs';
import { WORKFLOWSTEPS } from '../../mocks';
import {
  AssignedUser,
  Institution,
  WorkflowConfig,
  WorkflowStep,
} from '../../models';
import { WorkflowState } from '../../store/workflow/reducers/workflow.reducers';
import { WorkflowComponent } from './workflow.component';

const assignedUser: AssignedUser = {
  email: 'email',
  fullName: 'fullName',
  roleIdCode: 'roleIdCode',
  userName: 'userName',
};
const workflowSteps: WorkflowStep[] = WORKFLOWSTEPS;
const workflowInstitutions: Institution[] = [
  {
    institutionCode: 'string',
    loanNumber: 'string',
    operationNumber: 'string',
    instRoleDesc: 'string',
  },
];

const projectWorkflow: WorkflowState = {
  workflowSteps,
  workflowInstitutions,
  workflowStepsLoaded: true,
  workflowStepsLoading: false,
  workflowStepsError: null,
  workflowInstitutionsLoaded: true,
  workflowInstitutionsLoading: false,
  workflowInstitutionsError: null,
  usersInstitutionUpdated: [],
  usersRolUpdated: [],
};

const selectedProject: SelectedProjectState = {
  selectedProject: {
    countryCode: 'PN',
    name: 'Sustainable Rural Electrification Program in Panama',
    nameEs: 'Programa de Electrificación Rural Sostenible en Panama',
    nameFr: '  ',
    namePt: '  ',
    executor: 'Oficina de Electrificacion Rural',
    executorAcronym: 'PN-OER',
    contract: '3166/CH-PN',
    operationNumber: 'PN-L1095',
    approvedAmount: 10000000,
    status: ProjectStatus.Finished,
    projectBucketId: '06a4e7fd-ff7d-44c7-ad23-132ea397fc01',
    id: '5632',
    nameEn: '',
    projectName: {
      en: '',
      es: '',
      fr: '',
      pt: '',
    },
    currentApprovedAmount: 10000000,
    favorite: false,
  },
  loaded: true,
  loading: false,
  error: null,
};

const contact: ContactState = {
  contact: {
    is_internal: null,
    username: '',
    contactId: '',
    email: '',
    family_name: '',
    given_name: '',
    name: '',
  },
  error: '',
  loaded: true,
  loading: false,
};

const initialState = {
  projectWorkflow,
  selectedProject,
  contact,
};

async function setup() {
  const { fixture } = await render(WorkflowComponent, {
    componentProperties: {
      displayWorkflowPermission: [PermissionEnum.VIEW_DISBURSEMENT_INFORMATION],
    },
    schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    imports: [
      MsalTestModule,
      DialogModule,
      DirectivesModule,
      RouterTestingModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    providers: [
      provideMockStore({ initialState }),
      NotificationService,
      provideWindowSizeMock(),
    ],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('WorkflowComponent', () => {
  it('should be created', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('setWorkflowStore', () => {
    it('should call setStoreWorkflow', async () => {
      const { component } = await setup();

      const response = selectedProject;

      jest
        .spyOn(component.projectStoreService, 'selectedProject')
        .mockReturnValue(of(response));

      expect(component.projectBucketId).toEqual(
        response.selectedProject.projectBucketId
      );
    });
  });

  describe('getUserData', () => {
    it('should call getCurrentUser', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.workflowStoreService, 'getCurrentUser')
        .mockReturnValue(of(contact));

      expect(component.contact.fullName).toEqual(contact.contact.family_name);
    });
  });

  describe('onSelectInstitution', () => {
    it('should call getWorkflowAssignedUsers with the institution passed from the parameter', async () => {
      const { component } = await setup();

      const resp = {
        users: [assignedUser],
      };

      const spy = jest
        .spyOn(component.workflowODService, 'getWorkflowAssignedUsers')
        .mockReturnValue(of(resp));

      component.onSelectInstitution('PN-OR');

      expect(spy).toHaveBeenCalled();
    });
  });

  it('should call showErrorToast on error response', async () => {
    const { component } = await setup();

    jest
      .spyOn(component.workflowODService, 'getWorkflowAssignedUsers')
      .mockReturnValue(throwError('error'));

    const errorSpy = jest.spyOn(component, 'showErrorToast');
    component.onSelectInstitution('error');

    expect(errorSpy).toHaveBeenCalled();
  });

  describe('onSaveData', () => {
    it('should call saveWorkflowData', async () => {
      const { component } = await setup();

      const spy = jest
        .spyOn(component.workflowODService, 'updateWorkflow')
        .mockReturnValue(of('response'));

      component.onSaveData(workflowSteps);

      expect(spy).toHaveBeenCalled();
    });

    it('should call showErrorToast on error response', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.workflowODService, 'updateWorkflow')
        .mockReturnValue(throwError('error'));

      const errorSpy = jest.spyOn(component, 'showErrorToast');
      component.onSaveData(workflowSteps);

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('onCreateWorkflow', () => {
    it('should call createWorkflow', async () => {
      const { component } = await setup();

      const res: WorkflowConfig = {
        workFlowConfig: workflowSteps,
      };

      const spy = jest
        .spyOn(component.workflowODService, 'createWorkflow')
        .mockReturnValue(of(res));

      component.onCreateWorkflow();

      expect(spy).toHaveBeenCalled();
    });

    it('should call shoErrorToast on error response', async () => {
      const { component } = await setup();

      jest
        .spyOn(component.workflowODService, 'createWorkflow')
        .mockReturnValue(throwError('error'));

      const errorSpy = jest.spyOn(component, 'showErrorToast');
      component.onCreateWorkflow();

      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
