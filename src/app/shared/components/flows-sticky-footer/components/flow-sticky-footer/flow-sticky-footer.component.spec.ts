import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { NotificationService } from '@progress/kendo-angular-notification';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';

import { FlowStickyFooterComponent } from './flow-sticky-footer.component';
import { WorkflowButtonAction } from '../../models';
import { WorkflowCommentStatusEnum, WorkflowIdEntityType } from '@core/enums';
import { TestBed } from '@angular/core/testing';
import { WorkflowSharedService } from '../../services';

describe('FlowStickyFooterComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  describe('triggerAction', () => {
    it('should call triggerAction method with the correct parameters when checkMandatoryComment is true', async () => {
      const { component, workflowSharedSvc } = await setup();

      const button: WorkflowButtonAction = {
        id: 1,
        text: 'text',
        order: 1,
        idEntityType: WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT,
        mandatoryComment: true,
        mandatoryMFA: false,
        body: {
          projectBucketId: 'projectBucketId',
          instAcronym: 'instAcronym',
          roleId: 'roleId',
          workflowInstanceId: 'workflowInstanceId',
          actionSelected: 'actionSelected',
        },
        loading: false,
      };
      component['checkMandatoryComment'] = jest.fn().mockReturnValue(true);
      component['commentText'] = 'Example comment';
      const triggerActionSpy = jest
        .spyOn(workflowSharedSvc, 'triggerAction')
        .mockReturnValue();

      component.triggerAction(button);

      expect(triggerActionSpy).toHaveBeenCalledWith(
        {
          ...button,
          body: {
            ...button.body,
            workflowComment: {
              text: component['commentText'],
              visibility: true,
              status: WorkflowCommentStatusEnum.COMPLETED,
            },
          },
        },
        component['selectedLanguage'],
        component['workflowModuleEnum']
      );
    });

    it('should not call triggerAction method when checkMandatoryComment is false', async () => {
      const { component, workflowSharedSvc } = await setup();

      const button: WorkflowButtonAction = {
        id: 1,
        text: 'text',
        order: 1,
        idEntityType: WorkflowIdEntityType.BIDDING_CONTRACT_AMENDMENT,
        mandatoryComment: true,
        mandatoryMFA: false,
        body: {
          projectBucketId: 'projectBucketId',
          instAcronym: 'instAcronym',
          roleId: 'roleId',
          workflowInstanceId: 'workflowInstanceId',
          actionSelected: 'actionSelected',
        },
        loading: false,
      };
      const triggerActionSpy = jest
        .spyOn(workflowSharedSvc, 'triggerAction')
        .mockReturnValue();
      component['checkMandatoryComment'] = jest.fn().mockReturnValue(false);

      component.triggerAction(button);

      expect(triggerActionSpy).not.toHaveBeenCalled();
    });
  });
});

async function setup() {
  let workflowSharedSvc: WorkflowSharedService;

  const { fixture } = await render(FlowStickyFooterComponent, {
    declarations: [FlowStickyFooterComponent],
    imports: [
      MsalTestModule,
      DialogModule,
      HttpClientTestingModule,
      RouterTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [provideMockStore({}), NotificationService],
  });
  const component = fixture.componentInstance;
  workflowSharedSvc = TestBed.inject(WorkflowSharedService);
  return { component, fixture, workflowSharedSvc };
}
