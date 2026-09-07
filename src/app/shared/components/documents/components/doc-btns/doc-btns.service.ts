import { Injectable } from '@angular/core';
import {
  BiddingProcessDocumentGroupsResults,
  BiddingProcessProcurementProcessStatuses,
  BiddingProcurementProcessSupervisionMethods,
  DocumentPackagesStatus,
  DocumentPackageStatusEnum,
} from '@core/enums';
import {
  BiddingProcessDocumentGroup,
  BiddingProcessDocumentPackage,
  BiddingProcessProcurementProcess,
} from '@core/models';
import { BPbtns } from '../../enums';
import { BPBtnDictionary, BPBtnDictionaryItem } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class DocBtnsService {
  constructor() {}

  readonly DISCLOSURE_REQUIRED_AMOUNT = 200_000;
  notAvialableProcessStatus = [
    BiddingProcessProcurementProcessStatuses.MODIFIED,
    BiddingProcessProcurementProcessStatuses.CANCELLED,
    BiddingProcessProcurementProcessStatuses.UNSUCCESFUL_PROCESS,
    BiddingProcessProcurementProcessStatuses.PROCUREMENT_INELIGIBLE,
    BiddingProcessProcurementProcessStatuses.REJECTION_BIDS,
    BiddingProcessProcurementProcessStatuses.CONTRACT_TERMINATED,
    BiddingProcessProcurementProcessStatuses.MODIFIED,
    BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
  ];

  getButtonsVisiblity(
    item: BiddingProcessDocumentPackage,
    procurementProcess: BiddingProcessProcurementProcess,
    dictionary: BPBtnDictionary,
    allPackages: BiddingProcessDocumentPackage[],
    disabledByPartipants: boolean
  ): void {
    if (!this.notAvialableProcessStatus.includes(procurementProcess?.status)) {
      switch (item.status) {
        case DocumentPackagesStatus.NOT_STARTED:
        case DocumentPackagesStatus.RETURNED:
          this.validateBtnsNotStartedReturned(
            item,
            dictionary,
            procurementProcess,
            allPackages,
            disabledByPartipants
          );
          break;
        case DocumentPackagesStatus.COMPLETE:
        case DocumentPackagesStatus.AMENDMENT_RETURNED:
        case DocumentPackagesStatus.COMPLETE_AMENDMENT:
        case DocumentPackagesStatus.AMENDMENT_UNDER_REV:
          this.validateBtnsCompleAmendment(
            item,
            dictionary,
            procurementProcess,
            allPackages,
            disabledByPartipants
          );
          break;
        default:
          break;
      }
    }
  }

  validateBtnsNotStartedReturned(
    actualPackage: BiddingProcessDocumentPackage,
    dictionary: BPBtnDictionary,
    process: BiddingProcessProcurementProcess,
    allPackages: BiddingProcessDocumentPackage[],
    disabledByPartipants: boolean
  ): void {
    if (
      !this.validateButton(
        actualPackage,
        BPbtns.NonObjection,
        dictionary,
        process,
        allPackages,
        disabledByPartipants
      ) &&
      !this.validateButton(
        actualPackage,
        BPbtns.Disclosure,
        dictionary,
        process,
        allPackages,
        disabledByPartipants
      )
    ) {
      this.validateButton(
        actualPackage,
        BPbtns.Confirm,
        dictionary,
        process,
        allPackages,
        disabledByPartipants
      );
    }
  }

  validateButton(
    docPackage: BiddingProcessDocumentPackage,
    btn: BPbtns,
    dictionary: BPBtnDictionary,
    process: BiddingProcessProcurementProcess,
    allPackages: BiddingProcessDocumentPackage[],
    disabledByPartipants: boolean
  ): boolean {
    let showBtn;
    let filteredGroups;
    switch (btn) {
      case BPbtns.NonObjection:
        showBtn = docPackage.requireNonObjection;
        break;
      case BPbtns.Disclosure:
        showBtn =
          !docPackage.requireNonObjection &&
          this.getPackageDisclosure(docPackage) &&
          this.diclosedAmountCheck(docPackage, process);
        break;
      case BPbtns.Confirm:
        showBtn = true;
        break;
      case BPbtns.ConfirmClarificationUpload:
        filteredGroups = this.getClarificationGroups(
          docPackage.biddingProcessDocumentGroups
        );
        showBtn =
          filteredGroups &&
          filteredGroups.length >= 1 &&
          this.checkMinimumDocsAndPackageStatus(filteredGroups);
        break;
      case BPbtns.ConfirmAmendment:
        filteredGroups = this.getAmendmentsGroups(
          docPackage.biddingProcessDocumentGroups
        );
        showBtn =
          filteredGroups &&
          filteredGroups.length >= 1 &&
          this.checkMinimumDocsAndPackageStatus(filteredGroups);
        break;
      case BPbtns.RequestAmendment:
        filteredGroups = this.getAmendmentsGroups(
          docPackage.biddingProcessDocumentGroups
        );
        showBtn =
          filteredGroups &&
          filteredGroups.length >= 1 &&
          this.checkMinimumDocsAndPackageStatus(filteredGroups);
        break;
      default:
        throw new Error(`Invalid button: ${btn}`);
    }
    this.newTestFunction(
      dictionary[btn],
      docPackage,
      showBtn,
      allPackages,
      disabledByPartipants
    );
    return showBtn;
  }

  getPackageDisclosure(docPackage: BiddingProcessDocumentPackage): boolean {
    return docPackage.biddingProcessDocumentGroups.some(
      (group) => group.documentGroupConfiguration.isDisclosed
    );
  }

  diclosedAmountCheck(
    docPackage: BiddingProcessDocumentPackage,
    process: BiddingProcessProcurementProcess
  ): boolean {
    return (
      !this.getPackageDiscloseRequiredAmount(docPackage) ||
      (this.isRequiredAmounterHigher(process.projectAmount?.estimatedAmount) &&
        this.getPackageDiscloseRequiredAmount(docPackage))
    );
  }

  newTestFunction(
    item: BPBtnDictionaryItem,
    docPackage: BiddingProcessDocumentPackage,
    showBtn: boolean,
    allPackages: BiddingProcessDocumentPackage[],
    disabledByPartipants: boolean
  ) {
    let showDocumentUploaded = showBtn;
    let isAllMandatoryDocsUploaded: boolean;
    let hasNotPreviousPackageStatusAmendmentUnderReview: boolean;
    isAllMandatoryDocsUploaded = this.checkMinimunMandatoryDocs(docPackage);
    hasNotPreviousPackageStatusAmendmentUnderReview =
      this.validateNotPreviousPackageStatusAmedmentUnderReview(
        docPackage,
        allPackages
      );
    let disabledDocumentUploadedBtn;
    let disableBtn = true;
    if (
      isAllMandatoryDocsUploaded &&
      hasNotPreviousPackageStatusAmendmentUnderReview
    ) {
      disableBtn = !!(
        docPackage?.documentsToUpload?.length >= 1 ||
        this.getDisableRulesResult(docPackage) ||
        disabledByPartipants
      );
    }
    disabledDocumentUploadedBtn = disableBtn;
    let hasEvalReportGroupWithOutAwardeds =
      docPackage.biddingProcessDocumentGroups
        .find((g) => g.documentGroupConfiguration.isResult)
        ?.fiduciaryProcessDocuments.find((d) => d.awardeds?.length <= 0) !==
      undefined;
    const tooltip = this.generateTooltipKey(
      isAllMandatoryDocsUploaded,
      hasNotPreviousPackageStatusAmendmentUnderReview,
      docPackage?.documentsToUpload?.length >= 1,
      disabledByPartipants,
      hasEvalReportGroupWithOutAwardeds
    );

    item.disableBtn = disableBtn;
    item.disabledDocumentUploadedBtn = disableBtn;
    item.showDocumentUploaded = showBtn;
    item.tooltip = tooltip;
    item.showBtn = showBtn;
    item.showDocumentUploaded = showBtn;
    item.disabledDocumentUploadedBtn = disableBtn;
    item = {
      ...item,
      disableBtn,
      tooltip,
      showBtn,
      disabledDocumentUploadedBtn,
      showDocumentUploaded,
    };
  }

  getAdditionalPackageEnableBtn(docPackage: BiddingProcessDocumentPackage) {
    let uploadedAllMandatories = this.checkMinimunMandatoryDocs(docPackage);
    return !!(
      !uploadedAllMandatories ||
      docPackage?.documentsToUpload?.length >= 1 ||
      this.getDisableRulesResult(docPackage)
    );
  }

  getPackageDiscloseRequiredAmount(
    docPackage: BiddingProcessDocumentPackage
  ): boolean {
    return docPackage.biddingProcessDocumentGroups.some(
      (group) => group.documentGroupConfiguration.disclosureRequiredAmount
    );
  }

  generateTooltipKey(
    isAllMandatoryDocsUploaded: boolean,
    hasNotPreviousPackageStatusAmendmentUnderReview: boolean,
    hasDocumentsToUpload: boolean,
    disabledByPartipants: boolean,
    hasEvalReportGroupWithOutAwardeds: boolean
  ): string {
    if (
      !isAllMandatoryDocsUploaded &&
      !hasNotPreviousPackageStatusAmendmentUnderReview
    ) {
      return 'PROCESS_DOC.DOC_BTNS.BOTH_CONDITION';
    }
    if (!isAllMandatoryDocsUploaded) {
      return 'PROCESS_DOC.DOC_BTNS.MANDATORY_DOCTS_CONDITION';
    }
    if (!hasNotPreviousPackageStatusAmendmentUnderReview) {
      return 'PROCESS_DOC.DOC_BTNS.AMENDMENT_UNDER_REVIEW_CONDITION';
    }
    if (hasDocumentsToUpload) {
      //TODO HONG
      /* Key para cuando tenga documentos por subir pendientes */
      return 'PROCESS_DOC.DOC_BTNS.HAS_DOCUMENT_UPLOAD_CONDITION';
    }
    if (disabledByPartipants) {
      return 'PROCESS_DOC.DOC_BTNS.HAS_PENDING_PARTICIPANTS_CONDITION';
    }
    if (hasEvalReportGroupWithOutAwardeds) {
      return 'PROCESS_DOC.DOC_BTNS.HAS_PENDING_AWARDEEDS';
    }
  }

  checkMinimunMandatoryDocs(
    docPackage: BiddingProcessDocumentPackage
  ): boolean {
    let minimun = true;

    this.getMandatoryGroups(docPackage).forEach((el) => {
      if (
        el.fiduciaryProcessDocuments &&
        el.fiduciaryProcessDocuments.length <= 0
      ) {
        minimun = false;
      }
    });
    return minimun;
  }

  getMandatoryGroups(
    packageDocs: BiddingProcessDocumentPackage
  ): BiddingProcessDocumentGroup[] {
    return packageDocs.biddingProcessDocumentGroups.filter(
      (el) => el.documentGroupConfiguration.isMandatory
    );
  }

  validateBtnsCompleAmendment(
    docPackage: BiddingProcessDocumentPackage,
    dictionary: BPBtnDictionary,
    process: BiddingProcessProcurementProcess,
    allPackages: BiddingProcessDocumentPackage[],
    disabledByPartipants: boolean
  ): void {
    if (
      process?.supervisionMethod?.id ===
      BiddingProcurementProcessSupervisionMethods.EX_ANTE
    ) {
      this.validateButton(
        docPackage,
        BPbtns.RequestAmendment,
        dictionary,
        process,
        allPackages,
        disabledByPartipants
      );
    } else {
      this.validateButton(
        docPackage,
        BPbtns.ConfirmAmendment,
        dictionary,
        process,
        allPackages,
        disabledByPartipants
      );
    }
    this.validateButton(
      docPackage,
      BPbtns.ConfirmClarificationUpload,
      dictionary,
      process,
      allPackages,
      disabledByPartipants
    );
  }

  getClarificationGroups(
    groups: BiddingProcessDocumentGroup[]
  ): BiddingProcessDocumentGroup[] {
    return groups.filter((el) => el.documentGroupConfiguration.isClarification);
  }

  checkMinimumDocsAndPackageStatus(
    groups: BiddingProcessDocumentGroup[]
  ): boolean {
    let minimum = false;
    groups.forEach((el) => {
      if (
        el.fiduciaryProcessDocuments &&
        el.fiduciaryProcessDocuments.length >= 1 &&
        el.fiduciaryProcessDocuments.some(
          (doc) =>
            doc.packageDocumentStatus === DocumentPackageStatusEnum.UPLOADED
        )
      ) {
        minimum = true;
      }
    });
    return minimum;
  }

  getAmendmentsGroups(
    groups: BiddingProcessDocumentGroup[]
  ): BiddingProcessDocumentGroup[] {
    return groups.filter((el) => el.documentGroupConfiguration.isAmendment);
  }

  isRequiredAmounterHigher(amount: number): boolean {
    if (amount > this.DISCLOSURE_REQUIRED_AMOUNT) {
      return true;
    } else {
      return false;
    }
  }

  validateNotPreviousPackageStatusAmedmentUnderReview(
    actualPackage: BiddingProcessDocumentPackage,
    allPackages: BiddingProcessDocumentPackage[]
  ): boolean {
    const docIndex = allPackages.findIndex((p) => p.id === actualPackage.id);

    if (docIndex === 0) {
      return true;
    }

    return (
      allPackages[docIndex - 1]?.status !==
      DocumentPackagesStatus.AMENDMENT_UNDER_REV
    );
  }

  getDisableRulesResult(docPackage: BiddingProcessDocumentPackage): boolean {
    const mandatoryResult = this.getMandatoryResultValue(docPackage);
    if (!mandatoryResult) {
      return false;
    }

    const groupWithOptions = docPackage.biddingProcessDocumentGroups.find(
      (g) => g.options.length >= 1
    );
    if (!groupWithOptions) {
      return true;
    }

    const result = groupWithOptions.documentGroupConfiguration.result;
    if (result === BiddingProcessDocumentGroupsResults.NORESULT) {
      return true;
    }

    if (result === BiddingProcessDocumentGroupsResults.AWARDED) {
      const awardedDocs =
        groupWithOptions.fiduciaryProcessDocuments[0].awardeds;
      return awardedDocs.length === 0;
    }

    return false;
  }

  getMandatoryResultValue(docPackage: BiddingProcessDocumentPackage): boolean {
    const mandatoryGroup = docPackage.biddingProcessDocumentGroups.find(
      (g) => g.TypeResultMandatory !== undefined
    );
    return !!mandatoryGroup?.TypeResultMandatory;
  }
}
