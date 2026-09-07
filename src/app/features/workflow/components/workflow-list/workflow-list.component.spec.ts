import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogResponse, ModalOptions } from '@core/models';
import {
  DialogReturn,
  DirectivesModule,
  NotificationGlobalService,
  PipeModule,
} from '@fiduciary-interface/app/shared';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of } from 'rxjs';
import { AssignedUser, Institution, WorkflowStep } from '../../models';
import { WorkflowState } from '../../store/workflow/reducers/workflow.reducers';

import { WorkflowListComponent } from './workflow-list.component';

const workflowStep: WorkflowStep[] = [
  {
    assignedUsers: [
      {
        email: 'email',
        fullName: 'fullName',
        roleIdCode: 'roleIdCode',
        userName: 'userName',
      },
    ],
    id: '2',
    institutionCode: 'PN-ORD',
    isMandatory: false,
    lastUpdate: new Date('2020-01-01'),
    order: 2,
    step: 4,
    taskDescription: 'asd',
  },
  {
    assignedUsers: [
      {
        email: 'email',
        fullName: 'fullName',
        roleIdCode: 'roleIdCode',
        userName: 'userName',
      },
    ],
    id: '2',
    institutionCode: 'PN-ORD',
    isMandatory: true,
    lastUpdate: new Date('2020-01-01'),
    order: 1,
    step: 1,
    taskDescription: 'asd',
  },
];

const institution: Institution[] = [
  {
    institutionCode: 'string',
    loanNumber: 'string',
    operationNumber: 'string',
    instRoleDesc: 'string',
  },
];

const projectWorkflow: WorkflowState = {
  workflowSteps: workflowStep,
  workflowInstitutions: institution,
  workflowStepsLoaded: true,
  workflowStepsLoading: false,
  workflowStepsError: null,
  workflowInstitutionsLoaded: true,
  workflowInstitutionsLoading: false,
  workflowInstitutionsError: null,
  usersInstitutionUpdated: [],
  usersRolUpdated: [],
};

const initialState = {
  projectWorkflow: projectWorkflow,
};

const users: AssignedUser[] = [
  {
    email: 'email',
    fullName: 'fullName',
    roleIdCode: 'roleIdCode',
    userName: 'userName',
  },
];

function createFormGroup(dataItem: WorkflowStep): FormGroup {
  return new FormGroup({
    id: new FormControl(dataItem?.id),
    step: new FormControl(
      { value: dataItem?.step, disabled: dataItem.isMandatory },
      Validators.required
    ),
    institutionCode: new FormControl(
      dataItem?.institutionCode,
      Validators.required
    ),
    assignedUsers: new FormControl(
      dataItem?.assignedUsers,
      Validators.required
    ),
    taskDescription: new FormControl(dataItem?.taskDescription ?? ''),
    lastUpdate: new FormControl({
      value: dataItem?.lastUpdate,
      disabled: true,
    }),
  });
}

async function setup() {
  const { fixture } = await render(WorkflowListComponent, {
    componentProperties: {
      formGroup: createFormGroup(workflowStep[0]),
      data: [],
      users: users,
      actions: [],
    },
    imports: [
      MsalTestModule,
      DialogModule,
      DirectivesModule,
      CommonModule,
      HttpClientTestingModule,
      PipeModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    declarations: [WorkflowListComponent],
    providers: [
      IFDatePipe,
      DatePipe,
      provideMockStore({ initialState }),
      NotificationGlobalService,
      NotificationService,
    ],
  });

  const component = fixture.componentInstance;
  return { component, fixture };
}

describe('WorkflowListComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('handleWorkflowStepOrderChange', () => {
    it('should sort by step', async () => {
      const { component } = await setup();

      const unsortedSteps = workflowStep;

      component.handleWorkflowStepOrder(unsortedSteps);
      expect(unsortedSteps[0].step).toEqual(1);
    });
  });

  describe('showErrorToast', () => {
    it('should show error toast', async () => {
      const { component } = await setup();

      const spy = jest
        .spyOn(component.notificationGlobalService, 'showError')
        .mockReturnValue();

      component.showErrorToast('error');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onDeleteRow', () => {
    it('should call deteleRow if result is ACCEPT', async () => {
      const { component } = await setup();

      const mockResponse: DialogResponse = {
        result: ModalOptions.ACCEPT,
        text: '',
        content: '',
      };

      const spy = jest
        .spyOn(component, 'deleteRowModal')
        .mockReturnValue(of(mockResponse));
      component.onDeleteRow(1);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('deleteRowModal', () => {
    it('should call modalService.open', async () => {
      const { component } = await setup();

      const obsItem: DialogReturn = {
        result: ModalOptions.ACCEPT,
        content: '',
        text: '',
      };

      const spy = jest
        .spyOn(component.modalService, 'open')
        .mockReturnValue(of(obsItem));

      component.deleteRowModal();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onSelectInstitution', () => {
    it('should emit selectIntitution', async () => {
      const { component } = await setup();

      const spy = jest.spyOn(component.selectInstitution, 'emit');
      component.onSelectInstitution('1');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('valueChange', () => {
    it('should change assignedUsers new value', async () => {
      const { component } = await setup();

      component.valueChange();
      expect(component.assignedUsers).toEqual(component.oldAssignedUsers);
    });
  });

  describe('handleMenuOptions', () => {
    it('should return menuItems filtered with delete action', async () => {
      const { component, fixture } = await setup();

      const filteredMenuItems = component.handleMenuOptions(workflowStep[0]);
      fixture.detectChanges();
      expect(filteredMenuItems.length).toEqual(2);
    });

    it('should return menuItems not filtered with delete action', async () => {
      const { component, fixture } = await setup();

      const filteredMenuItems = component.handleMenuOptions(workflowStep[1]);
      fixture.detectChanges();
      expect(filteredMenuItems.length).toEqual(1);
    });
  });

  describe('createFormGroup', () => {
    it('should create formGroup', async () => {
      const { component } = await setup();

      const formGroup = component.createFormGroup(workflowStep[0]);
      expect(formGroup).toBeTruthy();
    });
  });
});
