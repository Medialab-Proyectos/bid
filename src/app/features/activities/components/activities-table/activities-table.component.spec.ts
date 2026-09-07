import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { PipeModule } from '@fiduciary-interface/app/shared';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ActivitiesTableComponent } from './activities-table.component';
import { of } from 'rxjs';
import { ActivitiesActiveObject, Enums, ErrorResponse } from '@core/models';
import { SortDescriptor } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';

const initialState = {
  projects: {
    projects: [
      {
        nameEs: '',
        nameFr: '',
        namePt: '',
        projectBucketId: 'projectBucketId1',
        id: 0,
        currentApprovedAmount: 0,
        favorite: false,
        countryCode: 'CO',
        name: 'Programa de apoyo para la mejora de las trayectorias educativas en zonas rurales focalizadas',
        executor: 'MINISTERIO DE EDUCACION NACIONAL',
        executorAcronym: 'CO-MEN',
        contract: '4902/OC-CO',
        operationNumber: 'CO-L1229',
        approvedAmount: 60000000,
      },
    ],
    loaded: false,
    loading: false,
    error: null,
  },
  contact: {
    contact: {
      username: 'username',
      email: 'email@gmail.com',
      name: 'name',
      given_name: 'given_name',
      family_name: 'family_name',
      is_internal: true,
      contactId: 'contactId',
    },
  },
  activitiesSelectedProjectBucketId: {
    activitiesSelectedProjectBucketId: '11',
    loaded: false,
    loading: false,
    error: null,
  },
};
describe('ActivitiesTableComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('showActivities', () => {
    it('should not set data ', async () => {
      const { component } = await setup();
      const responseMock: ErrorResponse = {};
      jest
        .spyOn(component.activitiesApi, 'getAllActivities')
        .mockReturnValue(of(responseMock));

      const formatDataGridSpy = jest
        .spyOn(component, 'formatDataGrid')
        .mockImplementation();

      const getLiteralStepSpy = jest
        .spyOn(component, 'getLiteralStep')
        .mockImplementation();
      const addPrefixTaskActionSpy = jest
        .spyOn(component, 'addPrefixTaskAction')
        .mockImplementation();

      const groupChangeSpy = jest
        .spyOn(component, 'groupChange')
        .mockImplementation();

      component.showActivities();
      expect(getLiteralStepSpy).not.toHaveBeenCalled();
      expect(addPrefixTaskActionSpy).not.toHaveBeenCalled();

      expect(formatDataGridSpy).not.toHaveBeenCalled();
      expect(groupChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatDataGrid', () => {
    it('should not set data ', async () => {
      const { component } = await setup();
      const data: ActivitiesActiveObject[] = [
        {
          workflowInstanceId: 'workflowInstanceId',
          projectBucketId: 'projectBucketId',
          entityType: 1,
          isInternalVisibility: true,
          createdBy: 'createdBy',
          workflowCode: 'workflowCode',
          externalWorkflowInstance: 'externalWorkflowInstance',
          createdAt: new Date('01-05-2023'),
          lastExecution: null,
          workflowStatus: 'Running',
          entityTypeId: 'entityTypeId',
          Comment: [],
          task: [
            {
              step: 1,
              role: ['role1'],
              roles: 'roles',
              user: 'user',
              action: 'action',
              stepLiteral: 'stepLiteral',
            },
          ],
          operationNumber: 'operationNumber',
          contractNumber: 'contractNumber',
          activityCode: 'activityCode',
          currentStep: 1,
          showDetails: true,
          pendingAction: 1,
        },
      ];
      component.gridPaginate = {
        count: 1,
        from: 1,
        hasNext: false,
        hasPrevious: false,
        index: 1,
        pages: 1,
        size: 1,
      };
      const datePipeSpy = jest.spyOn(component['datePipe'], 'transform');
      const translateSvcSpy = jest.spyOn(
        component['serviceTranslate'],
        'instant'
      );

      component.formatDataGrid(data);
      expect(datePipeSpy).toHaveBeenCalledTimes(data.length * 2);
      expect(translateSvcSpy).toHaveBeenCalledTimes(data.length * 2);
    });
  });

  describe('sortChange', () => {
    it('should sort the data', async () => {
      const { component } = await setup();
      const sort: SortDescriptor[] = [
        {
          field: 'xd',
          dir: 'asc',
        },
      ];
      const spy = jest.spyOn(component, 'showActivities').mockImplementation();
      component.sortChange(sort);
      expect(component.sort).toEqual(sort);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('validateDate', () => {
    it('should return the date', async () => {
      const { component } = await setup();
      const date = '01-01-2023';
      const result = component.validateDate(date);
      expect(result).toEqual(date);
    });
  });

  describe('getState', () => {
    it('should translate ACTIVITIES.STATE.RUNNING', async () => {
      const { component } = await setup();
      const state = 'Running';
      const translatedMsg = 'translated';
      const spy = jest
        .spyOn(component['serviceTranslate'], 'instant')
        .mockReturnValue(translatedMsg);

      const result = component.getState(state);
      expect(spy).toHaveBeenCalledWith('ACTIVITIES.STATE.RUNNING');
      expect(result).toEqual(translatedMsg);
    });
    it('should translate ACTIVITIES.STATE.FINISHED', async () => {
      const { component } = await setup();
      const state = 'Finished';
      const translatedMsg = 'translated';
      const spy = jest
        .spyOn(component['serviceTranslate'], 'instant')
        .mockReturnValue(translatedMsg);

      const result = component.getState(state);
      expect(spy).toHaveBeenCalledWith('ACTIVITIES.STATE.FINISHED');
      expect(result).toEqual(translatedMsg);
    });
    it('should translate ACTIVITIES.STATE.SUSPENDED', async () => {
      const { component } = await setup();
      const state = 'Suspended';
      const translatedMsg = 'translated';
      const spy = jest
        .spyOn(component['serviceTranslate'], 'instant')
        .mockReturnValue(translatedMsg);

      const result = component.getState(state);
      expect(spy).toHaveBeenCalledWith('ACTIVITIES.STATE.SUSPENDED');
      expect(result).toEqual(translatedMsg);
    });
    it('should translate ACTIVITIES.STATE.FAULTED', async () => {
      const { component } = await setup();
      const state = 'Faulted';
      const translatedMsg = 'translated';
      const spy = jest
        .spyOn(component['serviceTranslate'], 'instant')
        .mockReturnValue(translatedMsg);

      const result = component.getState(state);
      expect(spy).toHaveBeenCalledWith('ACTIVITIES.STATE.FAULTED');
      expect(result).toEqual(translatedMsg);
    });
    it('should translate ACTIVITIES.STATE.CANCELLED', async () => {
      const { component } = await setup();
      const state = 'Cancelled';
      const translatedMsg = 'translated';
      const spy = jest
        .spyOn(component['serviceTranslate'], 'instant')
        .mockReturnValue(translatedMsg);

      const result = component.getState(state);
      expect(spy).toHaveBeenCalledWith('ACTIVITIES.STATE.CANCELLED');
      expect(result).toEqual(translatedMsg);
    });
    it('should translate ACTIVITIES.STATE.COMPLETED', async () => {
      const { component } = await setup();
      const state = 'Completed';
      const translatedMsg = 'translated';
      const spy = jest
        .spyOn(component['serviceTranslate'], 'instant')
        .mockReturnValue(translatedMsg);

      const result = component.getState(state);
      expect(spy).toHaveBeenCalledWith('ACTIVITIES.STATE.COMPLETED');
      expect(result).toEqual(translatedMsg);
    });
    it('should return null for default case', async () => {
      const { component } = await setup();
      const state = 'xd';
      const translatedMsg = 'translated';
      const spy = jest
        .spyOn(component['serviceTranslate'], 'instant')
        .mockReturnValue(translatedMsg);

      const result = component.getState(state);
      expect(spy).not.toHaveBeenCalled();
      expect(result).toEqual(' ');
    });
  });

  describe('pageChangeEvent', () => {
    it('should return null for default case', async () => {
      const { component } = await setup();
      const event: PageChangeEvent = {
        skip: 1,
        take: 10,
      };
      const spy = jest.spyOn(component, 'showActivities').mockImplementation();
      component.pageChangeEvent(event);
      expect(component.skip).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('addPrefix', () => {
    it('should translate with activities key', async () => {
      const { component } = await setup();
      component.IS_INTERNAL = true;
      const key = 'KEY-1';
      const translateSpy = jest.spyOn(component['serviceTranslate'], 'instant');
      const result = component.addPrefix(key, true);
      expect(result).toEqual('ACTIVITIES.WORKFLOW.TASK.ACTION.KEY-1');
      expect(translateSpy).toHaveBeenCalled();
    });

    it('should translate with od workflow key', async () => {
      const { component } = await setup();
      component.IS_INTERNAL = true;
      const key = 'KEY-1';

      const translateSpy = jest.spyOn(component['serviceTranslate'], 'instant');
      const result = component.addPrefix(key, false);
      expect(result).toEqual('ACTIVITIES.OD.WORKFLOW.TASK.ACTION.KEY-1');
      expect(translateSpy).toHaveBeenCalled();
    });
  });

  describe('addPrefixTaskAction', () => {
    it('should call checkTasks for every activity', async () => {
      const { component } = await setup();
      const activities: ActivitiesActiveObject[] = [
        {
          workflowInstanceId: 'workflowInstanceId',
          projectBucketId: 'projectBucketId',
          entityType: 1,
          isInternalVisibility: true,
          createdBy: 'createdBy',
          workflowCode: 'workflowCode',
          externalWorkflowInstance: 'externalWorkflowInstance',
          createdAt: new Date('01-05-2023'),
          lastExecution: null,
          workflowStatus: 'Running',
          entityTypeId: 'entityTypeId',
          Comment: [],
          task: [
            {
              step: 1,
              role: ['role1'],
              roles: 'roles',
              user: 'user',
              action: 'action',
              stepLiteral: 'stepLiteral',
            },
          ],
          operationNumber: 'operationNumber',
          contractNumber: 'contractNumber',
          activityCode: 'activityCode',
          currentStep: 1,
          showDetails: true,
          pendingAction: 1,
        },
      ];
      const spy = jest.spyOn(component, 'checkTasks');
      component.addPrefixTaskAction(activities);

      expect(spy).toHaveBeenCalledTimes(activities.length);
    });
  });

  describe('getLiteralStep', () => {
    it('should use workflowSteps enum', async () => {
      const { component } = await setup();
      component.getLiteralStep();

      expect(component.enumSteps).toEqual(Enums.workflowSteps);
      expect(component.enumODSteps).toEqual(
        Enums.onlineDisburmentWorkflowSteps
      );
    });
  });
  describe('getRoles', () => {
    it('should return the correct key for coordinator', async () => {
      const { component } = await setup();
      const roles = ['coordinator'];
      const taskRole = 'TaskRole';
      const result = component.getRoles(roles, taskRole);
      const expectedResult = 'Coordinator';
      expect(result).toEqual(expectedResult);
    });
    it('should return the correct key for disbursement specialist', async () => {
      const { component } = await setup();
      const roles = ['disbursement specialist'];
      const taskRole = 'TaskRole';
      const result = component.getRoles(roles, taskRole);
      const expectedResult = 'Disbursement Specialist';
      expect(result).toEqual(expectedResult);
    });

    it('should return role for other cases', async () => {
      const { component } = await setup();
      const roles = ['ROLE1111'];
      const taskRole = 'TaskRole';
      const result = component.getRoles(roles, taskRole);
      const expectedResult = roles[0];
      expect(result).toEqual(expectedResult);
    });
  });
  describe('redirectInProgress', () => {
    it('should call router navigate', async () => {
      const { component } = await setup();
      const currentStep = 1;
      const dataItem = {
        task: [
          {
            step: 1,
            role: ['role1'],
            roles: 'roles',
            user: 'user',
            action: 'action',
            stepLiteral: 'stepLiteral',
          },
        ],
      };
      const spy = jest.spyOn(component.router, 'navigate');
      component.redirectInProgress(currentStep, dataItem);

      expect(spy).toHaveBeenCalled;
    });

    it('should NOT call router navigate', async () => {
      const { component } = await setup();
      const currentStep = 2;
      const dataItem = {
        task: [
          {
            step: 1,
            role: ['role1'],
            roles: 'roles',
            user: 'user',
            action: 'action',
            stepLiteral: 'stepLiteral',
          },
        ],
      };
      const spy = jest.spyOn(component.router, 'navigate');
      component.redirectInProgress(currentStep, dataItem);

      expect(spy).not.toHaveBeenCalled;
    });
  });

  describe('handleIfShowRedirectAction', () => {
    it('should return false', async () => {
      const { component } = await setup();
      const dataItem = {
        task: [
          {
            step: 1,
            role: ['role1'],
            roles: 'roles',
            user: 'user',
            action: 'action',
            stepLiteral: 'stepLiteral',
            linkTaskAction: null,
          },
        ],
      };
      const result = component.handleIfShowRedirectAction(dataItem);
      expect(result).toEqual(false);
    });

    it('should return true', async () => {
      const { component } = await setup();
      const dataItem = {
        task: [
          {
            step: 1,
            role: ['role1'],
            roles: 'roles',
            user: 'user',
            action: 'action',
            stepLiteral: 'stepLiteral',
            linkTaskAction: 'dsadsa',
          },
        ],
      };
      const result = component.handleIfShowRedirectAction(dataItem);
      expect(result).toEqual(true);
    });
  });
});

async function setup() {
  const { fixture } = await render(ActivitiesTableComponent, {
    imports: [
      PipeModule,
      RouterTestingModule,
      HttpClientTestingModule,
      MsalTestModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    declarations: [ActivitiesTableComponent],
    providers: [DatePipe, provideMockStore({ initialState })],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}
