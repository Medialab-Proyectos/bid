import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { DirectivesModule } from '@fiduciary-interface/app/shared';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { provideMockStore } from '@ngrx/store/testing';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ProcessCommentsComponent } from './process-comments.component';
import { BiddingProcessProcurementProcessStatuses } from '@core/enums';

describe('ProcessCommentsComponent', () => {
  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('addNewCommentFormGroup', () => {
    it('should add a new form group to commentsList', async () => {
      const { component } = await setup();
      component.addNewCommentFormGroup();

      expect(component.commentsList.length).toBe(1);
    });
  });
  describe('deleteComment', () => {
    it('should remove a form group to commentsList', async () => {
      const { component, fixture } = await setup();
      component.deleteComment(1);
      fixture.detectChanges();

      expect(component.commentsList.length).toBe(0);
    });
  });
  describe('checkEnterNewCommentVisbility', () => {
    it('should allow external user to enter new comment', async () => {
      const { component } = await setup();

      const isInternal = false;
      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(true);
    });

    it('should not allow internal user to enter new comment when process status is deleted', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus =
        BiddingProcessProcurementProcessStatuses.DELETED;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(false);
    });
    it('should not allow internal user to enter new comment when process status is draft', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus = BiddingProcessProcurementProcessStatuses.DRAFT;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(false);
    });
    it('should not allow internal user to enter new comment when process status is CANCELLED', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus =
        BiddingProcessProcurementProcessStatuses.CANCELLED;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(false);
    });
    it('should not allow internal user to enter new comment when process status is UNSUCCESFUL_PROCESS', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus =
        BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(false);
    });
    it('should not allow internal user to enter new comment when process status is PROCUREMENT_INELIGIBLE', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus =
        BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(false);
    });
    it('should not allow internal user to enter new comment when process status is REJECTION_BIDS', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus =
        BiddingProcessProcurementProcessStatuses.REJECTION_BIDS;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(false);
    });
    it('should not allow internal user to enter new comment when process status is CONTRACT_TERMINATED', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus =
        BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(false);
    });

    it('should allow internal user to enter new comment when process status is PROCESS_ONGOING', async () => {
      const { component } = await setup();

      const isInternal = true;

      component.processStatus =
        BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING;

      component.checkEnterNewCommentVisbility(isInternal);
      expect(component.canEnterNewCommentForInternal).toBe(true);
    });
  });

  describe('compareEmailAndUser', () => {
    it('should disable comments if readonly mode is enabled', async () => {
      const { component } = await setup();

      component.readonly = true;
      component.dataEmail = 'user@example.com';

      const comments = [
        { createdBy: 'user@example.com' },
        { createdBy: 'otheruser@example.com' },
      ];
      component.comments = comments;

      component.compareEmailAndUser();

      expect(component.commentsDisabledBy).toEqual([true, true]);
    });

    it('should disable comments created by different user when readonly mode is disabled', async () => {
      const { component } = await setup();

      component.readonly = false;
      component.dataEmail = 'user@example.com';

      const comments = [
        { createdBy: 'user@example.com' },
        { createdBy: 'otheruser@example.com' },
      ];
      component.comments = comments;

      component.compareEmailAndUser();

      expect(component.commentsDisabledBy).toEqual([false, true]);
    });
  });
});

async function setup() {
  const { fixture } = await render(ProcessCommentsComponent, {
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
    imports: [
      HttpClientTestingModule,
      MsalTestModule,
      DirectivesModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../../../assets/i18n/en.json')
      ).withDefaultLanguage('en'),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    declarations: [ProcessCommentsComponent],
    providers: [provideMockStore({})],
  });
  const component = fixture.componentInstance;
  return { fixture, component };
}
