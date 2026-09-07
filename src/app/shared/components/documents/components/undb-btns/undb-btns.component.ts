import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CategoryProcurement,
  DocumentGroupMandatoryPublicationEnum,
  DocumentPackagesStatus,
  FiduciaryProcessDocumentsStatusIdEnum,
  PermissionEnum,
  ProcurementMethodCode,
} from '@core/enums';
import { GroupCodeEnum } from '@core/enums/groupCode.enum';
import {
  BiddingProcessDocumentGroupConfiguration,
  BiddingProcessDocumentPackage,
  BiddingProcessProcurementProcess,
  CategoryObject,
  DocumentPackage,
  FiduciaryProcessDocument,
} from '@core/models';
import { SpnModalOptionsComponent } from '@fiduciary-interface/app/features/spn/components/spn-modal-options/spn-modal-options.component';

@Component({
  selector: 'fi-undb-btns',
  templateUrl: './undb-btns.component.html',
  styleUrls: ['./undb-btns.component.scss'],
})
export class UndbBtnsComponent {
  constructor(private dialog: MatDialog) {}
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  @Input() groupCode: number;
  @Input() category: CategoryObject;
  @Input() documentGroupConfiguration: BiddingProcessDocumentGroupConfiguration;
  @Input() fiduciaryProcessDocuments: FiduciaryProcessDocument[];
  @Input() docPackage: DocumentPackage;
  @Input() procurementProcess: BiddingProcessProcurementProcess;
  @Input() set allPackages(value: BiddingProcessDocumentPackage[]) {
    this._allPackages = value;
    this.getActualAndNextPackage(value);
  }

  canRegisterNotice: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];
  groupCodeEnum = GroupCodeEnum;
  docPackageGroupPublication = DocumentGroupMandatoryPublicationEnum;
  actualPackage: BiddingProcessDocumentPackage;
  nextPackage: BiddingProcessDocumentPackage;
  showEditEoiBtn: boolean;
  groupId;
  _allPackages: BiddingProcessDocumentPackage[];

  goToRegisterEoiAmendment() {
    this.router.navigate(
      [`${this.docPackage.id}`, 'eoi', `${this.groupId}`, 'register-amendment'],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }

  goToRegisterEoi() {
    this.router.navigate([`${this.docPackage.id}`, 'eoi', 'register'], {
      relativeTo: this.activatedRoute,
    });
  }

  getActualAndNextPackage(allPackages: BiddingProcessDocumentPackage[]) {
    const actualPackageOrder = allPackages.find(
      (ap) => ap.id === this.docPackage.id
    ).order;
    this.actualPackage = allPackages.find(
      (ap) => ap.order === actualPackageOrder
    );
    this.nextPackage = allPackages.find(
      (ap) => ap.order === actualPackageOrder + 1
    );
    this.validateBtnToShow();
  }

  validateBtnToShow() {
    const allowedPackagesStatus = [
      DocumentPackagesStatus.COMPLETE,
      DocumentPackagesStatus.COMPLETE_AMENDMENT,
    ];

    if (
      this.groupCode !== this.groupCodeEnum.EOI ||
      !allowedPackagesStatus.includes(this.actualPackage.status)
    ) {
      this.showEditEoiBtn = false;
      return;
    }
    const noticesWithId = this.fiduciaryProcessDocuments.filter(
      (d) => d.noticeId !== null
    );
    if (noticesWithId.length === 0) {
      this.showEditEoiBtn = false;
      return;
    }
    this.groupId = this.actualPackage.biddingProcessDocumentGroups.find(
      (g) => g.documentGroupCode === GroupCodeEnum.EOI
    ).id;
    const lastNotice = noticesWithId.reduce(
      (max, notice) =>
        notice.noticeVersion > max.noticeVersion ? notice : max,
      noticesWithId[0]
    );
    let showMandatory: boolean = false;

    const validNoticeStatus = [
      FiduciaryProcessDocumentsStatusIdEnum.PUBLISHED,
      FiduciaryProcessDocumentsStatusIdEnum.CONFIRMED,
      FiduciaryProcessDocumentsStatusIdEnum.SENT_TO_PUBLICATION,
    ].includes(lastNotice.noticeStatus.id);

    let nextPackageIncomplete =
      this.nextPackage.status !== DocumentPackagesStatus.COMPLETE;

    const mandatoryProcessStatus = [
      FiduciaryProcessDocumentsStatusIdEnum.PUBLISHED,
      FiduciaryProcessDocumentsStatusIdEnum.SENT_TO_PUBLICATION,
    ];
    const optionalProcessStatus = [
      FiduciaryProcessDocumentsStatusIdEnum.PUBLISHED,
      FiduciaryProcessDocumentsStatusIdEnum.SENT_TO_PUBLICATION,
      FiduciaryProcessDocumentsStatusIdEnum.CONFIRMED,
    ];
    if (
      this.documentGroupConfiguration.isMandatoryPublication ===
        DocumentGroupMandatoryPublicationEnum.YES &&
      mandatoryProcessStatus.includes(lastNotice.noticeStatus.id)
    ) {
      showMandatory = true;
    }
    if (
      this.documentGroupConfiguration.isMandatoryPublication ===
        DocumentGroupMandatoryPublicationEnum.OPTIONAL &&
      optionalProcessStatus.includes(lastNotice.noticeStatus.id)
    ) {
      showMandatory = true;
    }
    const lastNoticeEzShare = lastNotice.ezshareNumber !== null;
    this.showEditEoiBtn =
      validNoticeStatus &&
      nextPackageIncomplete &&
      showMandatory &&
      lastNoticeEzShare;
  }

  openModal() {
    const procurementConfig = new Map([
      [
        'works',
        {
          categories: [CategoryProcurement.PROCT_WORKS],
          methods: [
            ProcurementMethodCode.PROCT_CBSSTE,
            ProcurementMethodCode.PROCT_ICB,
            ProcurementMethodCode.PROCT_NCB,
          ],
          action: () => this.openSpnModal(),
        },
      ],
      [
        'goods_ncsv',
        {
          categories: [
            CategoryProcurement.PROCT_GOODS,
            CategoryProcurement.PROCT_NCSVC,
          ],
          methods: [
            ProcurementMethodCode.PROCT_CBSSTE,
            ProcurementMethodCode.PROCT_ICB,
            ProcurementMethodCode.PROCT_NCB,
          ],
          action: () => this.navigateToSpnRegister(),
        },
      ],
    ]);

    const currentCategory = this.procurementProcess?.category
      ?.name as CategoryProcurement;
    const currentMethod = this.procurementProcess?.procurementMethod
      ?.name as ProcurementMethodCode;

    for (const config of procurementConfig.values()) {
      if (
        config.categories.includes(currentCategory) &&
        config.methods.includes(currentMethod)
      ) {
        config.action();
        return;
      }
    }
  }

  private openSpnModal(): void {
    this.dialog.open(SpnModalOptionsComponent, {
      width: '700px',
      data: {
        packageId: this.docPackage.id,
      },
    });
  }

  private navigateToSpnRegister(): void {
    const newUrl = `${this.router.url}/${this.docPackage.id}/spn/register/sdo`;
    this.router.navigateByUrl(newUrl);
  }

  validateSPNBtn() {
    const validationStrategies = {
      [this.groupCodeEnum.SPN]: () => this.validateBasicConditions(),
      [this.groupCodeEnum.PV_SPN]: () =>
        this.validateBasicConditions() && this.validatePreviousPackage(),
    };

    const validator = validationStrategies[this.groupCode];
    return validator ? validator() : false;
  }

  private validateBasicConditions(): boolean {
    return (
      this.documentGroupConfiguration.isMandatoryPublication !==
        this.docPackageGroupPublication.NOT_REQUIRED &&
      this.fiduciaryProcessDocuments?.length === 0
    );
  }

  private validatePreviousPackage(): boolean {
    const prevPackage = this._allPackages.find(
      (p) => p.order === this.actualPackage.order - 1
    );
    return prevPackage?.status === DocumentPackagesStatus.COMPLETE;
  }
}
