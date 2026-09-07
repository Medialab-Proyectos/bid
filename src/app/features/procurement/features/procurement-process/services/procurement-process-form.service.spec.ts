import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideWindowSizeMock } from '@fiduciary-interface-test';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ProcurementProcessFormService } from './procurement-process-form.service';
import {
  BiddingProcessProcurementProcessStatuses,
  DocumentPackagesStatus,
  SettingType,
} from '@core/enums';
import {
  BiddingProcessProcurementProcess,
  BiddingProcessProcurementProcessDetail,
  Enumerator,
  GetBiddingProcessComponentResponse,
  GetBiddingProcurementProcessByIdResponse,
  GetSettingsResponse,
  KeyValue,
  KeyValueInput,
  Process,
} from '@core/models';
import { FormControl, FormGroup } from '@angular/forms';
import { createProcurementForm } from '../../../../../features/procurement/features/procurement-process/components/procurement-form/procurement.form';
import { UntypedFormArray } from '@angular/forms';
import { BiddingProcessPlanService } from '@core/services/apis';
import { of } from 'rxjs';
import {
  createComments,
  createMilestones,
  createProcessOutputs,
} from '../procurement-process.form';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { ProcessConfiguration } from '@core/services/process-configuration.service';

const translateServiceMock = {
  instant: jest.fn(),
};
const notificationGlobalSvcMock = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};
describe('ProcurementProcessFormService', () => {
  let service: ProcurementProcessFormService;
  let biddingProcessSvc: BiddingProcessPlanService;
  let translateService: TranslateService;
  let notificationGlobalService: NotificationGlobalService;
  let configSvc: ProcessConfiguration;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        provideMockStore({}),
        provideWindowSizeMock(),
        NotificationService,
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
        {
          provide: NotificationGlobalService,
          useValue: notificationGlobalSvcMock,
        },
      ],
    });
    service = TestBed.inject(ProcurementProcessFormService);
    biddingProcessSvc = TestBed.inject(BiddingProcessPlanService);
    translateService = TestBed.inject(TranslateService);
    notificationGlobalService = TestBed.inject(NotificationGlobalService);
    configSvc = TestBed.inject(ProcessConfiguration);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isDraftExpectedOrModified', () => {
    it('should return true if is draft', () => {
      const draftStatus = BiddingProcessProcurementProcessStatuses.DRAFT;
      expect(service.isDraftExpectedOrModified(draftStatus)).toBe(true);
    });
    it('should return false if is deleted', () => {
      const draftStatus = BiddingProcessProcurementProcessStatuses.DELETED;
      expect(service.isDraftExpectedOrModified(draftStatus)).toBe(false);
    });
  });

  describe('isNotEditable', () => {
    it('should return true if is canceled', () => {
      const draftStatus = BiddingProcessProcurementProcessStatuses.CANCELLED;
      expect(service.isNotEditable(draftStatus)).toBe(true);
    });
    it('should return false if is draft', () => {
      const draftStatus = BiddingProcessProcurementProcessStatuses.DRAFT;
      expect(service.isNotEditable(draftStatus)).toBe(false);
    });
  });

  describe('getIdByName', () => {
    it('should return enum id', () => {
      const name = 'PROCUREMENT.CATEGORIES.PROCT_GOODS';
      const response = 2;

      const id = service.getIdByName(name, enumType);
      expect(id).toEqual(response);
    });

    it('should return null', () => {
      const name = '';

      const id = service.getIdByName(name, enumType);
      expect(id).toEqual(null);
    });
  });

  describe('getNameById', () => {
    it('should return enum name', () => {
      const id = 1;
      const response = 'PROCUREMENT.CATEGORIES.PROCT_EXT_AUDIT';

      const name = service.getNameById(id, enumType);
      expect(name).toEqual(response);
    });

    it('should return null', () => {
      const id = 8;

      const name = service.getNameById(id, enumType);
      expect(name).toEqual(null);
    });
  });

  describe('configForm', () => {
    it('should return formConfig object', () => {
      const mockResponse = {
        commentsSection: {
          isDisabled: false,
        },
        costDistributionSection: {
          isDisabled: false,
          justification: undefined,
        },
        outputsSection: {
          isDisabled: false,
        },
        milestoneSection: {
          isEstimatedDateDisabled: false,
          isEstimatedDateVisible: true,
          isReEstimatedDateDisabled: false,
          isReEstimatedDateVisible: false,
          isActualDateDisabled: true,
          isActualDateVisible: false,
          disabledRestimatedDates: [false],
        },
        mode: null,
      };

      expect(service.configForm(mockDataDraft)).toEqual(mockResponse);
    });
  });

  describe('disableAditionalInfo', () => {
    it('should disable the form if doesnt have status draft/modified/expected ', () => {
      const form = new FormGroup({
        adittionalInfo: new FormControl(''),
      });
      service.disableAditionalInfo(form, mockDataCancelled);
      const disabledAdittionalInfo = form.get('adittionalInfo').disabled;
      expect(disabledAdittionalInfo).toBe(true);
    });
    it('should keep enable the form if doesnt have status draft/modified/expected ', () => {
      const form = new FormGroup({
        adittionalInfo: new FormControl(''),
      });
      service.disableAditionalInfo(form, mockDataDraft);
      const disabledAdittionalInfo = form.get('adittionalInfo').disabled;
      expect(disabledAdittionalInfo).toBe(false);
    });
  });

  describe('disableProcurementeProcess', () => {
    it('should disable the procurementeProcess forms if doesnt have status draft/modified/expected ', () => {
      const form = new FormGroup({
        processForm: new FormGroup({}),
      });
      service.disableProcurementeProcess(form, mockDataCancelled);
      const disabledProcessForm = form.get('processForm').disabled;

      expect(disabledProcessForm).toBe(true);
    });

    it('should keep enable the procurementeProcess forms if doesnt have status draft/modified/expected ', () => {
      const form = new FormGroup({
        processForm: new FormGroup({}),
      });
      service.disableProcurementeProcess(form, mockDataDraft);
      const disabledProcessForm = form.get('processForm').disabled;

      expect(disabledProcessForm).toBe(false);
    });
  });

  describe('disableComponents', () => {
    it('should disable the form components if doesnt have status draft/modified/expected ', () => {
      const form = new FormGroup({
        componentsForm: new FormGroup({
          component: new FormControl(''),
        }),
      });

      service.disableComponents(form, mockDataCancelled);
      const disabledComponent = form.get('componentsForm.component').disabled;
      expect(disabledComponent).toBe(true);
    });

    it('should keep enable the form components if doesnt have status draft/modified/expected ', () => {
      const form = new FormGroup({
        componentsForm: new FormGroup({
          component: new FormControl(''),
        }),
      });

      service.disableComponents(form, mockDataDraft);
      const disabledComponent = form.get('componentsForm.component').disabled;
      expect(disabledComponent).toBe(false);
    });
  });

  describe('disableSustainabilies', () => {
    it('should disable the form sustainabilities if doesnt have status CANCELLED, PROCUREMENT_COMPLETE...', () => {
      const form = new FormGroup({
        sustainabilityForm: new FormGroup({
          sustainability: new FormControl(''),
          sustainabilityDescription: new FormControl(''),
        }),
      });

      service.disableSustainabilies(form, mockDataCancelled);
      const disabledSustainabilities = form.get('sustainabilityForm').disabled;
      expect(disabledSustainabilities).toBe(true);
    });

    it('should keep enable the form components if doesnt have status CANCELLED, PROCUREMENT_COMPLETE...', () => {
      const form = new FormGroup({
        sustainabilityForm: new FormGroup({
          sustainability: new FormControl(''),
          sustainabilityDescription: new FormControl(''),
        }),
      });

      service.disableSustainabilies(form, mockDataDraft);
      const disabledSustainabilities = form.get('sustainabilityForm').disabled;
      expect(disabledSustainabilities).toBe(false);
    });
  });

  describe('removeHours', () => {
    it('should return a new date with hours set to zero', () => {
      const inputDate = new Date(2023, 5, 30, 10, 30, 45);
      const expectedDate = new Date(2023, 5, 30, 0, 0, 0);

      const result = service.removeHours(inputDate);

      expect(result).toEqual(expectedDate);
    });
  });

  describe('disableFormField', () => {
    it('should call functions to disable form fields adittionalInfo,manualId,componentsForm.component,sustainabilityForm', () => {
      const proceurementForm = createProcurementForm();
      const spyDisableAditionalInfo = jest.spyOn(
        service,
        'disableAditionalInfo'
      );
      const spyDisableComponents = jest.spyOn(service, 'disableComponents');
      const spyDisableProcurementeProcess = jest.spyOn(
        service,
        'disableProcurementeProcess'
      );
      const spyDisableSustainabilies = jest.spyOn(
        service,
        'disableSustainabilies'
      );

      service.disableFormField(proceurementForm, mockDataDraft);
      expect(spyDisableAditionalInfo).toHaveBeenCalledWith(
        proceurementForm,
        mockDataDraft
      );
      expect(spyDisableComponents).toHaveBeenCalledWith(
        proceurementForm,
        mockDataDraft
      );
      expect(spyDisableProcurementeProcess).toHaveBeenCalledWith(
        proceurementForm,
        mockDataDraft
      );
      expect(spyDisableSustainabilies).toHaveBeenCalledWith(
        proceurementForm,
        mockDataDraft
      );
    });
  });

  describe('isUnderReviewOrUnderReviewModified', () => {
    it('should return true if status is UNDER_REVIEW ', () => {
      const result = service.isUnderReviewOrUnderReviewModified(
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW
      );

      expect(result).toBe(true);
    });

    it('should return true if status is UNDER_REVIEW_MODIFIED', () => {
      const result = service.isUnderReviewOrUnderReviewModified(
        BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED
      );
      expect(result).toBe(true);
    });

    it('should return false if status is any other value', () => {
      const result1 = service.isUnderReviewOrUnderReviewModified(
        BiddingProcessProcurementProcessStatuses.DRAFT
      );
      const result2 = service.isUnderReviewOrUnderReviewModified(
        BiddingProcessProcurementProcessStatuses.CONTRACT_UNDER_EXECUTION_WITH_AMENDMENTS
      );

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });

  it('should add milestone processes to the form array', () => {
    const formArray: UntypedFormArray = new UntypedFormArray([]);
    const data: Process[] = [
      {
        order: 1,
        name: 'name1',
        tooltip: 'tooltip1',
      },
      {
        order: 2,
        name: 'name2',
        tooltip: 'tooltip2',
      },
      {
        order: 3,
        name: 'name3',
        tooltip: 'tooltip3',
      },
    ];

    service.addMilestoneProcess(formArray, data);

    expect(formArray.length).toBe(3);
    expect(formArray.at(0).value).toEqual({
      initialEstimationDate: null,
      reEstimateDate: null,
      actualDate: null,
      order: 1,
      code: 'name1',
      name: 'name1',
      tooltip: 'tooltip1',
    });
    expect(formArray.at(1).value).toEqual({
      initialEstimationDate: null,
      reEstimateDate: null,
      actualDate: null,
      order: 2,
      code: 'name2',
      name: 'name2',
      tooltip: 'tooltip2',
    });
    expect(formArray.at(2).value).toEqual({
      initialEstimationDate: null,
      reEstimateDate: null,
      actualDate: null,
      order: 3,
      code: 'name3',
      name: 'name3',
      tooltip: 'tooltip3',
    });
  });

  describe('filterCommentsOnInternalOrExternal', () => {
    it('should filter internal comments when IS_INTERNAL is false', () => {
      const comments: BiddingProcessProcurementProcessDetail = JSON.parse(
        JSON.stringify(mockDataDraft)
      );
      comments.comments = [];
      comments.comments.push({
        id: 'id1',
        biddingProcessProcurementProcessId:
          'biddingProcessProcurementProcessId1',
        comment: {
          createdBy: '',
          id: 'id1',
          visibility: 1,
          source: 1,
          status: 0,
          text: 'string',
        },
      });
      comments.comments.push({
        id: 'id2',
        biddingProcessProcurementProcessId:
          'biddingProcessProcurementProcessId2',
        comment: {
          createdBy: '',
          id: 'id2',
          visibility: 1,
          source: 0,
          status: 0,
          text: 'string',
        },
      });
      comments.comments.push({
        id: 'id3',
        biddingProcessProcurementProcessId:
          'biddingProcessProcurementProcessId3',
        comment: {
          createdBy: '',
          id: 'id3',
          visibility: 0,
          source: 0,
          status: 0,
          text: 'string',
        },
      });
      service.IS_INTERNAL = false;
      const filteredComments =
        service.filterCommentsOnInternalOrExternal(comments);

      expect(filteredComments.length).toBe(2);
    });

    it('should filter external comments when IS_INTERNAL is true', () => {
      const comments: BiddingProcessProcurementProcessDetail = JSON.parse(
        JSON.stringify(mockDataDraft)
      );
      comments.comments = [];
      comments.comments.push({
        id: 'id1',
        biddingProcessProcurementProcessId:
          'biddingProcessProcurementProcessId1',
        comment: {
          createdBy: '',
          id: 'id1',
          visibility: 1,
          source: 1,
          status: 0,
          text: 'string',
        },
      });
      comments.comments.push({
        id: 'id2',
        biddingProcessProcurementProcessId:
          'biddingProcessProcurementProcessId2',
        comment: {
          createdBy: '',
          id: 'id2',
          visibility: 1,
          source: 0,
          status: 0,
          text: 'string',
        },
      });

      service.IS_INTERNAL = true;

      const filteredComments =
        service.filterCommentsOnInternalOrExternal(comments);

      expect(filteredComments.length).toBe(1);
    });
  });

  describe('getProcurementProcessDetail', () => {
    it('should get procurement process detail correctly', (done) => {
      const processId = 'your-process-id';

      const processResponse: GetBiddingProcurementProcessByIdResponse = {
        biddingProcessProcurementProcess: procurementProcess,
      };
      const commentsResponse = { biddingProcurementProcessComments: [] };
      const milestonesResponse = { biddingProcessMilestones: [] };
      const outputsResponse: GetBiddingProcessComponentResponse = {
        componentId: 'componentId',
        componentName: 'componentName',
        outputs: [
          {
            ouputId: 'ouputId',
            ouputName: 'ouputName',
            percentageAssigned: 100,
          },
        ],
      };
      const addPackageStatusOnMilestoneResponse: BiddingProcessProcurementProcessDetail =
        {
          comments: [],
          milestones: [],
          outputs: outputsResponse,
          process: procurementProcess,
        };

      jest
        .spyOn(biddingProcessSvc, 'getBiddingProcessProcurementProcessesById')
        .mockReturnValue(of(processResponse));
      jest
        .spyOn(biddingProcessSvc, 'getBiddingComments')
        .mockReturnValue(of(commentsResponse));
      jest
        .spyOn(biddingProcessSvc, 'getProcessMilestones')
        .mockReturnValue(of(milestonesResponse));
      jest
        .spyOn(biddingProcessSvc, 'getBiddingProcessComponents')
        .mockReturnValue(of(outputsResponse));
      jest
        .spyOn(service, 'addPackageStatusOnMilestone')
        .mockReturnValue(of(addPackageStatusOnMilestoneResponse));

      service.getProcurementProcessDetail(processId).subscribe((result) => {
        expect(result).toEqual({
          process: processResponse.biddingProcessProcurementProcess,
          comments: commentsResponse.biddingProcurementProcessComments,
          milestones: milestonesResponse.biddingProcessMilestones,
          outputs: outputsResponse,
        });
        done();
      });
    });
  });

  it('should fill the form correctly', () => {
    const form = createProcurementForm();

    const data: BiddingProcessProcurementProcessDetail = JSON.parse(
      JSON.stringify(dataMock)
    );

    const milestoneCode: Enumerator[] = [
      {
        id: 1,
        name: 'Milestone Name 1',
      },
      {
        id: 2,
        name: 'Milestone Name 2',
      },
      {
        id: 3,
        name: 'Milestone Name 3',
      },
    ];
    service.fillForm(form, data, milestoneCode);

    expect(form.value).toEqual({
      adittionalInfo: {
        bafo: true,
        goodsReference: 0,
        lots: 0,
        sepaPlecaId: 'string',
      },
      commentsProcess: {
        commentsList: [
          {
            id: 'string',
            text: 'string',
            visibility: '0',
            status: 0,
            createdBy: '',
          },
        ],
      },

      componentsForm: {
        component: 'string',
        outputsAsigned: [{ id: 'string', percentage: 100 }],
      },
      costDistributionForm: {
        contractTotalAmount: 0,
        bidAmount: 0,
        bidAmountPercentage: null,
        localCounterpartAmount: 0,
        localCounterpartAmountPercentage: null,
        cofinancingAmount: 0,
        cofinancingAmountPercentage: null,
        justification: '',
        maxAmount: '',
        maxThresholdExceed: '',
        maxThresholdExceedDirectContract: '',
        totalAmountPercentage: null,
        minTotalAmount: null,
      },
      milestonesForm: {
        milestoneCollection: [
          {
            actualDate: dataMock.milestones[0].actualDate,
            code: null,
            initialEstimationDate: dataMock.milestones[0].estimatedDate,
            name: null,
            order: 0,
            reEstimateDate: dataMock.milestones[0].reEstimateDate,
            tooltip: null,
          },
        ],
      },
      processForm: {
        name: 'string',
        description: 'string',
        manualId: 'string',
        subExecutor: 'string',
        category: '',
        procurementMethod: '',
        supervisionType: '',
        justification: 'string',
      },
      sustainabilityForm: {
        sustainability: 0,
        sustainabilityDescription: 'string',
      },
    });
  });

  it('should return the correct CreateBiddingProcessRequest object', () => {
    const form = createProcurementForm();

    const patch = {
      processForm: {
        name: 'name',
        manualId: 'manualId',
        subExecutor: 'subExecutor',
        description: 'description',
        justification: 'justification',
        category: 'CATEGORY1',
        procurementMethod: 'PROCUREMENTMETHODS2',
        supervisionType: 'SUPERVISIONMETHOD3',
      },
      componentsForm: {
        component: 'your-component-id',
        outputsAsigned: [],
      },
      costDistributionForm: {
        bidAmount: 100,
        cofinancingAmount: 50,
        localCounterpartAmount: 30,
        contractTotalAmount: 180,
        justification: 'your-cost-justification',
      },
      adittionalInfo: {
        lots: 1,
        sepaPlecaId: 'your-sepa-pleca-id',
        bafo: 'your-bafo',
        goodsReference: 0,
      },
      milestonesForm: {
        milestoneCollection: [],
      },
      sustainabilityForm: {
        sustainability: 0,
        sustainabilityDescription: 'your-sustainability-description',
      },
    };

    form.patchValue(patch);
    const newoutput1 = createProcessOutputs();
    newoutput1.controls.id.setValue('your-component-id');
    newoutput1.controls.percentage.setValue([
      { id: 'output1', percentage: 90 },
      { id: 'output2', percentage: 10 },
    ]);
    (form.get('componentsForm').get('outputsAsigned') as UntypedFormArray).push(
      newoutput1
    );

    const date = new Date(2023, 6, 3);

    const newMilestone1 = createMilestones();
    newMilestone1.controls.initialEstimationDate.setValue(date);
    newMilestone1.controls.code.setValue(1);
    newMilestone1.controls.name.setValue('Milestone1');

    (
      form.get('milestonesForm').get('milestoneCollection') as UntypedFormArray
    ).push(newMilestone1);

    const countryCode = 'your-country-code';
    const categories: Enumerator[] = [
      {
        id: 1,
        name: 'PROCUREMENT.CATEGORIES.CATEGORY1',
      },
      {
        id: 2,
        name: 'PROCUREMENT.CATEGORIES.CATEGORY2',
      },
      {
        id: 3,
        name: 'PROCUREMENT.CATEGORIES.CATEGORY3',
      },
    ];
    const procurementMethods: Enumerator[] = [
      {
        id: 1,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCUREMENTMETHODS1',
      },
      {
        id: 2,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCUREMENTMETHODS2',
      },
      {
        id: 3,
        name: 'PROCUREMENT.PROCUREMENT_METHOD.PROCUREMENTMETHODS3',
      },
    ];
    const supervisionMethods: Enumerator[] = [
      {
        id: 1,
        name: 'PROCUREMENT.SUPERVISION_METHOD.SUPERVISIONMETHOD1',
      },
      {
        id: 2,
        name: 'PROCUREMENT.SUPERVISION_METHOD.SUPERVISIONMETHOD2',
      },
      {
        id: 3,
        name: 'PROCUREMENT.SUPERVISION_METHOD.SUPERVISIONMETHOD3',
      },
    ];
    const milestones = [
      {
        id: 1,
        name: 'Milestone1',
      },
      {
        id: 2,
        name: 'Milestone2',
      },
      {
        id: 3,
        name: 'Milestone3',
      },
    ];

    const result = service.procurementRequest(
      form,
      countryCode,
      categories,
      procurementMethods,
      supervisionMethods,
      milestones
    );

    expect(result).toEqual({
      name: 'name',
      manualId: 'manualId',
      subExecutor: 'subExecutor',
      description: 'description',
      justification: 'justification',
      category: 1,
      procurementMethod: 2,
      supervisionType: 3,
      outputsTask: {
        componentId: 'your-component-id',
        outputs: [
          {
            ouputId: 'your-component-id',
            percentageAssigned: [
              { id: 'output1', percentage: 90 },
              { id: 'output2', percentage: 10 },
            ],
          },
        ],
      },
      costDistribution: {
        idbEstimatedAmount: 100,
        localCounterpartAmount: 30,
        cofinancedAmount: 50,
        totalEstimatedAmount: 180,
        costJustificaction: 'your-cost-justification',
      },
      biddingProcessMilestones: [
        {
          actualDate: '',
          code: 1,
          estimatedDate: date,
          id: undefined,
          reEstimatedDate: '',
        },
      ],
      comments: [],
      lots: 1,
      sepaPlecaId: 'your-sepa-pleca-id',
      bafo: 'your-bafo',
      goodsReference: 0,
      sustainability: 0,
      sustainabilityDescription: 'your-sustainability-description',
      countryCode: 'your-country-code',
    });
  });

  it('should return the correct AddComment array for mapPostComments()', () => {
    const form = createProcurementForm();
    const newComment1 = createComments();
    newComment1.controls.id.setValue('1');
    newComment1.controls.text.setValue('comment1');
    newComment1.controls.visibility.setValue(1);
    newComment1.controls.createdBy.setValue('test@gmail.com');
    (form.get('commentsProcess').get('commentsList') as UntypedFormArray).push(
      newComment1
    );

    const comments = service.mapPostComments(form);

    expect(comments).toEqual([
      {
        id: '1',
        visibility: 1,
        status: 0,
        text: 'comment1',
      },
    ]);
  });

  it('should display the error message for errorMessage()', () => {
    const translatedMsg = 'Translated error message';
    const spyTranslate = jest
      .spyOn(translateService, 'instant')
      .mockReturnValue(translatedMsg);
    const spynotificationGlobalService = jest
      .spyOn(notificationGlobalService, 'showError')
      .mockReturnValue();
    service.errorMessage();

    expect(spyTranslate).toHaveBeenCalledWith('PROCUREMENT.EDIT_ERROR');

    expect(spynotificationGlobalService).toHaveBeenCalledWith(translatedMsg);
  });

  it('should display the error message for errorSaveCommentMessage()', () => {
    const translatedMsg = 'Translated errorSaveCommentMessage';
    const spyTranslate = jest
      .spyOn(translateService, 'instant')
      .mockReturnValue(translatedMsg);
    const spynotificationGlobalService = jest
      .spyOn(notificationGlobalService, 'showError')
      .mockReturnValue();
    service.errorSaveCommentMessage();

    expect(spyTranslate).toHaveBeenCalledWith('PROCUREMENT.SAVE_COMMENT_ERROR');

    expect(spynotificationGlobalService).toHaveBeenCalledWith(translatedMsg);
  });

  it('should display the success message for successSaveCommentMessage()', () => {
    const translatedMsg = 'Translated successSaveCommentMessage';
    const spyTranslate = jest
      .spyOn(translateService, 'instant')
      .mockReturnValue(translatedMsg);
    const spynotificationGlobalService = jest
      .spyOn(notificationGlobalService, 'showSuccess')
      .mockReturnValue();
    service.successSaveCommentMessage();

    expect(spyTranslate).toHaveBeenCalledWith(
      'PROCUREMENT.SAVE_COMMENT_SUCCESS'
    );

    expect(spynotificationGlobalService).toHaveBeenCalledWith(translatedMsg);
  });

  it('should display the success message for successEditMessage()', () => {
    const translatedMsg = 'Translated successEditMessage';
    const spyTranslate = jest
      .spyOn(translateService, 'instant')
      .mockReturnValue(translatedMsg);
    const spynotificationGlobalService = jest
      .spyOn(notificationGlobalService, 'showSuccess')
      .mockReturnValue();
    service.successEditMessage();

    expect(spyTranslate).toHaveBeenCalledWith('PROCUREMENT.EDIT_SUCCESS');

    expect(spynotificationGlobalService).toHaveBeenCalledWith(translatedMsg);
  });

  it('should display the success message for successMessage()', () => {
    const translatedMsg = 'Translated successMessage';
    const spyTranslate = jest
      .spyOn(translateService, 'instant')
      .mockReturnValue(translatedMsg);
    const spynotificationGlobalService = jest
      .spyOn(notificationGlobalService, 'showSuccess')
      .mockReturnValue();
    service.successMessage();

    expect(spyTranslate).toHaveBeenCalledWith('PROCUREMENT.CREATE_SUCCESS');

    expect(spynotificationGlobalService).toHaveBeenCalledWith(translatedMsg);
  });

  it('should return procurement methods for queryProcurementMethods', fakeAsync(() => {
    const getSettingsResponse: GetSettingsResponse = {
      settings: [
        {
          id: 'id',
          type: 'type',
          attributes: [{ key: 'groupMethod', value: 'ShoppingBidding' }],
          values:
            '{ "listMethods":[{"code":"PROCT_SRQOI"},{"code":"PROCT_SRMQ"}]}',
          modified: 'system',
        },
      ],
    };

    const settingsSpy = jest
      .spyOn(configSvc, 'settings')
      .mockReturnValue(of(getSettingsResponse));
    const buildAttributesArraySpy = jest.spyOn(
      service['utilsSvc'],
      'buildAttributesArray'
    );
    const result: KeyValue[] = [];
    const attributeCountry: KeyValueInput = {
      key: 'key-country1',
      value: 'value-country1',
    };
    const attributeCategory: KeyValueInput = {
      key: 'key-category1',
      value: 'value-category1',
    };
    const differentiatorParameter: KeyValueInput = {
      key: 'onlyMethods',
      value: 1,
    };
    service
      .queryProcurementMethods(
        attributeCountry,
        attributeCategory,
        differentiatorParameter
      )
      .toPromise()
      .then((methods: KeyValue[]) => {
        result.push(...methods);
      });

    expect(settingsSpy).toHaveBeenCalled();
    expect(buildAttributesArraySpy).toHaveBeenCalledWith(
      SettingType.procurementMethod,
      attributeCountry,
      attributeCategory,
      null,
      null,
      null,
      null,
      null,
      null,
      differentiatorParameter
    );

    tick();

    expect(result).toEqual([
      { key: '0', value: 'PROCT_SRQOI' },
      { key: '1', value: 'PROCT_SRMQ' },
    ]);
  }));

  it('should return supervision methods for querySupervisionMethods', fakeAsync(() => {
    const getSettingsResponse: GetSettingsResponse = {
      settings: [
        {
          id: 'id',
          type: 'type',
          attributes: [
            { key: 'SUPERVISIONMETHOD', value: 'SUPERVISIONMETHOD_VALUE' },
          ],
          values:
            '{ "supervisionMethods":[{"code":"SUPERVISION1"},{"code":"SUPERVISION2"}]}',
          modified: 'system',
        },
      ],
    };

    const settingsSpy = jest
      .spyOn(configSvc, 'settings')
      .mockReturnValue(of(getSettingsResponse));
    const buildAttributesArraySpy = jest.spyOn(
      service['utilsSvc'],
      'buildAttributesArray'
    );
    const result: KeyValue[] = [];
    const attributeCountry: KeyValueInput = {
      key: 'key-country1',
      value: 'value-country1',
    };
    const attributeCategory: KeyValueInput = {
      key: 'key-category1',
      value: 'value-category1',
    };
    const attributeProcurementMethod: KeyValueInput = {
      key: 'key-procurement1',
      value: 'value-procurement1',
    };

    service
      .querySupervisionMethods(
        attributeCountry,
        attributeCategory,
        attributeProcurementMethod
      )
      .toPromise()
      .then((methods: KeyValue[]) => {
        result.push(...methods);
      });

    expect(settingsSpy).toHaveBeenCalled();
    expect(buildAttributesArraySpy).toHaveBeenCalledWith(
      SettingType.supervisionMethod,
      attributeCountry,
      attributeCategory,
      attributeProcurementMethod
    );

    tick();

    expect(result).toEqual([
      { key: '0', value: 'SUPERVISION1' },
      { key: '1', value: 'SUPERVISION2' },
    ]);
  }));

  it('should return milestone for queryMilestones', fakeAsync(() => {
    const getSettingsResponse: GetSettingsResponse = {
      settings: [],
    };

    const settingsSpy = jest
      .spyOn(configSvc, 'settings')
      .mockReturnValue(of(getSettingsResponse));
    const buildAttributesArraySpy = jest.spyOn(
      service['utilsSvc'],
      'buildAttributesArray'
    );
    const attributeSupervisionMethod: KeyValueInput = {
      key: 'key-supervision1',
      value: 'value-supervision1',
    };
    const attributeCategory: KeyValueInput = {
      key: 'key-category1',
      value: 'value-category1',
    };
    const attributeProcurementMethod: KeyValueInput = {
      key: 'key-procurement1',
      value: 'value-procurement1',
    };

    service
      .queryMilestones(
        attributeCategory,
        attributeProcurementMethod,
        attributeSupervisionMethod
      )
      .toPromise()
      .then((response: GetSettingsResponse) => {
        expect(response).toEqual(getSettingsResponse);
      });

    expect(settingsSpy).toHaveBeenCalled();
    expect(buildAttributesArraySpy).toHaveBeenCalledWith(
      SettingType.Milestone,
      null,
      attributeCategory,
      attributeProcurementMethod,
      null,
      attributeSupervisionMethod
    );

    tick();
  }));
});

const enumType = [
  {
    id: 0,
    name: 'PROCUREMENT.CATEGORIES.PROCT_CSTFRM',
  },
  {
    id: 1,
    name: 'PROCUREMENT.CATEGORIES.PROCT_EXT_AUDIT',
  },
  {
    id: 2,
    name: 'PROCUREMENT.CATEGORIES.PROCT_GOODS',
  },
  {
    id: 3,
    name: 'PROCUREMENT.CATEGORIES.PROCT_INDCST',
  },
  {
    id: 4,
    name: 'PROCUREMENT.CATEGORIES.PROCT_NCSVC',
  },
  {
    id: 5,
    name: 'PROCUREMENT.CATEGORIES.PROCT_WORKS',
  },
];

const mockDataDraft: BiddingProcessProcurementProcessDetail = {
  comments: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      comment: {
        createdBy: '',
        id: 'string',
        visibility: 0,
        source: 0,
        status: 0,
        text: 'string',
      },
    },
  ],
  milestones: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      status: 0,
      code: 0,
      order: 0,
      estimatedDate: new Date(),
      reEstimateDate: new Date(),
      actualDate: new Date(),
      packageStatus: DocumentPackagesStatus.NOT_STARTED,
    },
  ],
  outputs: {
    componentId: 'string',
    componentName: 'string',
    outputs: [
      {
        ouputId: 'string',
        ouputName: 'string',
        percentageAssigned: 0,
      },
    ],
  },
  process: {
    id: 'string',
    biddingProcessPlanId: 'string',
    category: {
      id: 0,
      name: '',
    },
    procurementMethod: {
      id: 0,
      name: '',
    },
    supervisionMethod: {
      id: 0,
      name: '',
    },
    status: BiddingProcessProcurementProcessStatuses.DRAFT,
    goodsReference: 0,
    sustainability: 0,
    code: 'string',
    name: 'string',
    description: 'string',
    justification: 'string',
    bafo: true,
    sepaPeclaId: 'string',
    totalAcumulatedAmount: 0,
    lots: 0,
    manualId: 'string',
    sustainabilityDescription: 'string',
    subExecutor: 'string',
    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    projectAmount: {
      cofinancedAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      localCounterpartAmount: 0,
    },
    componentName: 'string',
    totalComments: 0,
    isMigrated: true,
    packagesUnderReview: true,
    isUpdated: true,
    procurementProcessComments: [],
    order: 3,
  },
};

const mockDataCancelled: BiddingProcessProcurementProcessDetail = {
  comments: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      comment: {
        createdBy: '',
        id: 'string',
        visibility: 0,
        source: 0,
        status: 0,
        text: 'string',
      },
    },
  ],
  milestones: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      status: 0,
      code: 0,
      order: 0,
      estimatedDate: new Date(),
      reEstimateDate: new Date(),
      actualDate: new Date(),
      packageStatus: DocumentPackagesStatus.NOT_STARTED,
    },
  ],
  outputs: {
    componentId: 'string',
    componentName: 'string',
    outputs: [
      {
        ouputId: 'string',
        ouputName: 'string',
        percentageAssigned: 0,
      },
    ],
  },
  process: {
    id: 'string',
    biddingProcessPlanId: 'string',
    category: {
      id: 0,
      name: '',
    },
    procurementMethod: {
      id: 0,
      name: '',
    },
    supervisionMethod: {
      id: 0,
      name: '',
    },
    status: BiddingProcessProcurementProcessStatuses.CANCELLED,
    goodsReference: 0,
    sustainability: 0,
    code: 'string',
    name: 'string',
    description: 'string',
    justification: 'string',
    totalAcumulatedAmount: 0,
    bafo: true,
    sepaPeclaId: 'string',
    lots: 0,
    manualId: 'string',
    sustainabilityDescription: 'string',
    subExecutor: 'string',
    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    projectAmount: {
      cofinancedAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      localCounterpartAmount: 0,
    },
    componentName: 'string',
    totalComments: 0,
    isMigrated: true,

    packagesUnderReview: true,
    isUpdated: true,
    procurementProcessComments: [],
    order: 4,
  },
};

const procurementProcess: BiddingProcessProcurementProcess = {
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
    currentMilestone: null,
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
};

const dataMock: BiddingProcessProcurementProcessDetail = {
  comments: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      comment: {
        createdBy: '',
        id: 'string',
        visibility: 0,
        source: 0,
        status: 0,
        text: 'string',
      },
    },
  ],
  milestones: [
    {
      id: 'string',
      biddingProcessProcurementProcessId: 'string',
      status: 0,
      code: 0,
      order: 0,
      estimatedDate: new Date('2022-10-30T00:00:00.000'),
      reEstimateDate: new Date('2022-11-30T00:00:00.000'),
      actualDate: new Date('2022-12-30T00:00:00.000'),
      packageStatus: DocumentPackagesStatus.NOT_STARTED,
    },
  ],
  outputs: {
    componentId: 'string',
    componentName: 'string',
    outputs: [
      {
        ouputId: 'string',
        ouputName: 'string',
        percentageAssigned: 100,
      },
    ],
  },
  process: {
    id: 'string',
    biddingProcessPlanId: 'string',
    category: {
      id: 0,
      name: '',
    },
    procurementMethod: {
      id: 10,
      name: '',
    },
    supervisionMethod: {
      id: 100,
      name: '',
    },
    status: BiddingProcessProcurementProcessStatuses.CANCELLED,
    goodsReference: 0,
    sustainability: 0,
    code: 'string',
    name: 'string',
    description: 'string',
    justification: 'string',
    totalAcumulatedAmount: 0,
    bafo: true,
    sepaPeclaId: 'string',
    lots: 0,
    manualId: 'string',
    sustainabilityDescription: 'string',
    subExecutor: 'string',
    advanceMilestone: {
      total: 0,
      totalCompleted: 0,
      delayed: true,
      currentMilestone: null,
    },
    projectAmount: {
      cofinancedAmount: 0,
      estimatedAmount: 0,
      idbAmount: 0,
      localCounterpartAmount: 0,
    },
    componentName: 'string',
    totalComments: 0,
    isMigrated: true,
    packagesUnderReview: true,
    isUpdated: true,
    procurementProcessComments: [],
    order: 5,
  },
};
