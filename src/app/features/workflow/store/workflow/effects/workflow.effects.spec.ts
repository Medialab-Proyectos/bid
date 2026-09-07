import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { WorkflowEffects } from './workflow.effects';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import * as workflowAction from '../actions/workflow.actions';
import { WorkflowConfig } from '@fiduciary-interface/app/features/workflow/models';
import { WorkflowODApiService } from '@fiduciary-interface/app/features/workflow/services';
import { WorkflowInstitution } from '@fiduciary-interface/app/features/workflow/models';
const translateServiceMock = {
  instant: jest.fn(),
};
const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
const workflowServiceMock = {
  getWorkflow: jest.fn(),
  resetConfiguration: jest.fn(),
  createWorkflow: jest.fn(),
  getWorkflowActive: jest.fn(),
  getWorkflowData: jest.fn(),
  updateWorkflow: jest.fn(),
  getWorkflowInstitutions: jest.fn(),
  getWorkflowAssignedUsers: jest.fn(),
  getTransactionStatus: jest.fn(),
  getAllWorkflowActive: jest.fn(),
};

describe('WorkflowEffects', () => {
  let effects: WorkflowEffects;
  let actions$: Observable<any>;
  let translateService: TranslateService;
  let notificationGlobalService: NotificationGlobalService;
  let workflowService: WorkflowODApiService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        WorkflowEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        Store,
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
        {
          provide: WorkflowODApiService,
          useValue: workflowServiceMock,
        },
      ],
    });
    effects = TestBed.inject(WorkflowEffects);
    translateService = TestBed.inject(TranslateService);
    notificationGlobalService = TestBed.inject(NotificationGlobalService);
    workflowService = TestBed.inject(WorkflowODApiService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('showErrorToast', () => {
    it('should show error toast with translated message', () => {
      const literal = 'ERROR_MESSAGE_KEY';
      const translatedMsg = 'Translated Message';
      const translateSpy = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(translatedMsg);
      const notificationSpy = jest.spyOn(
        notificationGlobalService,
        'showError'
      );
      effects.showErrorToast(literal);

      expect(translateSpy).toHaveBeenCalledWith(literal);
      expect(notificationSpy).toHaveBeenCalledWith(translatedMsg);
    });
  });

  describe('getWorkflow$', () => {
    it('should dispatch getWorkflowSuccess action with projectWorkflow', () => {
      const projectBucketId = 'bucketId';
      const response: WorkflowConfig = {
        workFlowConfig: [
          {
            id: 'string',
            step: 0,
            institutionCode: 'string',
            order: 0,
            assignedUsers: [
              {
                userName: 'string',
                email: 'string',
                fullName: 'string',
                roleIdCode: 'string',
              },
            ],
            taskDescription: 'string',
            lastUpdate: new Date(),
            isMandatory: false,
          },
        ],
      };
      const action = workflowAction.getWorkflow({ projectBucketId });
      const completion = workflowAction.getWorkflowSuccess({
        projectWorkflow: response,
      });
      const workflowSvsSpy = jest
        .spyOn(workflowService, 'getWorkflow')
        .mockReturnValue(of(response));

      actions$ = of(action);

      return effects.getWorkflow$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(workflowSvsSpy).toHaveBeenCalledWith(projectBucketId);
        expect(notificationGlobalService.showError).not.toHaveBeenCalled();
      });
    });

    it('should dispatch getWorkflowError action with error payload and show error toast', () => {
      const projectBucketId = 'bucketId';
      const error = new Error('Error fetching workflow');
      const translatedErrorMsg = 'Error message';
      const action = workflowAction.getWorkflow({ projectBucketId });
      const completion = workflowAction.getWorkflowError({ payload: error });

      const workflowSvsSpy = jest
        .spyOn(workflowService, 'getWorkflow')
        .mockReturnValue(throwError(error));
      const translateSpy = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(translatedErrorMsg);
      const notificationSpy = jest.spyOn(
        notificationGlobalService,
        'showError'
      );
      actions$ = of(action);

      return effects.getWorkflow$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(workflowSvsSpy).toHaveBeenCalledWith(projectBucketId);
        expect(translateSpy).toHaveBeenCalled();
        expect(notificationSpy).toHaveBeenCalledWith(translatedErrorMsg);
      });
    });
  });

  describe('getWorkflowInstitutions$', () => {
    it('should dispatch getWorkflowInstitutionSuccess action with workflowInstitution', () => {
      const projectBucketId = 'bucketId';
      const response: WorkflowInstitution = {
        institutions: [
          {
            institutionCode: 'institutionCode',
            loanNumber: 'loanNumber',
            operationNumber: 'operationNumber',
            instRoleDesc: 'instRoleDesc',
          },
        ],
      };
      const action = workflowAction.getWorkflowInstitution({ projectBucketId });
      const completion = workflowAction.getWorkflowInstitutionSuccess({
        workflowInstitution: response,
      });
      const workflowSvsSpy = jest
        .spyOn(workflowService, 'getWorkflowInstitutions')
        .mockReturnValue(of(response));

      actions$ = of(action);

      return effects.getWorkflowInstitutions$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(workflowSvsSpy).toHaveBeenCalledWith(projectBucketId);

          expect(notificationGlobalService.showError).not.toHaveBeenCalled();
        });
    });

    it('should dispatch getWorkflowInstitutionError action with error payload and show error toast', () => {
      const projectBucketId = 'bucketId';
      const translatedErrorMsg = 'Error message';
      const error = new Error('Error fetching workflow institutions');
      const action = workflowAction.getWorkflowInstitution({ projectBucketId });
      const completion = workflowAction.getWorkflowInstitutionError({
        payload: error,
      });

      const workflowSvsSpy = jest
        .spyOn(workflowService, 'getWorkflowInstitutions')
        .mockReturnValue(throwError(error));
      const translateSpy = jest
        .spyOn(translateService, 'instant')
        .mockReturnValue(translatedErrorMsg);
      const notificationSpy = jest.spyOn(
        notificationGlobalService,
        'showError'
      );

      actions$ = of(action);

      return effects.getWorkflowInstitutions$
        .toPromise()
        .then((resultAction) => {
          expect(resultAction).toEqual(completion);
          expect(workflowSvsSpy).toHaveBeenCalledWith(projectBucketId);
          expect(translateSpy).toHaveBeenCalled();
          expect(notificationSpy).toHaveBeenCalledWith(translatedErrorMsg);
        });
    });
  });
});
