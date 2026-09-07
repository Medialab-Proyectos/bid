import { ProcessMonitoringComponent } from './process-monitoring.component';
import { render } from '@testing-library/angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { VisibilityService } from '@core/services/view';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { BiddingProcessPlanStoreService } from '@core/services/store-services/';
import { BiddingProcessPlanService } from '@core/services/apis';
import { ModalService } from '@fiduciary-interface/app/shared/services/modal.service';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { CommentsService } from '@fiduciary-interface/app/shared/components/dialog-comments/services/comments.service';
import {
  ProjectStoreService,
  EnumsStoreService,
} from '@core/services/store-services/';
import { Store } from '@ngrx/store';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { ProcurementDownloadService } from '../../../../services/procurement-download.service';
import { FileSaverService } from 'ngx-filesaver';
import { PopupNotificationService } from '@fiduciary-interface/app/shared/services/popup.service';
import { NotificationsService } from '@fiduciary-interface/app/shared/services/notifications.service';
import { DelayedMilestoneEventBusService } from '../../../../services/delayed-milestone-event-bus.service';
import { FilteredProcurementProcessService } from '../../../../services/filtered-procurement-process.service';
import { of, Subject } from 'rxjs';
import {
  BiddingProcessPlanStatus,
  BiddingProcessProcurementProcessStatuses,
  DelayedMilestoneTableTypeEnum,
} from '@core/enums';

describe('ProcessMonitoringComponent', () => {
  const mockEnums = {
    biddingProcessProcurementProcessStatuses: [
      { id: 0, name: 'Draft' },
      { id: 1, name: 'Expected' },
    ],
    biddingProcessPlanStatuses: [
      { id: 0, name: 'Draft' },
      { id: 1, name: 'Active' },
    ],
    biddingProcessProcurementProcessCategories: [
      { id: 1, name: 'Goods' },
      { id: 2, name: 'Works' },
    ],
    biddingProcessProcurementProcessSupervisionMethods: [
      { id: 0, name: 'Ex-ante' },
      { id: 1, name: 'Ex-post' },
    ],
    biddingProcessProcurementProcessProcurementMethods: [
      { id: 1, name: 'ICB' },
      { id: 2, name: 'NCB' },
    ],
    biddingProcessMilestoneCodes: [
      { id: 1, name: 'CHK_MI_SPN' },
      { id: 2, name: 'CHK_MI_BD' },
    ],
    commentVisibilities: [
      { id: 0, name: 'Internal' },
      { id: 1, name: 'External' },
    ],
  };

  const mockBiddingProcessPlan = {
    id: 'plan-123',
    status: BiddingProcessPlanStatus.DRAFT,
  };

  const mockBiddingProcesses = [
    {
      id: 'process-1',
      isMigrated: false,
      packagesUnderReview: false,
      isUpdated: false,
      name: 'Process 1',
      manualId: 'P001',
      sustainabilityDescription: 'Sustainability',
      code: 'CODE001',
      advanceMilestone: {
        delayed: false,
        currentMilestone: { code: 'CHK_MI_SPN' },
      },
      justification: 'Just',
      subExecutor: 'Sub',
      projectAmount: { estimatedAmount: 100000 },
      totalAcumulatedAmount: 50000,
      componentName: 'Component',
      status: BiddingProcessProcurementProcessStatuses.EXPECTED,
      totalComments: 5,
      category: { id: 1, name: 'Goods' },
      procurementMethod: { id: 1, name: 'ICB' },
      supervisionMethod: { id: 0, name: 'Ex-ante' },
      order: 1,
    },
  ];

  const mockProject = {
    projectBucketId: 'project-123',
    countryCode: 'US',
    contract: 'contract-123',
    executorAcronym: 'EXEC',
  };

  const mockPreferences = {
    preferredLanguage: 'en',
    procurementPreferences: [
      {
        projectBucketId: 'project-123',
        process: true,
        contracts: false,
        amendments: false,
      },
    ],
  };

  async function setup() {
    const visibilityServiceMock = {
      setVisiblityProjectHeader: jest.fn(),
      sizeWindow: jest
        .fn()
        .mockReturnValue(of({ mobileView: false, width: 1024, height: 768 })),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    const activatedRouteMock = {
      parent: {},
    };

    const translateEnumPipeMock = {
      getEnumByNumber: jest.fn((value, enums) => {
        return (
          enums.find((e) => e.id === value) || { id: value, name: 'Unknown' }
        );
      }),
      transform: jest.fn((code, enums) => {
        return enums.find((e) => e.name === code)?.name || code;
      }),
    };

    const permissionServiceMock = {
      hasPermission: jest.fn().mockReturnValue(true),
    };

    const biddingProcessPlanStoreServiceMock = {
      getOrLoadBiddingProcessPlan: jest.fn().mockReturnValue(
        of({
          biddingPlanState: {
            biddingProcessPlan: mockBiddingProcessPlan,
            biddingProcessProcurementProcesses: mockBiddingProcesses,
            processScreenLoaded: true,
            processScreenLoading: false,
            loading: false,
            loadingProcess: false,
            selectedFilterForBiddingProcess: null,
            filteredBiddingProcessProcurementProcesses: [],
          },
          enumState: mockEnums,
          projectState: { selectedProject: mockProject },
        })
      ),
      setFilteredProcess: jest.fn(),
      cancelProcessAction: jest.fn(),
      removeProcessAction: jest.fn(),
      ineligibilityProcessAction: jest.fn(),
      declareUnsuccessfulProcessAction: jest.fn(),
    };

    const storeMock = {
      select: jest.fn((selector) => {
        if (selector === 'contact') {
          return of({ contact: { is_internal: true } });
        }
        if (selector === 'selectedProject') {
          return of({
            loaded: true,
            selectedProject: mockProject,
          });
        }
        if (selector === 'preferences') {
          return of({ preferences: mockPreferences });
        }
        return of({});
      }),
      dispatch: jest.fn(),
    };

    const projectStoreServiceMock = {
      selectedProject: jest
        .fn()
        .mockReturnValue(of({ selectedProject: mockProject })),
    };

    const biddingProcessPlanServiceMock = {
      getBiddingProcessPlan: jest
        .fn()
        .mockReturnValue(of({ biddingProcessPlan: mockBiddingProcessPlan })),
    };

    const workflowSharedServiceMock = {
      loadActions: jest.fn(),
    };

    const enumsStoreServiceMock = {
      selectEnums: jest.fn().mockReturnValue(of(mockEnums)),
    };

    const delayedMilestoneEventBusServiceMock = {
      selectedOption$: new Subject(),
      selectedOption: null,
    };

    const filteredProcessServiceMock = {
      getFilteredProcurementProcess: jest.fn().mockReturnValue(of([])),
    };

    const modalServiceMock = {
      open: jest.fn().mockReturnValue(of({ result: 1 })),
      openDialogWithComments: jest
        .fn()
        .mockReturnValue(
          of({ result: 1, comments: { comment: 'Test comment' } })
        ),
      openCustomWorkFlowCommentsModal: jest.fn(),
      openPlansComments: jest.fn().mockReturnValue(of({ result: 0 })),
    };

    const commentsServiceMock = {
      postComments: jest.fn().mockReturnValue(of({})),
    };

    const ifNumberPipeMock = {
      transform: jest.fn((value) => value?.toString() || '0'),
    };

    const { fixture } = await render(ProcessMonitoringComponent, {
      providers: [
        { provide: VisibilityService, useValue: visibilityServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: TranslateEnumPipe, useValue: translateEnumPipeMock },
        { provide: NotificationGlobalService, useValue: {} },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: ProcessConfiguration, useValue: {} },
        {
          provide: TranslateService,
          useValue: { instant: jest.fn((key) => key) },
        },
        {
          provide: BiddingProcessPlanStoreService,
          useValue: biddingProcessPlanStoreServiceMock,
        },
        {
          provide: BiddingProcessPlanService,
          useValue: biddingProcessPlanServiceMock,
        },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: WorkflowSharedService, useValue: workflowSharedServiceMock },
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: ProjectStoreService, useValue: projectStoreServiceMock },
        { provide: Store, useValue: storeMock },
        { provide: IfNumberPipe, useValue: ifNumberPipeMock },
        { provide: EnumsStoreService, useValue: enumsStoreServiceMock },
        { provide: ProcurementDownloadService, useValue: {} },
        { provide: FileSaverService, useValue: {} },
        { provide: PopupNotificationService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        {
          provide: DelayedMilestoneEventBusService,
          useValue: delayedMilestoneEventBusServiceMock,
        },
        {
          provide: FilteredProcurementProcessService,
          useValue: filteredProcessServiceMock,
        },
      ],
      imports: [
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });

    const component = fixture.componentInstance;
    fixture.detectChanges();

    return {
      component,
      fixture,
      visibilityServiceMock,
      routerMock,
      biddingProcessPlanStoreServiceMock,
      storeMock,
      modalServiceMock,
      commentsServiceMock,
      delayedMilestoneEventBusServiceMock,
      filteredProcessServiceMock,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should initialize with correct data', async () => {
    const { component } = await setup();
    expect(component.procurementId).toBe('plan-123');
    expect(component.processPlan).toEqual(mockBiddingProcessPlan);
    expect(component.projectSelected).toEqual(mockProject);
    expect(component.countryCodeProject).toBe('US');
  });

  it('should set isInternal to true', async () => {
    const { component } = await setup();
    expect(component.isInternal).toBe(true);
  });

  it('should navigate to create process form', async () => {
    const { component, routerMock } = await setup();
    component.navigateToCreateProcessForm();
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['plan-123', 'process', 'create'],
      expect.any(Object)
    );
  });

  it('should navigate to update form', async () => {
    const { component, routerMock } = await setup();
    component.navigateToUpdateForm('process-1');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['plan-123', 'process', 'process-1', 'edit'],
      expect.any(Object)
    );
  });

  it('should navigate to replicate form', async () => {
    const { component, routerMock } = await setup();
    component.navigateToReplicateForm('process-1');
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['plan-123', 'process', 'process-1', 'replicate'],
      expect.any(Object)
    );
  });

  it('should update delayed milestones table preferences', async () => {
    const { component, storeMock } = await setup();
    component.changeTablePreference({
      typeTable: DelayedMilestoneTableTypeEnum.PROCESS,
      show: true,
    });
    expect(component.delayedMilestonesTablePreferences.process).toBe(true);
    expect(storeMock.dispatch).toHaveBeenCalled();
  });

  it('should calculate delayed milestones', async () => {
    const { component } = await setup();
    const processesWithDelays = [
      { advanceMilestone: { delayed: true } },
      { advanceMilestone: { delayed: false } },
      { advanceMilestone: { delayed: true } },
    ];
    component.getDelayedMilestones(processesWithDelays as any);
    expect(component.delayedMilestones).toBe(2);
  });

  it('should clear selection', async () => {
    const { component, biddingProcessPlanStoreServiceMock } = await setup();
    component.clearSelection();
    expect(
      biddingProcessPlanStoreServiceMock.setFilteredProcess
    ).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        selectedRow: null,
        selectedCol: null,
        selectedTableType: null,
      })
    );
  });

  it('should show add comment option for valid statuses', async () => {
    const { component } = await setup();
    const result = component.showAddCommentOption(
      BiddingProcessProcurementProcessStatuses.EXPECTED,
      BiddingProcessPlanStatus.DRAFT
    );
    expect(result).toBe(true);
  });

  it('should not show add comment option for deleted status', async () => {
    const { component } = await setup();
    const result = component.showAddCommentOption(
      BiddingProcessProcurementProcessStatuses.DELETED,
      BiddingProcessPlanStatus.DRAFT
    );
    expect(result).toBeFalsy();
  });

  it('should show edit option for valid statuses', async () => {
    const { component } = await setup();
    component.isInternal = false;
    const result = component.showEditOption(
      BiddingProcessProcurementProcessStatuses.EXPECTED,
      BiddingProcessPlanStatus.DRAFT
    );
    expect(result).toBe(true);
  });

  it('should not show edit option for internal users', async () => {
    const { component } = await setup();
    component.isInternal = true;
    const result = component.showEditOption(
      BiddingProcessProcurementProcessStatuses.EXPECTED,
      BiddingProcessPlanStatus.DRAFT
    );
    expect(result).toBe(false);
  });

  it('should sort procurement plan by code', async () => {
    const { component } = await setup();
    const unsorted = [
      { order: 3, code: 'C' },
      { order: 1, code: 'A' },
      { order: 2, code: 'B' },
    ];
    const sorted = component.sortProcurementPlanByCode(unsorted as any);
    expect(sorted[0].order).toBe(1);
    expect(sorted[1].order).toBe(2);
    expect(sorted[2].order).toBe(3);
  });

  it('should sort comments by date', async () => {
    const { component } = await setup();
    const unsorted = [
      { created: new Date('2024-01-03') },
      { created: new Date('2024-01-01') },
      { created: new Date('2024-01-02') },
    ];
    const sorted = component.sortCommentsByDate(unsorted as any);
    expect(sorted[0].created).toEqual(new Date('2024-01-01'));
    expect(sorted[2].created).toEqual(new Date('2024-01-03'));
  });

  it('should post comment successfully', async () => {
    const { component, commentsServiceMock } = await setup();
    component.processPlan = mockBiddingProcessPlan as any;
    const comments = [{ text: 'Test comment', visibility: 0 }];
    component.postComment(comments);
    expect(commentsServiceMock.postComments).toHaveBeenCalled();
  });

  it('should check any process as draft or modified', async () => {
    const { component } = await setup();
    component.checkAnyProcessAsDraftOrModified(
      BiddingProcessProcurementProcessStatuses.DRAFT
    );
    expect(component.anyProcessAsDraftOrModified).toBe(true);
  });

  it('should cleanup subscriptions on destroy', async () => {
    const { component } = await setup();
    const unsubscribeSpy = jest.fn();
    component.subscriptionCollection = [{ unsubscribe: unsubscribeSpy } as any];
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
