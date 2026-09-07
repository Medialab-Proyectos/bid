import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  BiddingProcessDocumentPackage,
  BiddingProcessProcurementProcess,
  DialogResponse,
  ActionType,
  Enums,
  FiduciaryProcessDocumentGroup,
  ModalOptions,
  SubmitPackageStatusResponse,
} from '@core/models';
import {
  BiddingProcessDocumentPackagesApiService,
  WorkflowApiService,
} from '@core/services/apis';
import { TranslateService } from '@ngx-translate/core';
import { PermissionEnum } from '@core/enums/permission.enum';
import { Subscription, throwError } from 'rxjs';
import {
  BiddingProcessProcurementProcessStatuses,
  BiddingProcurementProcessSupervisionMethods,
  CategoryProcurement,
  DocumentGroupMandatoryPublicationEnum,
  DocumentPackagesStatus,
  FiduciaryProcessDocumentsStatusIdEnum,
  ProcurementMethod,
  WorkflowCommentStatusEnum,
  WorkflowEntityScreen,
  WorkflowIdEntityType,
  WorkflowModuleEnum,
} from '@core/enums';
import { WorkflowLaunchRequest } from '@core/models/requests/workflow-request.model';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { WorkflowSharedService } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/services';
import { BiddingProcessDocumentPackagesStoreService } from '@core/services/store-services/bidding-process-document-packages/bidding-process-document-packages-store.service';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import { Store } from '@ngrx/store';
import { AppStateWithUsrPreferences } from '@core/store';
import { DocumentsGenerateService } from '../../services/documents-generate.service';
import { FormStatusEnum } from '@fiduciary-interface/app/features/forms/enums/form-status.enum';
import { DocumentGroupCode } from '../../enums/groupCode.enum';
import { DocBtnsService } from './doc-btns.service';
import { BPBtnDictionary, BPBtnDictionaryAdditionalDodcs } from '../../models';
import { BPbtns } from '../../enums';
import { GroupCodeEnum } from '@core/enums/groupCode.enum';
import { BussinessRulesFunctionEnum } from '@fiduciary-interface/app/features/forms/enums/bussiness-rules-form.enum';
import { ProjectStoreService } from '@core/services/store-services';
import { PopupNotificationService } from '@fiduciary-interface/app/shared/services/popup.service';
import { NotificationsService } from '@fiduciary-interface/app/shared/services/notifications.service';
import {
  DocumentPackageCode,
  DocumentPackageCodeToNoticeType,
  DocumentPackageName,
} from '@core/enums/documentPackageCode.enum';
import { ModalService } from '@fiduciary-interface/app/shared/services/modal.service';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { UboService } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/services/ubo.service';
import { FileService } from '@fiduciary-interface/app/shared/services/file.service';

import { EoiApiService } from '@core/services/apis/fiduciary-process-api/eoi-api/eoi-api.service';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import {
  ConfirmCancelDialogComponent,
  ConfirmCancelDialogData,
} from '../../../confirm-cancel-dialog/confirm-cancel-dialog.component';
@Component({
  selector: 'fi-doc-btns',
  templateUrl: './doc-btns.component.html',
})
export class DocBtnsComponent implements OnInit, OnDestroy {
  constructor(
    readonly notificationGlobalService: NotificationGlobalService,
    public readonly translate: TranslateService,
    readonly documentPackageStore: BiddingProcessDocumentPackagesStoreService,
    private readonly documentsPackageSvc: BiddingProcessDocumentPackagesApiService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly wokflowSvc: WorkflowApiService,
    private readonly workflowSharedSvc: WorkflowSharedService,
    private readonly storePreferences: Store<AppStateWithUsrPreferences>,
    readonly documentsGenerate: DocumentsGenerateService,
    public readonly router: Router,
    readonly projectStore: ProjectStoreService,
    private readonly btnsSvc: DocBtnsService,
    readonly popupService: PopupNotificationService,
    readonly notificationService: NotificationsService,
    readonly fiModalSvc: ModalService,
    readonly permissionSvc: PermissionService,
    private readonly uboSvc: UboService,
    readonly fileSvc: FileService,
    private eoiApiService: EoiApiService,
    private matDialogService: MatDialog
  ) {}

  sendNotificationUploadedPermission: PermissionEnum[] = [
    PermissionEnum.SEND_INTERNAL_NOTIFICATIONS,
  ];

  public sendAdditionalInfoPermission = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  public workAroundPemission = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];

  BPBtnDictionaryAdditional: BPBtnDictionaryAdditionalDodcs = {
    Confirm: {
      showBtn: undefined,
      disableBtn: undefined,
      permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
      key: 'PROCESS_DOC.DOC_BTNS.CONFIRM_PACKAGES',
      btnActionFunction: () => {
        this.confirmPackageAdditional();
      },
      tooltip: '',
      disabledDocumentUploadedBtn: undefined,
      showDocumentUploaded: undefined,
    },
    NonObjection: {
      showBtn: undefined,
      disableBtn: undefined,
      permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
      key: 'PROCESS_DOC.DOC_BTNS.REQUEST_NO_OBJECTION',
      btnActionFunction: () => {
        this.submitForNonObjectionAdditional();
      },
      tooltip: '',
      disabledDocumentUploadedBtn: undefined,
      showDocumentUploaded: undefined,
    },
  };

  BPBtnDictionary: BPBtnDictionary = {
    Confirm: {
      showDocumentUploaded: undefined,
      showBtn: undefined,
      disableBtn: undefined,
      disabledDocumentUploadedBtn: undefined,
      permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
      key: 'PROCESS_DOC.DOC_BTNS.CONFIRM_PACKAGES',
      btnActionFunction: () => {
        this.confirmPackage(ActionType.CONFIRM);
      },
      tooltip: '',
    },
    ConfirmAmendment: {
      showDocumentUploaded: undefined,
      showBtn: undefined,
      disableBtn: undefined,
      disabledDocumentUploadedBtn: undefined,
      permission: [
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
      ],
      key: 'PROCESS_DOC.DOC_BTNS.CONFIRM_AMENDMENT_UPLOAD',
      btnActionFunction: () => {
        this.confirmPackage(ActionType.CONFIRM_AMENDMENT);
      },
      tooltip: '',
    },
    ConfirmClarificationUpload: {
      showDocumentUploaded: undefined,
      showBtn: undefined,
      disableBtn: undefined,
      disabledDocumentUploadedBtn: undefined,
      permission: [
        PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
      ],
      key: 'PROCESS_DOC.DOC_BTNS.CONFIRM_CLARIFICATION_UPLOAD',
      btnActionFunction: () => {
        this.confirmPackage(ActionType.CONFIRM_CLARIFICATION);
      },
      tooltip: '',
    },
    Disclosure: {
      showDocumentUploaded: undefined,
      showBtn: undefined,
      disableBtn: undefined,
      disabledDocumentUploadedBtn: undefined,
      permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
      key: 'PROCESS_DOC.DOC_BTNS.SUBMIT_FOR_DISCLOSURE',
      btnActionFunction: () => {
        this.submitForDisclosure();
      },
      tooltip: '',
    },
    NonObjection: {
      showDocumentUploaded: undefined,
      showBtn: undefined,
      disableBtn: undefined,
      disabledDocumentUploadedBtn: undefined,
      permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
      key: 'PROCESS_DOC.DOC_BTNS.REQUEST_NO_OBJECTION',
      btnActionFunction: () => {
        this.submitForNonObjection(ActionType.NON_OBJECTION);
      },
      tooltip: '',
    },
    RequestAmendment: {
      showDocumentUploaded: undefined,
      showBtn: undefined,
      disableBtn: undefined,
      disabledDocumentUploadedBtn: undefined,
      permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
      key: 'PROCESS_DOC.DOC_BTNS.AMENDMENT_NONOBJECTION',
      btnActionFunction: () => {
        this.submitForNonObjection(ActionType.NON_OBJECTION_AMENDMENT);
      },
      tooltip: '',
    },
  };
  BPBtnKeys: string[];
  BPBtnKeysAdditionals: string[];

  private readonly suscription = new Subscription();

  @Input() statusForm?: FormStatusEnum;
  @Input() groups?: FiduciaryProcessDocumentGroup[] = [];
  @Input() projectBucketId: string;
  @Input() projectContractId: string;
  @Input() instAcronym: string;
  @Input() procurementProcess: BiddingProcessProcurementProcess;
  @Input() docPackage: BiddingProcessDocumentPackage;
  @Input() supervisionMethod: BiddingProcurementProcessSupervisionMethods;
  @Input() footerVisibility: boolean;
  @Input() documentPackages: BiddingProcessDocumentPackage[];
  @Input() docIndex: number;
  @Input() participantsDisabled = false;
  @Input() additionalDocs: boolean;
  @Input() originalBidValidityDate: Date = null;
  @Input() set selectedBidValidityDate(value: boolean) {
    this.selectedBidValidity = value;
    this.selectedBidValidity = this.handleBidValidityDate();
    if (this.checkUpdateTooltipValidation()) {
      this.updateTooltip(
        this.BPBtnDictionary,
        'PROCESS_DOC.DOC_BTNS.BID_VALIDITY_EXTENSION_DATE_REQUIRED'
      );
    }
  }
  @Input() hasUboDocumentGroup: boolean = false;

  selectedBidValidity = true;
  tooltipKey: string = '';
  workAround = false;
  fileId: string;
  isDiscloseInProgress = false;

  isAllMandatoryDocsUploaded: boolean;
  hasNotPreviousPackageStatusAmendmentUnderReview: boolean;
  @Input() index: number;
  @Output() isBtnClicked = new EventEmitter<number>();
  @Output() completeDocs = new EventEmitter<number>();
  @Output() closePackage = new EventEmitter<number>();
  biddingProcessProcurementProcessId: string;
  totalPlannedAmount: number;
  showBtnSpnCategoryGoods = false;

  selectedLanguage: string;
  disableEOI = false;
  display = false;
  groupEnum: string;
  resultBrEnums = BussinessRulesFunctionEnum;
  documentPackageCode = DocumentPackageCode;
  eoiDeadline = '';

  canSendToPublishUndbNotice: PermissionEnum[] = [
    PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS,
  ];

  ngOnInit(): void {
    this.getCurrentLang();
    this.getEoiDeadlineDate();
    this.groupEnum = Enums.biddingProcessDocumentGroupCodes;
    this.biddingProcessProcurementProcessId =
      this.activatedRoute.snapshot.params.processId;

    if (this.biddingProcessProcurementProcessId) {
      this.btnsSvc.getButtonsVisiblity(
        this.docPackage,
        this.procurementProcess,
        this.BPBtnDictionary,
        this.documentPackages,
        this.participantsDisabled
      );
      this.BPBtnKeys = Object.keys(this.BPBtnDictionary);
      if (this.checkUpdateTooltipValidation()) {
        this.updateTooltip(
          this.BPBtnDictionary,
          'PROCESS_DOC.DOC_BTNS.BID_VALIDITY_EXTENSION_DATE_REQUIRED'
        );
      }
      this.display = true;
    }

    if (
      [
        ProcurementMethod.PROCT_DCS_ADIR,
        ProcurementMethod.PROCT_SSSIC_ADIR,
        ProcurementMethod.PROCT_SSS_ADIR,
      ].includes(this.procurementProcess.procurementMethod.id)
    ) {
      this.BPBtnDictionary.NonObjection.key =
        'PROCESS_DOC.DOC_BTNS.REQUEST_APPROVAL';
    }

    if (
      this.procurementProcess !== undefined &&
      this.procurementProcess.category.name === CategoryProcurement.PROCT_GOODS
    ) {
      this.showBtnSpnCategoryGoods = true;
    }
    this.groupEnum = Enums.biddingProcessDocumentGroupCodes;
    this.disableEOI = this.checkEINDocumentType();
    this.BPBtnKeysAdditionals = Object.keys(this.BPBtnDictionaryAdditional);
    if (this.additionalDocs) {
      this.checkOptionalBtnsVisibility();
    }
    this.checkWorkAroundBtn();
  }

  updateTooltip(obj: BPBtnDictionary, newTooltip: string): void {
    for (let key in obj) {
      if (obj[key].showBtn) {
        obj[key].tooltip = newTooltip;
      }
    }
  }

  checkUpdateTooltipValidation(): boolean {
    return !this.selectedBidValidity && this.checkSeeTooltipPermission();
  }

  checkSeeTooltipPermission(): boolean {
    return this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
  }

  checkOptionalBtnsVisibility() {
    if (
      !this.checkProcurementProcessStatus(this.procurementProcess) &&
      this.checkPackageStatus(this.docPackage)
    ) {
      if (this.checkIsNotExante(this.procurementProcess)) {
        //show confirm
        this.BPBtnDictionaryAdditional.Confirm.showBtn = true;
        this.BPBtnDictionaryAdditional.Confirm.disableBtn =
          this.btnsSvc.getAdditionalPackageEnableBtn(this.docPackage);
      } else {
        if (
          this.getFirstPackageValidity(
            this.documentPackages,
            this.docPackage
          ) &&
          this.checkDatesValidity()
        ) {
          //show confirm
          this.BPBtnDictionaryAdditional.Confirm.showBtn = true;
          this.BPBtnDictionaryAdditional.Confirm.disableBtn =
            this.btnsSvc.getAdditionalPackageEnableBtn(this.docPackage);
        } else {
          this.BPBtnDictionaryAdditional.NonObjection.showBtn = true;
          this.BPBtnDictionaryAdditional.NonObjection.disableBtn =
            this.btnsSvc.getAdditionalPackageEnableBtn(this.docPackage);
        }
      }
    }
  }

  checkIsNotExante(
    procurementProcess: BiddingProcessProcurementProcess
  ): boolean {
    return (
      procurementProcess.supervisionMethod.id !==
      BiddingProcurementProcessSupervisionMethods.EX_ANTE
    );
  }
  checkAnyDateNull(): boolean {
    if (
      !this.originalBidValidityDate ||
      !this.docPackage.bidValidityExtensionDate
    ) {
      return true;
    }
    return false;
  }

  checkDatesValidity(): boolean {
    if (
      !this.originalBidValidityDate ||
      !this.docPackage.bidValidityExtensionDate
    ) {
      return true;
    } else {
      return !this.isMoreThan28Days();
    }
  }

  isMoreThan28Days(): boolean {
    let bidValidityExtensionDate = this.docPackage.bidValidityExtensionDate
      ? new Date(this.docPackage.bidValidityExtensionDate)
      : null;
    let originalBidValidityDate = this.originalBidValidityDate
      ? new Date(this.originalBidValidityDate)
      : null;
    bidValidityExtensionDate?.setHours(0, 0, 0, 0);
    originalBidValidityDate?.setHours(0, 0, 0, 0);
    const differenceMs = Math.abs(
      bidValidityExtensionDate?.getTime() - originalBidValidityDate?.getTime()
    );
    const daysDiff = differenceMs / (1000 * 60 * 60 * 24);

    return daysDiff >= 28;
  }

  getFirstPackageValidity(
    documentPackages: BiddingProcessDocumentPackage[],
    docPackage: BiddingProcessDocumentPackage
  ): boolean {
    if (documentPackages.length >= 1) {
      return (
        documentPackages.filter(
          (e) => e.code === DocumentGroupCode.BIDDINDG_DOC_BID_VALIDITY
        )[0].id === docPackage.id
      );
    } else {
      return documentPackages[0].id === docPackage.id;
    }
  }

  checkFirstCondition(procurementProcess: BiddingProcessProcurementProcess) {
    if (
      procurementProcess.supervisionMethod.id ===
        BiddingProcurementProcessSupervisionMethods.EX_ANTE &&
      this.documentPackages[0].code ===
        DocumentGroupCode.BIDDINDG_DOC_BID_VALIDITY
    ) {
    }
  }

  checkProcurementProcessStatus(
    procurementProcess: BiddingProcessProcurementProcess
  ): boolean {
    const allowedStatus = [
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];
    return allowedStatus.includes(procurementProcess?.status);
  }

  checkPackageStatus(docPackage: BiddingProcessDocumentPackage): boolean {
    const allowedPackageStatus = [
      DocumentPackagesStatus.NOT_STARTED,
      DocumentPackagesStatus.RETURNED,
    ];
    return allowedPackageStatus.includes(docPackage?.status);
  }

  getCurrentLang(): void {
    const sub = this.storePreferences
      .select('preferences')
      .subscribe((data) => {
        if (data.preferences.preferredLanguage) {
          this.selectedLanguage = data.preferences.preferredLanguage;
        }
      });
    this.suscription.add(sub);
  }

  checkEINDocumentType(): boolean {
    let exists = false;
    this.btnsSvc.getMandatoryGroups(this.docPackage).forEach((el) => {
      if (
        el.documentGroupCode === DocumentGroupCode.EXPRESSION_INTEREST_NOTICE &&
        el.fiduciaryProcessDocuments &&
        el.fiduciaryProcessDocuments.length > 0
      ) {
        exists = true;
      }
    });
    return exists;
  }

  getResultDocumentPackage(): number {
    return this.docPackage?.biddingProcessDocumentGroups?.find(
      (g) => g.documentGroupConfiguration.isResult
    )?.documentGroupConfiguration.result;
  }

  submitForNonObjection(type: ActionType): void {
    this.btnClicked();
    if (this.docPackage.actualDate === null) {
      this.showErrorToast('PROCESS_DOC.DOC_BTNS.ACTUAL_DATE_NOT_FILLED');
    } else {
      const sub = this.uboSvc
        .checkBiddersSignaturesPackage(
          this.biddingProcessProcurementProcessId,
          this.hasUboDocumentGroup
        )
        .subscribe((missingSignatures) => {
          if (missingSignatures.length > 0) {
            const names = missingSignatures.join(', ');
            const errorMsg = `${this.translate.instant(
              'PROCESS_DOC.UBO.MISSING_SIGNATURES.PART_1'
            )}${names} ${this.translate.instant(
              'PROCESS_DOC.UBO.MISSING_SIGNATURES.PART_2'
            )}`;
            this.showErrorToast(errorMsg);
          } else {
            this.openModalCommentWorkflow().subscribe((comment) => {
              this.documentPackageStore.changeDocumentPackageStatusAction(
                this.biddingProcessProcurementProcessId,
                this.docPackage.id
              );

              const result = this.getResultDocumentPackage();
              const launchReq: WorkflowLaunchRequest = {
                entityTypeId: this.docPackage.id,
                isInternalVisibility: true,
                projectBucketId: this.projectBucketId,
                packageId: this.docPackage.id,
                instAcronym: this.instAcronym,
                businessRulesRequest: {
                  factors: {
                    workflowSection:
                      !!result && (result == 1 || result == 2)
                        ? WorkflowEntityScreen.DOC_UNSUCESSFULL_PROC
                        : WorkflowEntityScreen.DOC_PACKAGES,
                    categoryCode: this.procurementProcess?.category.name,
                    procurementCode:
                      this.procurementProcess?.procurementMethod.name,
                  },
                },
                workflowComment: {
                  text: comment,
                  visibility: true,
                  status: WorkflowCommentStatusEnum.COMPLETED,
                },
              };

              if (!!result) {
                launchReq.businessRulesRequest.factors.resultPackageType =
                  String(result);
              }

              const totalAmount =
                this.procurementProcess?.projectAmount.estimatedAmount;
              if (!Number.isNaN(totalAmount)) {
                launchReq.businessRulesRequest.factors.totalAmountProcurementProcess =
                  String(totalAmount);
              }
              this.suscription.add(
                this.workflowSharedSvc
                  .getFirstRoleName()
                  .subscribe((firstRoleName) => {
                    launchReq.role = firstRoleName;
                    this.wokflowSvc
                      .lauchWorkflow(
                        launchReq,
                        this.selectedLanguage,
                        WorkflowModuleEnum.BIDDING_PROCESS
                      )
                      .pipe(
                        mergeMap((_) =>
                          this.documentsPackageSvc.submitPackageForNonObjection(
                            this.docPackage.id,
                            type
                          )
                        ),
                        tap((response: SubmitPackageStatusResponse) => {
                          this.BPBtnDictionary[BPbtns.NonObjection].disableBtn =
                            true;

                          this.workflowSharedSvc.loadActions(
                            {
                              body: {
                                idEntityType:
                                  WorkflowIdEntityType.DOCUMENT_PACKAGE,
                                entityTypeId: launchReq.entityTypeId,
                                projectBucketId: launchReq.projectBucketId,
                              },
                              projectContractId: this.projectContractId,
                              instAcronym: launchReq.instAcronym,
                            },
                            {
                              docPackageStatus: response.status,
                            }
                          );
                        })
                      )
                      .subscribe({
                        next: (response: SubmitPackageStatusResponse) => {
                          this.successResponse(response);
                          this.reload();
                        },
                        error: () => {
                          this.showErrorToast();
                        },
                      });
                  })
              );
            });
          }
        });
      this.suscription.add(sub);
    }
  }

  openModalCommentWorkflow() {
    return this.fiModalSvc.openWorkFlowCommentsModal(
      'WORKFLOWS.COMMENTS_MODAL.PROCUREMENT.PROCESS.TITLE',
      [
        { text: 'WORKFLOWS.COMMENTS_MODAL.PROCUREMENT.PROCESS.CANCEL.BTN' },
        {
          text: 'WORKFLOWS.COMMENTS_MODAL.PROCUREMENT.PROCESS.CONFIRM_BTN',
          cssClass: 'k-primary',
        },
      ],
      [
        {
          key: 'WORKFLOWS.COMMENTS_MODAL.PROCUREMENT.PROCESS.TEXT',
          bold: false,
        },
      ]
    );
  }

  submitForDisclosure(): void {
    this.btnClicked();
    if (this.docPackage.actualDate === null) {
      this.showErrorToast('PROCESS_DOC.DOC_BTNS.ACTUAL_DATE_NOT_FILLED');
    } else {
      this.documentPackageStore.changeDocumentPackageStatusAction(
        this.biddingProcessProcurementProcessId,
        this.docPackage.id
      );
      this.documentsPackageSvc
        .submitPackageForDisclosure(this.docPackage.id)
        .subscribe(
          (response: SubmitPackageStatusResponse) => {
            this.BPBtnDictionary[BPbtns.Disclosure].disableBtn = true;
            this.successResponse(response);
            this.reload();
          },
          () => {
            this.showErrorToast();
          }
        );
    }
  }

  confirmPackageAdditional(): void {
    this.btnClicked();
    if (this.docPackage.actualDate === null) {
      this.showErrorToast('PROCESS_DOC.DOC_BTNS.ACTUAL_DATE_NOT_FILLED');
    }
    if (this.docPackage.bidValidityExtensionDate === null) {
      this.showErrorToast('PROCESS_DOC.DOC_BTNS.BID_EXTENSION_DATE_NOT_FILLED');
    }
    if (
      this.docPackage.actualDate !== null &&
      this.docPackage.bidValidityExtensionDate !== null
    ) {
      this.documentPackageStore.changeDocumentPackageStatusAction(
        this.biddingProcessProcurementProcessId,
        this.docPackage.id
      );
      this.documentsPackageSvc
        .completePackage(this.docPackage.id, this.additionalDocs)
        .subscribe({
          next: () => {
            this.BPBtnDictionaryAdditional[BPbtns.Confirm].disableBtn = true;
            this.showSuccessToast();
            this.reload();
          },
          error: () => {
            this.showErrorToast();
          },
        });
    }
  }

  submitForNonObjectionAdditional(): void {
    this.btnClicked();
    if (this.docPackage.actualDate === null) {
      this.showErrorToast('PROCESS_DOC.DOC_BTNS.ACTUAL_DATE_NOT_FILLED');
    }
    if (this.docPackage.bidValidityExtensionDate === null) {
      this.showErrorToast('PROCESS_DOC.DOC_BTNS.BID_EXTENSION_DATE_NOT_FILLED');
    }
    this.openModalCommentWorkflow().subscribe((comment) => {
      if (
        this.docPackage.actualDate !== null &&
        this.docPackage.bidValidityExtensionDate !== null
      ) {
        this.documentPackageStore.changeDocumentPackageStatusAction(
          this.biddingProcessProcurementProcessId,
          this.docPackage.id
        );

        const result = this.getResultDocumentPackage();
        const launchReq: WorkflowLaunchRequest = {
          entityTypeId: this.docPackage.id,
          isInternalVisibility: true,
          projectBucketId: this.projectBucketId,
          packageId: this.docPackage.id,
          instAcronym: this.instAcronym,
          businessRulesRequest: {
            factors: {
              workflowSection: WorkflowEntityScreen.BID_VALIDITY_EXTENSION,
              categoryCode: this.procurementProcess?.category.name,
              procurementCode: this.procurementProcess?.procurementMethod.name,
            },
          },
          workflowComment: {
            text: comment,
            visibility: true,
            status: WorkflowCommentStatusEnum.COMPLETED,
          },
        };

        if (!!result) {
          launchReq.businessRulesRequest.factors.resultPackageType =
            String(result);
        }

        const totalAmount =
          this.procurementProcess?.projectAmount.estimatedAmount;
        if (!Number.isNaN(totalAmount)) {
          launchReq.businessRulesRequest.factors.totalAmountProcurementProcess =
            String(totalAmount);
        }

        this.workflowSharedSvc
          .getFirstRoleName()
          .pipe(take(1))
          .subscribe((firstRoleName) => {
            launchReq.role = firstRoleName;
            this.wokflowSvc
              .lauchWorkflow(
                launchReq,
                this.selectedLanguage,
                WorkflowModuleEnum.BIDDING_PROCESS
              )
              .pipe(
                mergeMap((_) =>
                  this.documentsPackageSvc.submitOptionalPackage(
                    this.docPackage.id
                  )
                ),
                tap(() => {
                  this.BPBtnDictionaryAdditional[
                    BPbtns.NonObjection
                  ].disableBtn = true;

                  this.workflowSharedSvc.loadActions(
                    {
                      body: {
                        idEntityType: WorkflowIdEntityType.DOCUMENT_PACKAGE,
                        entityTypeId: launchReq.entityTypeId,
                        projectBucketId: launchReq.projectBucketId,
                      },
                      projectContractId: this.projectContractId,
                      instAcronym: launchReq.instAcronym,
                    },
                    {
                      docPackageStatus: DocumentPackagesStatus.COMPLETE,
                    }
                  );
                })
              )
              .subscribe({
                next: () => {
                  this.reload();
                },
                error: () => this.showErrorToast(),
              });
          });
      }
    });
  }

  confirmPackage(type: ActionType): void {
    // This is specific for EOI package
    if (this.docPackage.code === this.documentPackageCode.EOI) {
      const eoiDocGroup = this.getDocGroup(GroupCodeEnum.EOI);
      const eoiDoc = eoiDocGroup?.fiduciaryProcessDocuments.find(
        (doc) => doc.groupCode === GroupCodeEnum.EOI
      );
      let isMandatoryOptional = [
        DocumentGroupMandatoryPublicationEnum.OPTIONAL,
        DocumentGroupMandatoryPublicationEnum.YES,
      ].includes(
        eoiDocGroup?.documentGroupConfiguration.isMandatoryPublication
      );

      if (eoiDoc?.noticeCode && isMandatoryOptional && this.eoiDeadline) {
        if (!this.isNoticeDeadlineValid(this.eoiDeadline)) {
          this.onInvalidNoticeDeadline(eoiDoc.noticeId);
          return;
        }
      }
    }

    this.btnClicked();
    if (this.docPackage.actualDate === null) {
      this.showErrorToast('PROCESS_DOC.DOC_BTNS.ACTUAL_DATE_NOT_FILLED');
    } else {
      this.uboSvc
        .checkBiddersSignaturesPackage(
          this.biddingProcessProcurementProcessId,
          this.hasUboDocumentGroup
        )
        .pipe(
          switchMap((missingSignatures: string[]) => {
            if (missingSignatures.length > 0) {
              const names = missingSignatures.join(', ');
              const errorMsg = `${this.translate.instant(
                'PROCESS_DOC.UBO.MISSING_SIGNATURES.PART_1'
              )}${names} ${this.translate.instant(
                'PROCESS_DOC.UBO.MISSING_SIGNATURES.PART_2'
              )}`;
              this.showErrorToast(errorMsg);
              return throwError(() => new Error(''));
            } else {
              this.documentPackageStore.changeDocumentPackageStatusAction(
                this.biddingProcessProcurementProcessId,
                this.docPackage.id
              );
              return this.documentsPackageSvc.completePackage(
                this.docPackage.id,
                this.additionalDocs,
                type
              );
            }
          })
        )
        .subscribe({
          next: () => {
            this.BPBtnDictionary[BPbtns.Confirm].disableBtn = true;
            this.showSuccessToast();
            this.reload();
          },
          error: () => {
            this.showErrorToast();
          },
        });
    }
  }

  btnClicked(): void {
    this.isBtnClicked.emit(this.index);
  }

  successResponse(response: SubmitPackageStatusResponse): void {
    this.showSuccessToast();
    this.documentPackageStore.changeDocumentPackageStatusSuccessAction(
      this.biddingProcessProcurementProcessId,
      this.docPackage.id,
      response.status
    );
  }

  showSuccessToast(): void {
    const successMessage = this.translate.instant(
      'PROCESS_DOC.DOC_BTNS.SUCESS_SUBMIT_PACKAGE'
    );
    this.notificationGlobalService.showSuccess(successMessage);
  }

  showErrorToast(msg: string = null): void {
    let errorMsg = msg;
    if (msg === null) {
      errorMsg = this.translate.instant(
        'PROCESS_DOC.DOC_BTNS.ERROR_SUBMIT_PACKAGE'
      );
    } else {
      errorMsg = this.translate.instant(errorMsg);
    }
    this.notificationGlobalService.showError(errorMsg);
    this.documentPackageStore.changeDocumentPackageStatusErrorAction(
      this.biddingProcessProcurementProcessId,
      this.docPackage.id
    );
  }

  reload(): void {
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.suscription.unsubscribe();
  }

  sendNotification(): void {
    this.popupService
      .handleNotificationModal()
      .pipe(
        filter((data: DialogResponse) => data.result === ModalOptions.ACCEPT),
        switchMap(() => {
          return this.notificationService.sendNotification({
            EntityType: WorkflowIdEntityType.DOCUMENT_PACKAGE,
            Id: this.docPackage.id,
            ProjectBucketId: this.projectBucketId,
          });
        }),
        take(1)
      )
      .subscribe(
        () => {
          this.notificationService.successMsg();
          this.closePackage.emit(this.docIndex);
        },
        () => {
          this.notificationService.errorMsg();
        }
      );
  }

  additionalDocAction(): void {
    this.completeDocs.emit(this.docIndex);
  }

  handleBidValidityDate() {
    return !(
      (this.docPackage.code ===
        DocumentPackageName.BIDDING_PACKAGES_BID_OPEN_RECORD ||
        this.docPackage.code ===
          DocumentPackageName.BIDDING_PACKAGES_BID_OPEN_RECORD_TECHNICAL) &&
      this.selectedBidValidity === false
    );
  }

  //TODO REVISAR ULTIMO AVISO

  checkWorkAroundBtn() {
    const groupNotSpn = this.docPackage.biddingProcessDocumentGroups.find((g) =>
      [
        GroupCodeEnum.EOI,
        GroupCodeEnum.NOA_FIRMS,
        GroupCodeEnum.NOA_GOODS,
        GroupCodeEnum.NOA_INT,
      ].includes(g.documentGroupCode)
    );

    const groupSpn = this.docPackage.biddingProcessDocumentGroups.find((g) =>
      [GroupCodeEnum.PV_SPN].includes(g.documentGroupCode)
    );
    if (!!groupSpn && this.docPackage.code === DocumentPackageCode.SPN) {
      const fileSpn = groupSpn?.fiduciaryProcessDocuments?.find(
        (doc) => !doc.publicationDate && doc.ezshareNumber
      );
      this.fileId = fileSpn?.id;
      this.workAround = !!(
        fileSpn && this.docPackage.status === DocumentPackagesStatus.COMPLETE
      );
      return;
    }
    if (!groupNotSpn) {
      this.workAround = false;
      return;
    }

    if (groupNotSpn.documentGroupCode === GroupCodeEnum.EOI) {
      const docsAmendment = groupNotSpn.fiduciaryProcessDocuments
        .filter((doc) => doc.noticeVersion !== null)
        .sort((a, b) => a.noticeVersion - b.noticeVersion);

      const lastMatchingDoc =
        docsAmendment.length > 0
          ? !!docsAmendment[docsAmendment.length - 1].ezshareNumber &&
            docsAmendment[docsAmendment.length - 1].noticeStatus.id ===
              FiduciaryProcessDocumentsStatusIdEnum.CONFIRMED
            ? docsAmendment[docsAmendment.length - 1]
            : null
          : null;

      this.fileId = lastMatchingDoc?.id || null;

      this.workAround = !!(
        lastMatchingDoc &&
        (this.docPackage.status === DocumentPackagesStatus.COMPLETE ||
          this.docPackage.status === DocumentPackagesStatus.COMPLETE_AMENDMENT)
      );

      return;
    }

    if (
      [
        GroupCodeEnum.NOA_FIRMS,
        GroupCodeEnum.NOA_GOODS,
        GroupCodeEnum.NOA_INT,
      ].includes(groupNotSpn.documentGroupCode)
    ) {
      const noaFile = groupNotSpn.fiduciaryProcessDocuments.find(
        (doc) =>
          doc.ezshareNumber &&
          doc.noticeStatus.id ===
            FiduciaryProcessDocumentsStatusIdEnum.CONFIRMED
      );
      this.fileId = noaFile?.id;
      this.workAround = noaFile && !noaFile.publicationDate;
      return;
    }
  }

  disclose() {
    const noticeType = DocumentPackageCodeToNoticeType[this.docPackage.code];

    this.isDiscloseInProgress = true;
    this.fileSvc
      .disclose(this.procurementProcess.id, this.fileId, noticeType || null)
      .subscribe({
        next: () => {
          const message = this.translate.instant('UNDB.PUBLISH_SUCCESS');
          this.notificationGlobalService.showSuccess(message);
        },
        error: () => {
          const message = this.translate.instant('UNDB.PUBLISH_ERROR');
          this.notificationGlobalService.showError(message);
        },
        complete: () => {
          this.isDiscloseInProgress = false;
          this.closePackage.emit(this.docIndex);
        },
      });
  }

  getDocGroup(groupCode: GroupCodeEnum) {
    if (!groupCode) return;
    return this.groups.find((group) => group.groupCode === groupCode);
  }

  /**
   * Checks if the Notice deadline is before 14 days from now
   */
  isNoticeDeadlineValid(deadline: string) {
    const eoiDeadline = moment(deadline);
    const fourteenDaysFromNow = moment(new Date()).add(14, 'days');

    return eoiDeadline.isSameOrAfter(fourteenDaysFromNow, 'days');
  }

  onInvalidNoticeDeadline(noticeId: string) {
    const dialogData: ConfirmCancelDialogData = {
      headerEnum: 'UNDB.DOCUMENT_PACKAGES.REVIEW_AND_PUBLISH_MODAL.HEADER',
      bodyTextEnum: 'UNDB.DOCUMENT_PACKAGES.REVIEW_AND_PUBLISH_MODAL.BODY',
      confirmButtonEnum:
        'UNDB.DOCUMENT_PACKAGES.REVIEW_AND_PUBLISH_MODAL.CONFIRM_BTN',
      cancelButtonEnum: 'ANT_TRANSACTION.CANCEL',
    };
    const dialog = this.matDialogService.open(ConfirmCancelDialogComponent, {
      data: dialogData,
    });

    dialog.afterClosed().subscribe((action) => {
      if (action)
        this.router.navigate([this.docPackage.id, 'eoi', noticeId, 'update'], {
          relativeTo: this.activatedRoute,
        });
    });
  }

  showEoiPublishButton() {
    const isEoiPackage = this.docPackage.code === DocumentPackageCode.EOI;
    const eoiDocGroup = this.getDocGroup(GroupCodeEnum.EOI);
    const isMandatoryOrOptional = [
      DocumentGroupMandatoryPublicationEnum.YES,
      DocumentGroupMandatoryPublicationEnum.OPTIONAL,
    ].includes(eoiDocGroup?.documentGroupConfiguration.isMandatoryPublication);
    const isUndbDoc = eoiDocGroup?.fiduciaryProcessDocuments.find(
      (doc) => !!doc.noticeId
    );
    return isEoiPackage && isMandatoryOrOptional && isUndbDoc;
  }

  isPublishButtonDisabled() {
    const eoiDocGroup = this.getDocGroup(GroupCodeEnum.EOI);
    let isPackageStarted = this.docPackage.status !== 1;
    return (
      eoiDocGroup?.fiduciaryProcessDocuments.length === 0 && !isPackageStarted
    );
  }

  goToEoiPreview() {
    // We check the eoi date if its less than 14 days from now we should pop the modal indicating the issue
    const eoiDocGroup = this.getDocGroup(GroupCodeEnum.EOI);
    const eoiDoc = eoiDocGroup.fiduciaryProcessDocuments.find(
      (doc) => doc.groupCode === GroupCodeEnum.EOI
    );

    this.eoiApiService
      .getEoiById(eoiDoc.noticeId)
      .pipe(
        map((res) => {
          /*  let mockInvalid = moment(res.receptionDeadLine).subtract(1, 'day'); */
          return this.isNoticeDeadlineValid(res.receptionDeadLine);
        }),
        tap((isAfter14DaysFromNow) => {
          if (!isAfter14DaysFromNow) {
            this.onInvalidNoticeDeadline(eoiDoc.noticeId);
            return;
          }

          // If deadline is valid
          this.router.navigate(
            [this.docPackage.id, 'eoi', 'preview', eoiDoc.noticeId],
            {
              relativeTo: this.activatedRoute,
            }
          );
        })
      )
      .subscribe();
  }

  getEoiDeadlineDate() {
    const eoiDocGroup = this.getDocGroup(GroupCodeEnum.EOI);
    const eoiDoc = eoiDocGroup?.fiduciaryProcessDocuments.find(
      (doc) => doc.groupCode === GroupCodeEnum.EOI
    );
    let isMandatoryOptional = [
      DocumentGroupMandatoryPublicationEnum.OPTIONAL,
      DocumentGroupMandatoryPublicationEnum.YES,
    ].includes(eoiDocGroup?.documentGroupConfiguration.isMandatoryPublication);
    if (eoiDoc?.noticeCode && isMandatoryOptional) {
      this.eoiApiService
        .getEoiById(eoiDoc.noticeId)
        .subscribe((res) => (this.eoiDeadline = res.receptionDeadLine));
    }
  }
}
