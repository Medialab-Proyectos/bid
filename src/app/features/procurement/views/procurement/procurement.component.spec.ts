import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  TabStripComponent,
  TabStripTabComponent,
} from '@progress/kendo-angular-layout';
import { ProcurementComponent } from './procurement.component';
import {
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { DirectivesModule, PipeModule } from '@fiduciary-interface/app/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { render } from '@testing-library/angular';
import { provideMockStore } from '@ngrx/store/testing';
import {
  AppState,
  BiddingProcessPlanInitialState,
  BiddingProcessPlanState,
  enumsInitialState,
  SelectedProjectInitialState,
  usrPreferencesInitialState,
} from '@core/store';
import {
  BiddingProcessProcurementProcess,
  BiddingProcesses,
  Enums,
  ItemAction,
  ModalOptions,
} from '@core/models';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  PermissionEnum,
  ProcessActions,
} from '@core/enums';
import { of, throwError } from 'rxjs';
import { NotificationService } from '@progress/kendo-angular-notification';
import {
  ProcurementComment,
  ProcurementCommentGetResponse,
  ProcurementCommentRequest,
} from '@fiduciary-interface/app/shared/components/dialog-comments/models';
import { DecimalPipe } from '@angular/common';
import { MsalTestModule } from '@fiduciary-interface/test/msal-test/msal-test.module';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { TestBed } from '@angular/core/testing';
import { PermissionService } from '@core/services/app/permission/permission.service';
import * as actions from '@core/store/procurement-process-header/actions/procurementProcessHeader.actions';

const mockProcurementProcess: BiddingProcessProcurementProcess = {
  id: 'string',
  biddingProcessPlanId: '',
  category: {
    id: 2,
    name: '',
  },
  procurementMethod: {
    id: 2,
    name: '',
  },
  supervisionMethod: {
    id: 2,
    name: '',
  },
  status: 2,
  goodsReference: 2,
  sustainability: 2,
  code: 'string',
  name: 'string',
  description: 'string',
  justification: 'string',
  bafo: true,
  sepaPeclaId: 'string',
  lots: 2,
  manualId: 'string',
  sustainabilityDescription: 'string',
  subExecutor: 'string',
  advanceMilestone: {
    delayed: true,
    total: 2,
    totalCompleted: 3,
    currentMilestone: null,
  },
  projectAmount: {
    cofinancedAmount: 3,
    estimatedAmount: 2,
    idbAmount: 2,
    localCounterpartAmount: 2,
    costJustification: '3',
  },
  totalAcumulatedAmount: 2,
  componentName: 'string',
  totalComments: 2,
  isMigrated: true,
  packagesUnderReview: true,
  isUpdated: true,
  procurementProcessComments: [],
  order: 4,
};

describe('ProcurementComponent', () => {
  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('checkAnyProcessAsDraft', () => {
    it('should set true anyProcessAsDraft if status is DRAFT', async () => {
      const { component } = await setup();
      component.checkAnyProcessAsDraftOrModified(
        BiddingProcessProcurementProcessStatuses.DRAFT
      );
      expect(component.anyProcessAsDraftOrModified).toBe(true);
    });
    it('should set false anyProcessAsDraft if status is DRAFT', async () => {
      const { component } = await setup();
      component.checkAnyProcessAsDraftOrModified(
        BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED
      );
      expect(component.anyProcessAsDraftOrModified).toBe(false);
    });
  });

  describe('checkIneligibilityOption', () => {
    it('should return true if the category is PROCT_INDCST and has INELIGIBILITYDECLARATIONLEVEL0 permission', async () => {
      const { component, permissionSvc } = await setup();
      jest
        .spyOn(permissionSvc, 'hasPermission')
        .mockImplementation(
          (permission) =>
            permission === PermissionEnum.INELIGIBILITYDECLARATIONLEVEL0
        );

      expect(
        component.checkIneligibilityOption({
          ...mockProcurementProcess,
          packagesUnderReview: false,
        })
      ).toBeTruthy();
    });

    it('should return true if the procurementMethod is PROCT_SRQOI or PROCT_SRMQ and has INELIGIBILITYDECLARATIONLEVEL0 permission', async () => {
      const { component, permissionSvc } = await setup();
      jest
        .spyOn(permissionSvc, 'hasPermission')
        .mockImplementation(
          (permission) =>
            permission === PermissionEnum.INELIGIBILITYDECLARATIONLEVEL0
        );

      expect(
        component.checkIneligibilityOption({
          ...mockProcurementProcess,
          packagesUnderReview: false,
        })
      ).toBeTruthy();
      expect(
        component.checkIneligibilityOption({
          ...mockProcurementProcess,
          packagesUnderReview: false,
        })
      ).toBeTruthy();
    });

    it('should return true if has INELIGIBILITYDECLARATIONLEVEL3 permission regardless of category or procurementMethod', async () => {
      const { component, permissionSvc } = await setup();
      jest
        .spyOn(permissionSvc, 'hasPermission')
        .mockImplementation(
          (permission) =>
            permission === PermissionEnum.INELIGIBILITYDECLARATIONLEVEL3
        );

      expect(
        component.checkIneligibilityOption({
          ...mockProcurementProcess,
          packagesUnderReview: false,
        })
      ).toBeTruthy();
      expect(
        component.checkIneligibilityOption({
          ...mockProcurementProcess,
          packagesUnderReview: false,
        })
      ).toBeTruthy();
    });
  });

  describe('setCurdActions', () => {
    it('output should have DELETE option when status is DRAFT', async () => {
      const { component } = await setup();

      const expectedOutput: ProcessActions[] = [
        ProcessActions.delete,
        ProcessActions.edit,
        ProcessActions.replicate,
      ];

      const crudActions = component.setCurdActions(
        {
          ...mockProcurementProcess,
          status: BiddingProcessProcurementProcessStatuses.DRAFT,
        },
        BiddingProcessPlanStatus.DRAFT
      );

      expect(crudActions).toEqual(expectedOutput);
    });

    it('output should have CANCEL and EDIT option when status is EXPECTED', async () => {
      const { component } = await setup();

      const expectedOutput: ProcessActions[] = [
        ProcessActions.addComment,
        ProcessActions.edit,
        ProcessActions.replicate,
      ];

      const crudActions = component.setCurdActions(
        {
          ...mockProcurementProcess,
          status: BiddingProcessProcurementProcessStatuses.EXPECTED,
        },
        BiddingProcessPlanStatus.DRAFT
      );

      expect(crudActions).toEqual(expectedOutput);
    });
  });

  describe('navigateToCreateProcessForm', () => {
    it('call router navigation', async () => {
      const { component } = await setup();

      const navigationSpy = jest
        .spyOn(component.route, 'navigate')
        .mockImplementation();
      component.navigateToCreateProcessForm();

      expect(navigationSpy).toHaveBeenCalled();
    });
  });

  describe('navigateToUpdateForm', () => {
    it('call router navigation', async () => {
      const { component } = await setup();

      const id = 'id';
      const navigationSpy = jest
        .spyOn(component.route, 'navigate')
        .mockImplementation();

      component.navigateToUpdateForm(id);

      expect(navigationSpy).toHaveBeenCalled();
    });
  });

  describe('actionitemID', () => {
    it('should dispatch set focusCommet action', async () => {
      const { component } = await setup();
      const item: ItemAction<ProcessActions> = {
        action: ProcessActions.addComment,
        id: '1',
      };
      const spy = jest.spyOn(component.store, 'dispatch');
      const navigationSpy = jest
        .spyOn(component.route, 'navigate')
        .mockImplementation();
      component.actionitemID(item);

      const action = actions.setFocusComments({ FocusComments: true });
      expect(spy).toHaveBeenCalledWith(action);
      expect(navigationSpy).toHaveBeenCalled();
    });
    it('should call navigateToReplicateForm', async () => {
      const { component } = await setup();
      const item: ItemAction<ProcessActions> = {
        action: ProcessActions.replicate,
        id: '1',
      };
      const spy = jest
        .spyOn(component, 'navigateToReplicateForm')
        .mockImplementation();
      component.actionitemID(item);

      expect(spy).toHaveBeenCalledWith(item.id);
    });

    it('call removeProcessAction', async () => {
      const { component } = await setup();

      const item: ItemAction<ProcessActions> = {
        action: ProcessActions.delete,
        id: '1',
      };

      const deleteSpy = jest
        .spyOn(component.biddingProcessPlanStore, 'removeProcessAction')
        .mockImplementation();

      component.actionitemID(item);

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should call navigateToUpdateForm', async () => {
      const { component } = await setup();

      const item: ItemAction<ProcessActions> = {
        action: ProcessActions.edit,
        id: '1',
      };

      const navigationSpy = jest
        .spyOn(component.route, 'navigate')
        .mockImplementation();

      component.actionitemID(item);

      expect(navigationSpy).toHaveBeenCalled();
    });
    it('should call ineligibilityProcessAction', async () => {
      const { component } = await setup();

      const item: ItemAction<ProcessActions> = {
        action: ProcessActions.ineligibility,
        id: '1',
      };
      const obsItem = {
        result: ModalOptions.ACCEPT,
        comments: { comment: 'Test comment' },
      };

      const modalSpy = jest
        .spyOn(component.fiModalSvc, 'openDialogWithComments')
        .mockReturnValue(of(obsItem));

      const storeSpy = jest
        .spyOn(component.biddingProcessPlanStore, 'ineligibilityProcessAction')
        .mockImplementation();

      component.actionitemID(item);

      expect(modalSpy).toHaveBeenCalled();
      expect(storeSpy).toHaveBeenCalledWith('Test comment', item.id);
    });
  });

  describe('showErrorMsg', () => {
    it('should show error msg toast', async () => {
      const { component } = await setup();
      const msg = 'error';
      const toastSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();
      component.showErrorMsg(msg);

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('showSuccessMsg', () => {
    it('should show success msg toast', async () => {
      const { component } = await setup();

      const toastSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showSuccess')
        .mockReturnValue();
      component.showSuccessMsg();

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('openCommentsModalLogic', () => {
    it('should fill comments list with the comments of the service get comments', async () => {
      const { component, fixture } = await setup();

      const comments: ProcurementCommentGetResponse = {
        parentId: '1',
        comments: [
          {
            created: new Date(),
            createdBy: 'user',
            id: '1',
            source: 0,
            status: 0,
            text: 'text',
            visibility: 0,
          },
        ],
      };

      jest
        .spyOn(component.commentsSvc, 'getComments')
        .mockReturnValue(of(comments));
      component.openCommentsModalLogic();

      fixture.detectChanges();

      expect(component.commentsList).toEqual(comments.comments);
    });

    it('should show error msg toast when comments service return error', async () => {
      const { component, fixture } = await setup();

      const error = 'error';
      jest
        .spyOn(component.commentsSvc, 'getComments')
        .mockReturnValue(throwError(error));
      const toastSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();
      component.openCommentsModalLogic();

      fixture.detectChanges();

      expect(toastSpy).toHaveBeenCalled();
    });
  });

  describe('dialogWithCommentsModal', () => {
    it('should haveBeenCalled', async () => {
      const { component } = await setup();
      const obsItem = {
        result: ModalOptions.ACCEPT,
      };

      const spy = jest
        .spyOn(component.fiModalSvc, 'openDialogWithComments')
        .mockReturnValue(of(obsItem));

      component.dialogWithCommentsModal(
        'TEST.INELIGIBILITY.TITLE',
        'TEST.INELIGIBILITY.SUBMIT',
        'TEST.INELIGIBILITY.CANCEL',
        'TEST.INELIGIBILITY.CONTENT1',
        'TEST.INELIGIBILITY.CONTENT2'
      );

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('requestOfficialReview', () => {
    it('should haveBeenCalled', async () => {
      const { component } = await setup();
      const obsItem = {
        result: ModalOptions.ACCEPT,
      };

      const spy = jest
        .spyOn(component.fiModalSvc, 'open')
        .mockReturnValue(of(obsItem));
      component.requestOfficialReview();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('sortCommentsByDate', () => {
    it('should sort dates boy date', async () => {
      const { component } = await setup();
      let comments: ProcurementComment[] = [
        {
          created: new Date('2022-12-30T03:00:00'),
          createdBy: 'user',
          id: '2',
          source: 0,
          status: 0,
          text: 'text',
          visibility: 0,
        },
        {
          created: new Date('2021-12-30T03:00:00'),
          createdBy: 'user',
          id: '1',
          source: 0,
          status: 0,
          text: 'text',
          visibility: 0,
        },
      ];

      comments = component.sortCommentsByDate(comments);

      expect(comments[0].id).toEqual('1');
    });
  });

  describe('sortProcurementPlanByCode', () => {
    it('should sort procurement plan by code', async () => {
      const { component } = await setup();
      let procurementPlans: BiddingProcesses[] = procurementPlanCollection;

      procurementPlans = component.sortProcurementPlanByCode(procurementPlans);

      expect(procurementPlans[0].code).toEqual('1');
    });
  });

  describe('postComment service', () => {
    it('should haveBeenCalled', async () => {
      const { component } = await setup();

      const comment: ProcurementCommentRequest[] = [
        {
          text: 'text',
          visibility: 0,
        },
      ];

      const response = 'id';

      const spy = jest
        .spyOn(component.commentsSvc, 'postComments')
        .mockReturnValue(of(response));

      component.postComment(comment);

      const toastSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showSuccess')
        .mockReturnValue();
      component.showSuccessMsg();

      expect(toastSpy).toHaveBeenCalled();

      expect(spy).toHaveBeenCalled();
      expect(toastSpy).toHaveBeenCalled();
    });

    it('should show error msg toast when comments service return error', async () => {
      const { component } = await setup();
      const comment: ProcurementCommentRequest[] = [
        {
          text: 'text',
          visibility: 0,
        },
      ];
      const error = 'error';
      jest
        .spyOn(component.commentsSvc, 'postComments')
        .mockReturnValue(throwError(error));
      const toastSpy = jest
        .spyOn(component.notificationGlobalSvc, 'showError')
        .mockReturnValue();
      component.postComment(comment);

      expect(toastSpy).toHaveBeenCalled();
    });
    describe('saveDocument', () => {
      it('should call the file saver service with the correct arguments', async () => {
        const { component } = await setup();
        const mockRes = new ArrayBuffer(10);
        const mockDocName = 'example.doc';
        const fileSaverSpy = jest
          .spyOn(component.fileSaverService, 'save')
          .mockReturnValue();
        component.saveDocument(mockRes, mockDocName);
        expect(fileSaverSpy).toHaveBeenCalledWith(
          new Blob([new Uint8Array(mockRes).buffer]),
          mockDocName
        );
      });
    });
    describe('downloadRawData', () => {
      it('should call downloadRawData and saveDocument', async () => {
        const { component } = await setup();
        component.procurementId = 'example';
        const mockRes = { body: new ArrayBuffer(10) };
        jest
          .spyOn(component.procurementDownload, 'downloadRawData')
          .mockReturnValue(of(mockRes));
        const saveDocSpy = jest.spyOn(component, 'saveDocument');

        component.downloadRawData();
        expect(
          component.procurementDownload.downloadRawData
        ).toHaveBeenCalled();
        expect(saveDocSpy).toHaveBeenCalled();
      });

      it('should show error notification when downloadRawData fails', async () => {
        const { component } = await setup();
        const errorMessage =
          'The raw data has an error to download the information';
        const saveDocSpy = jest.spyOn(component, 'saveDocument');
        jest
          .spyOn(component.procurementDownload, 'downloadRawData')
          .mockReturnValue(throwError(errorMessage));
        const showErrorMock = jest.spyOn(
          component.notificationGlobalSvc,
          'showError'
        );
        component.downloadRawData();

        expect(showErrorMock).toHaveBeenCalledWith(errorMessage);
        expect(saveDocSpy).not.toHaveBeenCalled();
      });
    });
    describe('setBiddingPlan', () => {
      it('should set bidding process plans', async () => {
        const { component } = await setup();
        const biddingPlanState: BiddingProcessPlanState = {
          ...biddingProcessPlanState,
        };
        const translateEnumSpy = jest
          .spyOn(component['translateEnum'], 'getEnumByNumber')
          .mockReturnValue({
            id: 1,
            name: 'name1',
          });
        const translateSpy = jest
          .spyOn(component['translate'], 'instant')
          .mockReturnValue('translated');
        const sortProcurementPlanByCodeSpy = jest.spyOn(
          component,
          'sortProcurementPlanByCode'
        );
        component.setBiddingPlan(biddingPlanState);

        const expectedProcurementPlanCollection = [
          {
            id: '49a2f749-2ed1-4fa3-8ebc-0abbf707a9fc',
            isMigrated: false,
            packagesUnderReview: false,
            isUpdated: true,
            name: 'CFI-6759-8',
            manualId: '',
            sustainabilityDescription: '',
            deliverables: [],
            code: 'PN-L1095-P00127',
            advanceMilestone: {
              totalCompleted: 1,
              total: 10,
              delayed: true,
              currentMilestone: {
                id: 'id',
                biddingProcessProcurementProcessId:
                  'biddingProcessProcurementProcessId',
                status: 1,
                code: 5,
                order: 3,
                estimatedDate: null,
                reEstimateDate: null,
                actualDate: null,
              },
            },
            justification: '',
            subExecutor: '',
            projectAmount: {
              estimatedAmount: 666,
              localCounterpartAmount: 222,
              idbAmount: 222,
              cofinancedAmount: 222,
              costJustification: null,
            },
            totalAcumulatedAmount: 0,
            estimatedAmountString: '666.00',
            componentName: 'Componente 1. Electrificación rural en red',
            status: 7,
            totalComments: 0,
            statusEnum: { id: 1, name: 'name1' },
            crudActions: [
              'PROCUREMENT.PROCESS.OPTIONS.CANCEL',
              'PROCUREMENT.PROCESS.OPTIONS.ADD_COMMENT',
              'PROCUREMENT.PROCESS.OPTIONS.EDIT',
              'PROCUREMENT.PROCESS.OPTIONS.REPLICATE',
            ],
            categoryEnum: { id: 1, name: 'name1' },
            procurementMethodEnum: { id: 1, name: 'name1' },
            supervisionMethodEnum: { id: 1, name: 'name1' },
            supervisionMethod: { name: 'ExPost', id: 1 },
            category: { name: 'PROCT_WORKS', id: 5 },
            procurementMethod: { name: 'PROCT_CBSSTEWP', id: 79 },
            isNotExante: true,
            statusTranslation: 'translated',
            categoryTranslation: 'translated',
            procurementMethodTranslation: 'translated',
            supervisionMethodTranslation: 'translated',
            milestonesDelayed: 'translated',
            currentMilestone: 'translated',
            order: 5,
          },
        ];

        expect(component.procurementId).toEqual(
          biddingPlanState.biddingProcessPlan.id
        );
        expect(translateEnumSpy).toHaveBeenCalledTimes(5);
        expect(translateSpy).toHaveBeenCalledTimes(7);
        expect(component.procurementPlanCollection).toEqual(
          expectedProcurementPlanCollection
        );
        expect(sortProcurementPlanByCodeSpy).toHaveBeenCalledWith(
          expectedProcurementPlanCollection
        );
        expect(component.delayedMilestones).toEqual(1);
      });
    });
    describe('navigateToReplicateForm', () => {
      it('call router navigation', async () => {
        const { component } = await setup();
        const processId = 'processId1';
        const navigationSpy = jest
          .spyOn(component.route, 'navigate')
          .mockImplementation();
        component.navigateToReplicateForm(processId);

        expect(navigationSpy).toHaveBeenCalled();
      });
    });

    describe('showAddCommentOption', () => {
      it('should return true if is internal and the status is in the array can see the opt', async () => {
        const { component } = await setup();
        const status = BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING;
        component.isInternal = true;
        const result = component.showAddCommentOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(true);
      });

      it('should return true if is internal and the status is in the array can NOT see the opt', async () => {
        const { component } = await setup();
        const status = BiddingProcessProcurementProcessStatuses.DRAFT;
        component.isInternal = true;
        const result = component.showAddCommentOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(false);
      });

      it('should return false if is external and for the status is UNDER_REVIEW ', async () => {
        const { component } = await setup();
        const status = BiddingProcessProcurementProcessStatuses.UNDER_REVIEW;
        component.isInternal = false;
        const result = component.showAddCommentOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(false);
      });
      it('should return false if is external and for the status is UNDER_REVIEW_MODIFIED ', async () => {
        const { component } = await setup();
        const status =
          BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED;
        component.isInternal = false;
        const result = component.showAddCommentOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(false);
      });

      it('should return true if is external and for the status is NOT UNDER_REVIEW_MODIFIED or UNDER_REVIEW', async () => {
        const { component } = await setup();
        const status = BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING;
        component.isInternal = false;
        const result = component.showAddCommentOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(true);
      });
    });

    describe('showEditOption', () => {
      it('should return false if is internal', async () => {
        const { component } = await setup();
        const status = BiddingProcessProcurementProcessStatuses.PROCESS_ONGOING;
        component.isInternal = true;
        const result = component.showEditOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(false);
      });

      it('should return true if is external  and the status is in the array can  see the opt', async () => {
        const { component } = await setup();
        const status = BiddingProcessProcurementProcessStatuses.DRAFT;
        component.isInternal = false;
        const result = component.showEditOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(true);
      });

      it('should return false if is external and the status is in the array can NOT see the opt', async () => {
        const { component } = await setup();
        const status = BiddingProcessProcurementProcessStatuses.UNDER_REVIEW;
        component.isInternal = false;
        const result = component.showEditOption(
          status,
          BiddingProcessPlanStatus.DRAFT
        );
        expect(result).toEqual(false);
      });
    });

    describe('cleanComments', () => {
      it('should return empty array', async () => {
        const { component } = await setup();
        const comments: ProcurementCommentRequest[] = [
          {
            text: '',
            visibility: 1,
            id: 'id1',
          },
        ];
        const result = component.cleanComments(comments);
        expect(result).toEqual([]);
      });

      it('should return comments', async () => {
        const { component } = await setup();
        const comments: ProcurementCommentRequest[] = [
          {
            text: 'asdasd',
            visibility: 1,
            id: 'id1',
          },
        ];
        const result = component.cleanComments(comments);
        expect(result).toEqual(comments);
      });
    });
  });
});

async function setup() {
  let permissionSvc: PermissionService;
  const { fixture } = await render(ProcurementComponent, {
    componentProperties: {
      processPlan: {
        approvedBy: 'user',
        approvedDate: '2021-12-29T03:00:00',
        id: '1',
        projectBucketId: '1',
        status: 0,
        version: 0,
      },
    },
    declarations: [
      ProcurementComponent,
      TabStripComponent,
      TabStripTabComponent,
    ],
    imports: [
      MsalTestModule,
      DialogModule,
      PipeModule,
      DirectivesModule,
      NoopAnimationsModule,
      RouterTestingModule.withRoutes([]),
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations(
        'en',
        require('../../../../../assets/i18n/en.json')
      ),
      PipeModule,
    ],
    providers: [
      DecimalPipe,
      { provide: 'windowObject', useValue: window },
      ChangeDetectorRef,
      TranslatePipe,
      NotificationService,
      IfNumberPipe,
      provideMockStore({ initialState }),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });

  const component = fixture.componentInstance;

  permissionSvc = TestBed.inject(PermissionService);
  return {
    component,
    fixture,
    permissionSvc,
  };
}

const enumState = { ...enumsInitialState };
enumState.enumsLoading = {
  [Enums.biddingProcessProcurementProcessStatuses]: false,
  [Enums.biddingProcessPlanStatuses]: false,
  [Enums.biddingProcessProcurementProcessCategories]: false,
  [Enums.biddingProcessProcurementProcessSupervisionMethods]: false,
  [Enums.biddingProcessProcurementProcessProcurementMethods]: false,
};
enumState.biddingProcessPlanStatuses = [
  {
    id: 1,
    name: 'ENUM.PROCUREMENT.STATUS.DRAFT',
  },
];
enumState.biddingProcessProcurementProcessStatuses = [
  {
    id: 1,
    name: 'FI.CNVG.FP.ENUM.PROCUREMENT.PROCESS.STATUS.CANCELLED',
  },
];

enumState.biddingProcessProcurementProcessCategories = [
  {
    id: 1,
    name: 'PROCUREMENT.CATEGORIES.PROCT_EXT_AUDIT',
  },
];
enumState.biddingProcessProcurementProcessSupervisionMethods = [
  {
    id: 1,
    name: 'PROCUREMENT.SUPERVISION_METHOD.ExPost',
  },
];
enumState.biddingProcessProcurementProcessProcurementMethods = [
  {
    id: 1,
    name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCT_ICBWP',
  },
];

const projectBucketId = '1235678';
const selectedProjectState = { ...SelectedProjectInitialState };
selectedProjectState.loading = false;
selectedProjectState.selectedProject = {
  name: 'name',
  nameEs: 'nameES',
  nameFr: 'nameFR',
  namePt: 'namePT',
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
  userToken: null,
  preferences: usrPreferencesInitialState,
};

const procurementPlanCollection: BiddingProcesses[] = [
  {
    id: 'processId1',
    isMigrated: true,
    packagesUnderReview: true,
    name: 'Uno',
    description: 'string',
    category: {
      id: 1,
      name: 'string',
    },
    categoryEnum: {
      id: 0,
      name: 'string',
    },
    procurementMethod: {
      id: 1,
      name: 'string',
    },
    procurementMethodEnum: {
      id: 0,
      name: 'string',
    },
    supervisionMethod: {
      id: 1,
      name: 'string',
    },
    supervisionMethodEnum: {
      id: 0,
      name: 'string',
    },
    justification: 'string',
    status: BiddingProcessProcurementProcessStatuses.DRAFT,
    statusEnum: {
      id: 0,
      name: 'string',
    },
    bafo: 'string',
    lots: 0,
    manualId: 'string',
    sepaId: 'string',
    goodReference: 'string',
    processStartDate: 'string',
    contractSignedDate: 'string',
    destination: 'string',
    sustainabilityDescription: 'string',
    sustainability: 'string',
    components: 'string',
    outputs: [],
    deliverables: [],
    biddingMilestones: [],
    comments: [],
    componentHistories: [],
    documentPackages: [],
    created: 'string',
    createdBy: 'string',
    modified: 'string',
    modifiedBy: 'string',
    totalAmount: 0,
    code: '1',
    totalComments: 0,
    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    subExecutor: 'string',
    projectAmount: {
      cofinancedAmount: 0,
      localCounterpartAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      costJustification: 'string',
    },
    componentName: 'string',
    crudActions: ['string'],
    progress: 'string',
    isUpdated: true,
    milestonesDelayed: 'string',
    marked: false,
    order: 4,
  },
  {
    id: 'processId2',
    name: 'Dos',
    description: 'string',
    category: {
      id: 1,
      name: 'string',
    },
    categoryEnum: {
      id: 0,
      name: 'string',
    },
    procurementMethod: {
      id: 1,
      name: 'string',
    },
    procurementMethodEnum: {
      id: 1,
      name: 'string',
    },
    supervisionMethod: {
      id: 1,
      name: 'string',
    },
    supervisionMethodEnum: {
      id: 0,
      name: 'string',
    },
    justification: 'string',
    status: BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION,
    statusEnum: {
      id: 0,
      name: 'string',
    },
    bafo: 'string',
    lots: 0,
    manualId: 'string',
    sepaId: 'string',
    goodReference: 'string',
    processStartDate: 'string',
    contractSignedDate: 'string',
    destination: 'string',
    sustainabilityDescription: 'string',
    sustainability: 'string',
    components: 'string',
    outputs: [],
    deliverables: [],
    biddingMilestones: [],
    comments: [],
    componentHistories: [],
    documentPackages: [],
    created: 'string',
    createdBy: 'string',
    modified: 'string',
    modifiedBy: 'string',
    totalAmount: 0,
    code: '2',
    totalComments: 0,
    isMigrated: true,
    packagesUnderReview: true,
    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    subExecutor: 'string',
    projectAmount: {
      cofinancedAmount: 0,
      localCounterpartAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      costJustification: 'string',
    },
    componentName: 'string',
    crudActions: ['string'],
    progress: 'string',
    isUpdated: true,
    milestonesDelayed: 'string',
    marked: false,
    order: 5,
  },
];

const biddingProcessPlanState: BiddingProcessPlanState = {
  biddingProcessPlan: {
    id: 'id',
    projectBucketId: 'projectBucketId',
    version: 1,
    status: 1,
    approvedDate: '10-10-2023',
    approvedBy: 'approvedBy',
  },
  biddingProcessProcurementProcesses: [
    {
      isMigrated: false,
      packagesUnderReview: false,
      biddingProcessPlanId: 'b4952feb-3947-4d10-bd3c-923d4adbbbd7',
      code: 'PN-L1095-P00127',
      description: 'CFI-6759-8',
      totalAcumulatedAmount: 0,
      sustainabilityDescription: '',
      totalComments: 0,
      advanceMilestone: {
        totalCompleted: 1,
        total: 10,
        delayed: true,
        currentMilestone: {
          id: 'id',
          biddingProcessProcurementProcessId:
            'biddingProcessProcurementProcessId',
          status: 1,
          code: 5,
          order: 3,
          estimatedDate: null,
          reEstimateDate: null,
          actualDate: null,
        },
      },
      componentName: 'Componente 1. Electrificación rural en red',
      bafo: null,
      sepaPeclaId: '',
      lots: null,
      category: {
        name: 'PROCT_WORKS',
        id: 5,
      },
      procurementMethod: {
        name: 'PROCT_CBSSTEWP',
        id: 79,
      },
      supervisionMethod: {
        name: 'ExPost',
        id: 1,
      },
      status: 7,
      sustainability: null,
      goodsReference: null,
      id: '49a2f749-2ed1-4fa3-8ebc-0abbf707a9fc',
      manualId: '',
      name: 'CFI-6759-8',
      projectAmount: {
        estimatedAmount: 666,
        localCounterpartAmount: 222,
        idbAmount: 222,
        cofinancedAmount: 222,
        costJustification: null,
      },
      subExecutor: '',
      justification: '',
      isUpdated: true,
      procurementProcessComments: [],
      order: 5,
    },
  ],
  error: null,
  isSelectedProcessLoaded: true,
  isSelectedProcessLoading: false,
  loaded: false,
  loading: false,
  processScreenLoaded: false,
  processScreenLoading: false,
  loadingProcess: false,
  selectedBiddingProcessProcurementProcess: {
    biddingProcessPlanId: 'bb309ef8-5192-4c47-99c8-39ca201a86f3',
    code: 'EC-L1245-P0001',
    description: 'ICB TEST 1 Normal',
    sustainabilityDescription: '',
    totalComments: 0,
    totalAcumulatedAmount: 0,
    advanceMilestone: {
      totalCompleted: 0,
      total: 0,
      delayed: false,
      currentMilestone: null,
    },
    componentName: '',
    bafo: null,
    sepaPeclaId: '',
    lots: 0,
    category: {
      name: 'PROCT_GOODS',
      id: 2,
    },
    procurementMethod: {
      name: 'PROCT_ICB',
      id: 0,
    },
    supervisionMethod: {
      name: 'ExAnte',
      id: 0,
    },
    status: 7,
    sustainability: null,
    goodsReference: 0,
    id: '223647d9-37fe-4c9d-99a3-31a8052d1d29',
    manualId: '',
    name: 'ICB TEST 1 Normal',
    projectAmount: {
      estimatedAmount: 3000,
      localCounterpartAmount: 0,
      idbAmount: 3000,
      cofinancedAmount: 0,
      costJustification: '',
    },
    subExecutor: '',
    justification: '',
    isMigrated: false,
    packagesUnderReview: false,
    isUpdated: true,
    procurementProcessComments: [],
    order: 5,
  },
  selectedFilterForBiddingProcess: null,
  filteredBiddingProcessProcurementProcesses: [],
};
