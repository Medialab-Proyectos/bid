import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormControl,
  UntypedFormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  PermissionEnum,
  DocumentPackagesStatus,
  DocEnum,
  BiddingProcurementProcessSupervisionMethods,
  DocVisibility,
  DocumentPackageStatusEnum,
  BiddingProcessProcurementProcessStatuses,
  BiddingProcessPlanStatus,
  DocumentGroupMandatoryPublicationEnum,
} from '@core/enums';
import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  BiddingProcessPlan,
  BiddingProcessProcurementProcess,
  Enumerator,
  FiduciaryProcessDocument,
  FiduciaryProcessDocumentGroup,
  Group,
} from '@core/models';
import { EventDocument } from '@fiduciary-interface/app/features/procurement/features/procurement-process/features/process-doc-packages/models/event-document.model';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BiddingProcessDocumentPackagesStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { TranslateService } from '@ngx-translate/core';
import { ModalService } from '@fiduciary-interface/app/shared/services/modal.service';
import { FormStatusEnum } from '@fiduciary-interface/app/features/forms/enums/form-status.enum';
import { BiddingDocumentService } from '@fiduciary-interface/app/features/forms/services/bidding-document/bidding-document.service';
import { DocumentsGenerateService } from '../../services/documents-generate.service';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { OpeningDate } from '@fiduciary-interface/app/features/forms/models/openingDate.model';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared/services/notification-global.service';
import {
  ConfirmNoticeEvent,
  GroupsTabs,
  PackagesFilesListConfiguration,
} from '../../models';
import { DocumentGroupCode, GroupType } from '../../enums';
import { BtnBusinessRuleGroup } from '@core/models/btnBusinessRules';
import { GroupCodeEnum, GroupNameTextEnum } from '@core/enums/groupCode.enum';
import {
  DocumentPackageCode,
  NoticeTypeEnum,
} from '@core/enums/documentPackageCode.enum';
import { Subscription } from 'rxjs';
import { BussinessRulesFunctionEnum } from '@fiduciary-interface/app/features/forms/enums/bussiness-rules-form.enum';
import { DatePipe } from '@angular/common';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { GroupNameEnum } from '@core/enums/groupCode.enum';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmCancelDialogComponent,
  ConfirmCancelDialogData,
} from '../../../confirm-cancel-dialog/confirm-cancel-dialog.component';
import { ProcurementNoticesService } from '@fiduciary-interface/app/features/spn/services/api/procurement-notices.service';

@Component({
  selector: 'fi-document-group',
  templateUrl: './document-group.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentGroupComponent),
      multi: true,
    },
  ],
})
export class DocumentGroupComponent implements ControlValueAccessor {
  @Input() isUserInternal: boolean;
  @Input() viewPermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() editPermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() deletePermissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() set groups(value: FiduciaryProcessDocumentGroup[]) {
    this._groups = value;
    this.allDocuments = this.getAllDocuments(value);
  }
  @Input() set documentsToUpload(value: FiduciaryProcessDocument[]) {
    this._documentsToUpload = value;
    this.allDocuments = this.getAllDocuments(this._groups);
  }
  @Input() noDocumentsMessage: string;
  @Input() groupEnum: Enumerator[];
  @Input() groupParentId = String();
  @Input() showReadOnly = false;
  @Input() isUploading = false;
  @Input() cleanSelection = null;
  @Input() docPackage: BiddingProcessDocumentPackage;
  @Input() allPackages: BiddingProcessDocumentPackage[];
  @Input() set mode(value: DocEnum) {
    this._mode = value;
    this.allGroups = this.getAllGroups(this._groups);

    this.filesListConfig = this.testFuncion(
      this.filterDocsByPackageDocumentStatus(this.allDocuments)
    );
    this.showFileSelector = this.checkFiselectorVisibility(
      this.filesListConfig
    );
  }
  @Input() groupsList: Group[];
  @Input() procurementProcess: BiddingProcessProcurementProcess;
  @Input() statusForm?: FormStatusEnum;
  @Input() btnBidding: BtnBusinessRuleGroup = null;
  @Input() documentDownloadDocumentGuestPermission = [PermissionEnum.SPECIAL];
  @Input() documentDownloadDocumentPermission = [PermissionEnum.SPECIAL];
  @Input() resultBr: BussinessRulesFunctionEnum = null;
  @Input() showBtnDeleteByBussnes?: boolean;
  @Input() isAdditionalDoc = false;
  @Input() processPlan: BiddingProcessPlan;

  @Output()
  editFile: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteFile: EventEmitter<any> = new EventEmitter<any>();
  @Output() viewFile: EventEmitter<any> = new EventEmitter<any>();
  @Output() fileChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshFiles: EventEmitter<any> = new EventEmitter<any>();

  showFileSelector: boolean;
  docPackageCode = DocumentPackageCode;
  showHeaderResult: boolean;
  showHeaderResultReadOnlyDocs: boolean;

  onTouched!: Function;
  onChanged: boolean;
  selected!: string;
  showBtnSpnCategoryGoods: boolean;
  docPackageStatus = DocumentPackagesStatus;
  _mode: DocEnum;

  allGroups: GroupsTabs[];
  allDocuments: FiduciaryProcessDocument[] = [];
  readonlyDocuments: FiduciaryProcessDocument[] = [];
  _groups: FiduciaryProcessDocumentGroup[] = [];
  _documentsToUpload: FiduciaryProcessDocument[];

  validGroups = new UntypedFormGroup({
    state: new UntypedFormControl('', []),
  });

  filesListConfig: PackagesFilesListConfiguration;
  readonly subscriptions = new Subscription();
  resultBrEnums = BussinessRulesFunctionEnum;

  constructor(
    public readonly router: Router,
    readonly activatedRoute: ActivatedRoute,
    readonly storeProject: ProjectStoreService,
    public readonly translate: TranslateService,
    readonly modalService: ModalService,
    public biddingDocumentService: BiddingDocumentService,
    private readonly documentsGenerate: DocumentsGenerateService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translateEnum: TranslateEnumPipe,
    public datepipe: DatePipe,
    private matDialog: MatDialog,
    private procurementNoticeService: ProcurementNoticesService,
    readonly documentPackageStore: BiddingProcessDocumentPackagesStoreService
  ) {}

  checkFiselectorVisibility(
    packagesFileListConfig: PackagesFilesListConfiguration
  ): boolean {
    const notAvailableProcessStatus = [
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_COMPLETE,
      BiddingProcessProcurementProcessStatuses.DELETED,
      BiddingProcessProcurementProcessStatuses.DRAFT,
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];
    if (
      this.processPlan?.status === BiddingProcessPlanStatus.IN_SYNC ||
      notAvailableProcessStatus.includes(this.procurementProcess?.status)
    ) {
      return false;
    }
    return packagesFileListConfig.aviableDocs.codes.length > 0;
  }

  //TODO HONG
  //AQUI FILTRAR LOS DOCS QUE IRAN A FINISHED DOCS O FILES-LIST
  filterDocsByPackageDocumentStatus(
    docs: FiduciaryProcessDocument[]
  ): FiduciaryProcessDocument[] {
    return docs.filter(
      (d) =>
        d.id === '' ||
        d.packageDocumentStatus === DocumentPackageStatusEnum.UNDER_REVIEW ||
        d.packageDocumentStatus === DocumentPackageStatusEnum.UPLOADED
    );
  }

  getAllGroups(groups: FiduciaryProcessDocumentGroup[]): GroupsTabs[] {
    if (this._mode === DocEnum.PACKAGES) {
      return this.getDocumentPackageGroups(groups, this.docPackage);
    }
  }

  getDocumentPackageGroups(
    groups: FiduciaryProcessDocumentGroup[],
    docPackage: BiddingProcessDocumentPackage
  ): GroupsTabs[] {
    const filteredGroups = this.filterInternalOrExternalGroups(groups);
    const isClarificationOrAmendmentPackage = docPackage
      ? this.verifyStatusPackageClarificationOrAmendment(docPackage)
      : false;

    const mandatoryGroups = filteredGroups.filter(
      (g) =>
        g.documentGroupConfiguration.isMandatory &&
        !g.documentGroupConfiguration.isAmendment &&
        !g.documentGroupConfiguration.isClarification
    );

    const optionalGroups = filteredGroups.filter(
      (g) =>
        !g.documentGroupConfiguration.isMandatory &&
        !g.documentGroupConfiguration.isAmendment &&
        !g.documentGroupConfiguration.isClarification &&
        g.groupCode !== DocumentGroupCode.OTHER &&
        g.groupCode !== DocumentGroupCode.OTHER_AFTER_COMPLETION &&
        g.groupCode !== DocumentGroupCode.BANK_RESPONSE
    );

    const amendmentsGroups = isClarificationOrAmendmentPackage
      ? filteredGroups.filter((g) => g.documentGroupConfiguration.isAmendment)
      : [];

    const clarificationsGroups = isClarificationOrAmendmentPackage
      ? filteredGroups.filter(
          (g) => g.documentGroupConfiguration.isClarification
        )
      : [];

    const groupsTbs: GroupsTabs[] = [
      {
        type: GroupType.MANDATORY,
        groups: mandatoryGroups,
      },
      {
        type: GroupType.OPTIONAL,
        groups: optionalGroups,
      },
      {
        type: GroupType.AMENDMENTS,
        groups: amendmentsGroups,
      },
      {
        type: GroupType.CLARIFICATIONS,
        groups: clarificationsGroups,
      },
    ];

    return this.sanitizeGroups(groupsTbs);
  }

  sanitizeGroups(groups: GroupsTabs[]): GroupsTabs[] {
    return groups.filter((g) => g.groups.length > 0);
  }

  verifyStatusPackageClarificationOrAmendment(
    docPackage: BiddingProcessDocumentPackage
  ) {
    if (
      docPackage.status === DocumentPackagesStatus.COMPLETE ||
      docPackage.status === DocumentPackagesStatus.AMENDMENT_RETURNED ||
      docPackage.status === DocumentPackagesStatus.AMENDMENT_UNDER_REV ||
      docPackage.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
    ) {
      return true;
    } else {
      return false;
    }
  }

  get validDocs(): UntypedFormControl {
    return this.validGroups.get('state') as UntypedFormControl;
  }

  writeValue(value: string): void {
    this.selected = value ?? 'IN';
  }

  registerOnChange(fn: boolean): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  //TODO HONG CHECK WHERE AND WHEN TO USE IT
  newFunction() {
    if (
      this.procurementProcess !== undefined &&
      this.procurementProcess.category.name === 'PROCT_GOODS'
    ) {
      this.showBtnSpnCategoryGoods = true;
    }
  }

  redirectToForm(formName: GroupNameTextEnum, groupCode: number): void {
    this.documentsGenerate.groups = this._groups;
    this.documentsGenerate.statusForm = this.statusForm;
    this.documentsGenerate.operationNumber =
      this.activatedRoute.snapshot.params.code;
    this.documentsGenerate.biddingProcessPlanId =
      this.activatedRoute.snapshot.params.procurementId;
    this.documentsGenerate.biddingProcessProcurementProcessId =
      this.activatedRoute.snapshot.params.processId;

    this.router.navigate([`../../../../../../../../forms`], {
      relativeTo: this.activatedRoute,
      queryParams: this.documentsGenerate.createRequestData(
        formName,
        groupCode
      ),
    });
  }

  editFileAction(event: EventDocument): void {
    this.editFile.emit({
      event,
      parentId: this.groupParentId,
    });
  }

  deleteFileAction(document: FiduciaryProcessDocument): void {
    this.deleteFile.emit({
      document,
      parentId: this.groupParentId,
    });
  }

  previewFileAction(event: EventDocument): void {
    this.viewFile.emit({
      event,
    });
  }

  handlerFilesChanged(files): void {
    this.fileChange.emit({
      files,
      parentId: this.groupParentId,
    });
  }

  filterInternalOrExternalGroups(
    group: FiduciaryProcessDocumentGroup[]
  ): FiduciaryProcessDocumentGroup[] {
    const groupFilter = this.isUserInternal ? 1 : 0;
    return group?.filter(
      (g) => g.documentGroupConfiguration.visibility === groupFilter
    );
  }

  getAllDocuments(
    value: FiduciaryProcessDocumentGroup[]
  ): FiduciaryProcessDocument[] {
    const docs: FiduciaryProcessDocument[] = [];
    value?.forEach((group) => {
      if (group.fiduciaryProcessDocuments) {
        group.fiduciaryProcessDocuments.forEach((doc) => {
          docs.push(doc);
        });
      }
    });

    if (!!this._documentsToUpload) {
      this._documentsToUpload.forEach((d) => docs.push(d));
    }
    return docs;
  }

  private getGroupByCode(groupCode: number): FiduciaryProcessDocument {
    const group = this._groups?.find((g) => g.groupCode === groupCode);
    return group.fiduciaryProcessDocuments[0];
  }

  openOpeningDateModal(groupCode: number): void {
    const document = this.getGroupByCode(groupCode);
    const biddingDocumentId = document.biddingDocumentId;
    this.biddingDocumentService
      .getOpenDate(biddingDocumentId)
      .pipe(
        switchMap((response: OpeningDate) =>
          this.modalService.openDialogOpenDate(
            this.translate.instant('FORMS.FORMS_TABS.OPENING_DATE'),
            new Date(response.documentOpeningDate)
          )
        ),
        filter((response) => response.date !== undefined),
        switchMap((response) => {
          this.notificationGlobalService.showSuccess(
            this.translate.instant('FORMS_TABS.OPENING_DATE.SUCCES')
          );

          return this.biddingDocumentService.updateOpenDate(
            biddingDocumentId,
            response.date.toString()
          );
        })
      )
      .subscribe(() => {});
  }

  eliminarRepetidos(arr: number[]): number[] {
    return arr.filter(
      (value, indice, arreglo) => arreglo.indexOf(value) === indice
    );
  }

  testFuncion(
    documents: FiduciaryProcessDocument[]
  ): PackagesFilesListConfiguration {
    const availableCodes = this.documentsCanUpload(
      this.allPackages,
      this.docPackage,
      this.isUserInternal,
      this.procurementProcess
    );

    const aviableDocs = [];
    const readonlyDocs = {
      codes: [],
      docs: [],
    };
    const showHeaderResult = documents.some(
      (document) => document.showHeaderResult
    );

    const list = [
      BiddingProcessProcurementProcessStatuses.DELETED,
      BiddingProcessProcurementProcessStatuses.DRAFT,
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
      BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
      BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
      BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];
    const availableToEdit =
      this.processPlan?.status !== BiddingProcessPlanStatus.IN_SYNC &&
      !list.includes(this.procurementProcess?.status);
    documents.forEach((document) => {
      if (availableToEdit) {
        if (availableCodes.includes(document.groupCode) || document.id === '') {
          aviableDocs.push(document);
        } else {
          readonlyDocs.docs.push(document);
          readonlyDocs.codes.push(...this.getGroupsCodes([document.groupCode]));
        }
      } else {
        readonlyDocs.docs.push(document);
        readonlyDocs.codes.push(...this.getGroupsCodes([document.groupCode]));
      }
    });

    const aviableDocsCodes = this.getGroupsCodes(availableCodes);

    return {
      aviableDocs: {
        codes: aviableDocsCodes,
        docs: aviableDocs,
      },
      readonlyDocs,
      showHeaderResult,
    };
  }

  getGroupsCodes(codes: number[]): Enumerator[] {
    return this.groupEnum.filter((g) => codes.includes(g.id));
  }

  documentsCanUpload(
    allPackages: BiddingProcessDocumentPackage[],
    actualPackage: BiddingProcessDocumentPackage,
    isUserInternal: boolean,
    procurementProcess: BiddingProcessProcurementProcess
  ): number[] {
    let docGroupCode: number[] = [];

    if (!isUserInternal) {
      if (
        procurementProcess?.supervisionMethod.id ===
        BiddingProcurementProcessSupervisionMethods.EX_ANTE
      ) {
        if (this.firstAndPreviousPackageCondition(allPackages, actualPackage)) {
          docGroupCode = this.filterDocGroupAndReturnCode(
            DocVisibility.EXTERNAL,
            false,
            false,
            true,
            actualPackage
          );
          docGroupCode = this.addOtherGroupCode(docGroupCode, actualPackage);
        } else if (this.lastPackageCondition(allPackages, actualPackage)) {
          docGroupCode = this.filterDocGroupAndReturnCode(
            DocVisibility.EXTERNAL,
            true,
            undefined,
            undefined,
            actualPackage
          );
          docGroupCode = this.addOtherGroupCode(docGroupCode, actualPackage);
        } else if (
          actualPackage?.status === DocumentPackagesStatus.COMPLETE ||
          actualPackage?.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
        ) {
          docGroupCode = this.checkPackageStatusForAfterCompletation(
            docGroupCode,
            actualPackage
          );
        }
        if (
          this.lastPackageConditionClarification(allPackages, actualPackage)
        ) {
          docGroupCode = this.addClarificationGroup(docGroupCode);
        }
        return docGroupCode;
      } else {
        if (
          actualPackage?.status === DocumentPackagesStatus.NOT_STARTED ||
          actualPackage?.status === DocumentPackagesStatus.RETURNED
        ) {
          docGroupCode = this.filterDocGroupAndReturnCode(
            DocVisibility.EXTERNAL,
            false,
            false,
            true,
            actualPackage
          );
          docGroupCode = this.addOtherGroupCode(docGroupCode, actualPackage);
        } else if (
          actualPackage?.status === DocumentPackagesStatus.COMPLETE ||
          actualPackage?.status === DocumentPackagesStatus.AMENDMENT_RETURNED ||
          actualPackage?.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
        ) {
          docGroupCode = this.filterDocGroupAndReturnCode(
            DocVisibility.EXTERNAL,
            true,
            undefined,
            undefined,
            actualPackage
          );
          docGroupCode = this.addOtherGroupCode(docGroupCode, actualPackage);
        }
        if (this.checkClarificationStatus(actualPackage)) {
          docGroupCode = this.addClarificationGroup(docGroupCode);
        }
        return docGroupCode;
      }
    } else if (
      isUserInternal &&
      (actualPackage?.status === DocumentPackagesStatus.COMPLETE ||
        actualPackage?.status === DocumentPackagesStatus.COMPLETE_AMENDMENT)
    ) {
      /* const filteredDocGroup =
        actualPackage.biddingProcessDocumentGroups.filter((docgroup) => {
          return (
            docgroup.documentGroupConfiguration.visibility ===
            DocVisibility.INTERNAL
          );
        });

      docGroupCode = filteredDocGroup.map((f) => {
        return f.documentGroupCode;
      }); */
      return [DocumentGroupCode.BANK_RESPONSE_AFTER_COMPLETION];
    }
    return docGroupCode;
  }

  checkPackageStatusForAfterCompletation(
    docGroupCode: number[],
    actualPackage: BiddingProcessDocumentPackage
  ): number[] {
    if (
      actualPackage.status === DocumentPackagesStatus.COMPLETE ||
      actualPackage.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
    ) {
      docGroupCode.push(DocumentGroupCode.OTHER_AFTER_COMPLETION);
    }
    return docGroupCode;
  }

  addOtherGroupCode(
    docGroupCode: number[],
    actualPackage: BiddingProcessDocumentPackage
  ): number[] {
    if (
      actualPackage.status === DocumentPackagesStatus.COMPLETE ||
      actualPackage.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
    ) {
      docGroupCode.push(DocumentGroupCode.OTHER_AFTER_COMPLETION);
    }
    if (
      actualPackage.status !== DocumentPackagesStatus.COMPLETE &&
      actualPackage.status !== DocumentPackagesStatus.COMPLETE_AMENDMENT
    ) {
      return docGroupCode.filter(
        (g) => g !== DocumentGroupCode.OTHER_AFTER_COMPLETION
      );
    }
    return docGroupCode;
  }

  lastPackageConditionClarification(
    allPackages: BiddingProcessDocumentPackage[],
    actualPackage: BiddingProcessDocumentPackage
  ): boolean {
    const lastPackageComplete = allPackages
      .filter((p) => {
        return this.checkClarificationStatus(p);
      })
      .pop();
    return lastPackageComplete?.id === actualPackage?.id;
  }

  checkClarificationStatus(docPackage: BiddingProcessDocumentPackage): boolean {
    return (
      docPackage.status === DocumentPackagesStatus.COMPLETE ||
      docPackage.status === DocumentPackagesStatus.AMENDMENT_RETURNED ||
      docPackage.status === DocumentPackagesStatus.AMENDMENT_UNDER_REV ||
      docPackage.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
    );
  }

  addClarificationGroup(groups: number[]): number[] {
    return this.eliminarRepetidos([
      ...groups,
      ...this.filterDocGroupAndReturnCode(
        DocVisibility.EXTERNAL,
        undefined,
        true,
        undefined,
        this.docPackage
      ),
    ]);
  }

  firstAndPreviousPackageCondition(
    allPackages: BiddingProcessDocumentPackage[],
    actualPackage: BiddingProcessDocumentPackage
  ): boolean {
    const previousPackageIndex =
      allPackages?.findIndex((p) => {
        return p.id === actualPackage?.id;
      }) - 1;

    if (previousPackageIndex === -1) {
      if (
        actualPackage.status === DocumentPackagesStatus.NOT_STARTED ||
        actualPackage.status === DocumentPackagesStatus.RETURNED
      ) {
        return true;
      }
      return false;
    }

    const firstPackage = allPackages?.find((p) => {
      return (
        p.status === DocumentPackagesStatus.NOT_STARTED ||
        p.status === DocumentPackagesStatus.RETURNED
      );
    });

    const previousPackageCondition =
      allPackages[previousPackageIndex].status ===
        DocumentPackagesStatus.COMPLETE ||
      allPackages[previousPackageIndex].status ===
        DocumentPackagesStatus.COMPLETE_AMENDMENT ||
      allPackages[previousPackageIndex].status ===
        DocumentPackagesStatus.AMENDMENT_RETURNED ||
      allPackages[previousPackageIndex].status ===
        DocumentPackagesStatus.AMENDMENT_UNDER_REV;

    return previousPackageCondition && firstPackage?.id === actualPackage?.id;
  }

  private filterDocGroupAndReturnCode(
    visibility: DocVisibility,
    isAmendment: boolean,
    isClarification: boolean,
    isAndCondition: boolean,
    actualPackage: BiddingProcessDocumentPackage
  ): number[] {
    let filteredDocGroup: BiddingProcessDocumentGroup[] = [];
    if (isClarification === undefined) {
      filteredDocGroup = actualPackage.biddingProcessDocumentGroups.filter(
        (docgroup) => {
          return (
            docgroup.documentGroupConfiguration.visibility === visibility &&
            docgroup.documentGroupConfiguration.isAmendment === isAmendment
          );
        }
      );
    }
    if (isAmendment === undefined) {
      filteredDocGroup = actualPackage.biddingProcessDocumentGroups.filter(
        (docgroup) => {
          return (
            docgroup.documentGroupConfiguration.visibility === visibility &&
            docgroup.documentGroupConfiguration.isClarification ===
              isClarification
          );
        }
      );
    }
    if (isAndCondition) {
      filteredDocGroup = actualPackage.biddingProcessDocumentGroups.filter(
        (docgroup) => {
          return (
            docgroup.documentGroupConfiguration.visibility === visibility &&
            docgroup.documentGroupConfiguration.isAmendment === isAmendment &&
            docgroup.documentGroupConfiguration.isClarification ===
              isClarification
          );
        }
      );
    } else {
      filteredDocGroup = actualPackage.biddingProcessDocumentGroups.filter(
        (docgroup) => {
          return (
            docgroup.documentGroupConfiguration.visibility === visibility &&
            (docgroup.documentGroupConfiguration.isAmendment === isAmendment ||
              docgroup.documentGroupConfiguration.isClarification ===
                isClarification)
          );
        }
      );
    }

    filteredDocGroup = filteredDocGroup.filter(
      (g) => !g.documentGroupConfiguration.systemUpload
    );

    return filteredDocGroup.map((f) => {
      return f.documentGroupCode;
    });
  }

  lastPackageCondition(
    allPackages: BiddingProcessDocumentPackage[],
    actualPackage: BiddingProcessDocumentPackage
  ): boolean {
    const lastPackageComplete = allPackages
      .filter((p) => {
        return (
          p.status === DocumentPackagesStatus.COMPLETE ||
          p.status === DocumentPackagesStatus.AMENDMENT_RETURNED ||
          p.status === DocumentPackagesStatus.COMPLETE_AMENDMENT
        );
      })
      .pop();

    return lastPackageComplete?.id === actualPackage?.id;
  }

  getResultVisibility(): void {
    this.showHeaderResult = this.allDocuments.some((f) => f.showHeaderResult);
    this.showHeaderResultReadOnlyDocs = this.readonlyDocuments.some(
      (f) => f.showHeaderResult
    );
  }

  testFunction2() {
    this.readonlyDocuments = [
      {
        relationalId: '84609fe2-7f01-49de-8885-0e1b0ab28c21',
        id: 'd1b41e52-6702-48bf-ab7f-a9154b447513',
        status: 4,
        type: 2,
        operationsDocumentId: null,
        ezshareNumber: 'EZTEST-1654199927-854',
        name: 'CO-L1229-P18-BIDDINDG_DOC_NOTIFICATION_PRECUALIFICATION-PDF-test.pdf',
        created: new Date('2022-03-19'),
        createdBy: '',
        modified: new Date('2022-03-17'),
        groupCode: 5,
        description: '',
      },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openModalPublic(): void {
    const textGroup = this.translateEnum.translateEnum(
      this.btnBidding.groupCode,
      this.groupEnum
    );
    const idDocument = this.btnBidding.biddingDocumentId;
    if (this.btnBidding.groupCode === GroupNameEnum.BIDDINDG_DOC_SPECIFIC) {
      this.openModalSendToPublicated(idDocument, textGroup);
    } else {
      this.openModalConfirm(idDocument, textGroup);
    }
  }

  openModalSendToPublicated(idDocument: string, textGroup: string) {
    this.biddingDocumentService
      .getOpenDate(idDocument)
      .pipe(
        switchMap((response: OpeningDate) =>
          this.modalService.openDialogChangeDate(
            this.translate.instant('BIDDINDG.PENDINGPUBLICATION.MODAL.TITLE'),
            response.documentOpeningDate,
            response.termDays,
            textGroup
          )
        ),
        filter((response) => response.date !== undefined),
        switchMap((response) => {
          const newDate = this.datepipe.transform(
            response.date,
            'yyyy-MM-dd HH:mm:ss'
          );
          return this.biddingDocumentService
            .updateOpenDate(idDocument, newDate)
            .pipe(
              switchMap(() => {
                this.notificationGlobalService.showSuccess(
                  this.translate.instant('FORMS_TABS.OPENING_DATE.SUCCES')
                );
                return this.biddingDocumentService
                  .sendToPublication(idDocument)
                  .pipe(
                    mergeMap(() => {
                      this.refresh();
                      return of({});
                    })
                  );
              })
            );
        })
      )
      .subscribe(() => {});
  }

  openModalConfirm(idDocument: string, textGroup: string) {
    this.modalService
      .openModalConfirm(
        this.translate.instant(
          'BIDDINDG.PENDINGPUBLICATION.MODAL.PUBLICATION_TITLE'
        ),
        textGroup
      )
      .subscribe((response) => {
        if (response.confirm) {
          this.sendToPublication(idDocument);
        }
      });
  }

  private sendToPublication(idDocument: string): void {
    const sub = this.biddingDocumentService
      .sendToPublication(idDocument)
      .subscribe(() => {
        this.notificationGlobalService.showSuccess(
          this.translate.instant(
            'FORMS.FORMS_TABS.PENDINGPUBLICATION_SUCCES_SEND'
          )
        );
        this.refresh();
      });
    this.subscriptions.add(sub);
  }
  refresh(): void {
    this.refreshFiles.emit({});
  }
  /**
   *
   * ? This info banner maybe also used for SPN, ask Favio
   */
  showEoiInfoBanner(): boolean {
    let eoiDocGroup = this.docPackage.biddingProcessDocumentGroups.find(
      (docGroup) => docGroup.documentGroupCode === GroupCodeEnum.EOI
    );
    let isEoiDocPackage = this.docPackage.code === DocumentPackageCode.EOI;

    if (eoiDocGroup) {
      let hasUploadedFile = eoiDocGroup.fiduciaryProcessDocuments.length > 0;
      let isPublicationMandatory =
        eoiDocGroup.documentGroupConfiguration.isMandatoryPublication ===
        DocumentGroupMandatoryPublicationEnum.YES;

      return isPublicationMandatory && isEoiDocPackage && !hasUploadedFile;
    }
    return false;
  }

  confirmNotice(noticeData: ConfirmNoticeEvent) {
    switch (noticeData.noticeType) {
      case NoticeTypeEnum.EOI:
        this.confirmEoiNotice(noticeData.noticeId);
        break;
      default:
        break;
    }
  }

  confirmEoiNotice(noticeId: string) {
    const dialogData: ConfirmCancelDialogData = {
      headerEnum: 'UNDB.EOI.CONFIRM_NOTICE_MODAL.HEADER',
      bodyTextEnum: 'UNDB.EOI.CONFIRM_NOTICE_MODAL.BODY',
      confirmButtonEnum: 'TRANSACTION.MODAL.OPTION.YES',
      cancelButtonEnum: 'ANT_TRANSACTION.CANCEL',
    };
    const dialog = this.matDialog.open(ConfirmCancelDialogComponent, {
      data: dialogData,
    });

    dialog.afterClosed().subscribe((response) => {
      if (response) {
        this.procurementNoticeService
          .confirmNotice(noticeId, NoticeTypeEnum.EOI)
          .subscribe({
            next: () => {
              const msg = this.translate.instant(
                'UNDB.CONFIRM_AMENDMENT.SUCCESS_MESSAGE'
              );
              this.notificationGlobalService.showSuccess(msg);
              this.documentPackageStore.changeDocumentPackageStatusSuccessAction(
                this.procurementProcess.id,
                this.docPackage.id,
                DocumentPackagesStatus.COMPLETE_AMENDMENT
              );
              this.refresh();
            },
            error: () => {
              const msg = this.translate.instant(
                'UNDB.CONFIRM_AMENDMENT.ERROR_MESSAGE'
              );
              this.notificationGlobalService.showError(msg);
            },
          });
      }
    });
  }
}
