import { TestBed } from '@angular/core/testing';
import {
  BiddingProcessProcurementProcessStatuses,
  DocumentPackagesStatus,
} from '@core/enums';
import {
  BiddingProcessDocumentPackage,
  BiddingProcessProcurementProcess,
} from '@core/models';
import { BPBtnDictionary } from '../../models';
import { DocBtnsService } from './doc-btns.service';
import { PermissionEnum } from '@core/enums/permission.enum';

describe('DocBtnsService', () => {
  let service: DocBtnsService;
  let disabledByPartipants = false;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocBtnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getButtonsVisiblity', () => {
    let item: BiddingProcessDocumentPackage = {
      bidValidityExtensionDate: new Date(),
      actualDate: new Date(),
      code: 11,
      documentsToUpload: [],
      id: '11',
      order: 2,
      requireNonObjection: true,
      status: 2,
      totalComments: 0,
      totalMandatoryDocuments: 2,
      totalUploadedDocuments: 1,
      actualDateState: {
        loading: false,
      },
      biddingProcessDocumentGroups: [],
      documentsState: {
        loading: true,
      },
    };
    let procurementProcess: BiddingProcessProcurementProcess = {
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
      order: 4,
    };
    let allPackages: BiddingProcessDocumentPackage[] = [];
    let dictionary: BPBtnDictionary = {
      Confirm: {
        showBtn: undefined,
        disableBtn: undefined,
        permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
        key: 'PROCESS_DOC.DOC_BTNS.CONFIRM_PACKAGES',
        btnActionFunction: () => {},
        showDocumentUploaded: undefined,
        disabledDocumentUploadedBtn: undefined,
        tooltip: '',
      },
      ConfirmAmendment: {
        showBtn: undefined,
        disableBtn: undefined,
        permission: [
          PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
        ],
        key: 'PROCESS_DOC.DOC_BTNS.CONFIRM_AMENDMENT_UPLOAD',
        btnActionFunction: () => {},
        showDocumentUploaded: undefined,
        disabledDocumentUploadedBtn: undefined,
        tooltip: '',
      },
      ConfirmClarificationUpload: {
        showBtn: undefined,
        disableBtn: undefined,
        permission: [
          PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
        ],
        key: 'PROCESS_DOC.DOC_BTNS.CONFIRM_CLARIFICATION_UPLOAD',
        btnActionFunction: () => {},
        showDocumentUploaded: undefined,
        disabledDocumentUploadedBtn: undefined,
        tooltip: '',
      },
      Disclosure: {
        showBtn: undefined,
        disableBtn: undefined,
        permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
        key: 'PROCESS_DOC.DOC_BTNS.SUBMIT_FOR_DISCLOSURE',
        btnActionFunction: () => {},
        showDocumentUploaded: undefined,
        disabledDocumentUploadedBtn: undefined,
        tooltip: '',
      },
      NonObjection: {
        showBtn: undefined,
        disableBtn: undefined,
        permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
        key: 'PROCESS_DOC.DOC_BTNS.REQUEST_NO_OBJECTION',
        btnActionFunction: () => {},
        showDocumentUploaded: undefined,
        disabledDocumentUploadedBtn: undefined,
        tooltip: '',
      },
      RequestAmendment: {
        showBtn: undefined,
        disableBtn: undefined,
        permission: [PermissionEnum.SEND_OFFICIAL_PROCUREMENT_COMUNICATIONS],
        key: 'PROCESS_DOC.DOC_BTNS.AMENDMENT_NONOBJECTION',
        btnActionFunction: () => {},
        showDocumentUploaded: undefined,
        disabledDocumentUploadedBtn: undefined,
        tooltip: '',
      },
    };

    it('should call validateBtnsNotStartedReturned method for NOT_STARTED status', () => {
      let newPackage: BiddingProcessDocumentPackage = { ...item, status: 1 };
      allPackages.push(newPackage);
      const validateBtnsNotStartedReturnedSpy = jest.spyOn(
        service,
        'validateBtnsNotStartedReturned'
      );
      service.getButtonsVisiblity(
        newPackage,
        procurementProcess,
        dictionary,
        allPackages,
        disabledByPartipants
      );
      expect(validateBtnsNotStartedReturnedSpy).toHaveBeenCalledWith(
        newPackage,
        dictionary,
        procurementProcess,
        allPackages,
        disabledByPartipants
      );
    });

    it('should call validateBtnsNotStartedReturned method for RETURNED status', () => {
      item.status = DocumentPackagesStatus.RETURNED;
      const validateBtnsNotStartedReturnedSpy = jest.spyOn(
        service,
        'validateBtnsNotStartedReturned'
      );
      service.getButtonsVisiblity(
        item,
        procurementProcess,
        dictionary,
        allPackages,
        disabledByPartipants
      );
      expect(validateBtnsNotStartedReturnedSpy).toHaveBeenCalledWith(
        item,
        dictionary,
        procurementProcess,
        allPackages,
        disabledByPartipants
      );
    });

    it('should call validateBtnsCompleAmendment method for COMPLETE status', () => {
      item.status = DocumentPackagesStatus.COMPLETE;
      const validateBtnsCompleAmendmentSpy = jest.spyOn(
        service,
        'validateBtnsCompleAmendment'
      );
      service.getButtonsVisiblity(
        item,
        procurementProcess,
        dictionary,
        allPackages,
        disabledByPartipants
      );
      expect(validateBtnsCompleAmendmentSpy).toHaveBeenCalledWith(
        item,
        dictionary,
        procurementProcess,
        allPackages,
        disabledByPartipants
      );
    });

    it('should call validateBtnsCompleAmendment method for AMENDMENT_RETURNED status', () => {
      item.status = DocumentPackagesStatus.AMENDMENT_RETURNED;
      const validateBtnsCompleAmendmentSpy = jest.spyOn(
        service,
        'validateBtnsCompleAmendment'
      );
      service.getButtonsVisiblity(
        item,
        procurementProcess,
        dictionary,
        allPackages,
        disabledByPartipants
      );
      expect(validateBtnsCompleAmendmentSpy).toHaveBeenCalledWith(
        item,
        dictionary,
        procurementProcess,
        allPackages,
        disabledByPartipants
      );
    });

    it('should call validateBtnsCompleAmendment method for COMPLETE_AMENDMENT status', () => {
      item.status = DocumentPackagesStatus.COMPLETE_AMENDMENT;
      const validateBtnsCompleAmendmentSpy = jest.spyOn(
        service,
        'validateBtnsCompleAmendment'
      );
      service.getButtonsVisiblity(
        item,
        procurementProcess,
        dictionary,
        allPackages,
        disabledByPartipants
      );
      expect(validateBtnsCompleAmendmentSpy).toHaveBeenCalledWith(
        item,
        dictionary,
        procurementProcess,
        allPackages,
        disabledByPartipants
      );
    });

    it('should not call any validation method if procurementProcess status is MODIFIED', () => {
      procurementProcess.status =
        BiddingProcessProcurementProcessStatuses.MODIFIED;
      const validateBtnsNotStartedReturnedSpy = jest.spyOn(
        service,
        'validateBtnsNotStartedReturned'
      );
      const validateBtnsCompleAmendmentSpy = jest.spyOn(
        service,
        'validateBtnsCompleAmendment'
      );
      service.getButtonsVisiblity(
        item,
        procurementProcess,
        dictionary,
        allPackages,
        disabledByPartipants
      );
      expect(validateBtnsNotStartedReturnedSpy).not.toHaveBeenCalled();
      expect(validateBtnsCompleAmendmentSpy).not.toHaveBeenCalled();
    });
  });

  describe('isRequiredAmounterHigher', () => {
    it('should return true if the amount if higher than 200_000', async () => {
      const isHigher = service.isRequiredAmounterHigher(500_000_000);
      expect(isHigher).toBe(true);
    });

    it('should return true if the amount if higher than 200_000', async () => {
      const isHigher = service.isRequiredAmounterHigher(1_000);
      expect(isHigher).toBe(false);
    });
  });
});
