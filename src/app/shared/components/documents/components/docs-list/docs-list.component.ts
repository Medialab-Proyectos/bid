import { Component, inject, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DocEnum,
  documentPackageGroupType,
  PermissionEnum,
  DocumentGroupMandatoryPublicationEnum,
  BiddingProcessProcurementProcessStatuses,
} from '@core/enums';
import { DocumentPackageName } from '@core/enums/documentPackageCode.enum';
import { GroupCodeEnum } from '@core/enums/groupCode.enum';
import {
  Enums,
  DocumentPackageGroupsTabs,
  DocumentPackage,
  BiddingProcessProcurementProcess,
  BiddingProcessDocumentPackage,
  CategoryObject,
} from '@core/models';

@Component({
  selector: 'fi-docs-list',
  templateUrl: './docs-list.component.html',
  providers: [],
})
export class DocsListComponent implements OnChanges {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  @Input() mode: string;
  @Input() groupsTabs: DocumentPackageGroupsTabs[];
  @Input() permissions: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() docPackage: DocumentPackage;
  @Input() packageId: string;
  @Input() category: CategoryObject;
  @Input() allPackages: BiddingProcessDocumentPackage[];
  @Input() procurementProcess: BiddingProcessProcurementProcess;

  groupEnum: string;
  GroupCodeEnum = GroupCodeEnum;
  groupCodeEnum = GroupCodeEnum;
  documentPackageGroupType = documentPackageGroupType;
  documentPackageNames = DocumentPackageName;
  docPackageGroupPublication = DocumentGroupMandatoryPublicationEnum;

  canRegisterNotice: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
  ];

  ngOnChanges() {
    switch (this.mode) {
      case DocEnum.CONTRACTS:
        this.groupEnum = Enums.biddingContractDocumentGroupCodes;
        break;
      case DocEnum.TRANSACTIONS:
        this.groupEnum = Enums.transactionDocumentGroupCodes;
        break;
      case DocEnum.PACKAGES:
        this.groupEnum = Enums.biddingProcessDocumentGroupCodes;
        break;
      case DocEnum.AMENDMENTS:
        this.groupEnum = Enums.biddingContractAmendmentDocumentGroupCodes;
        break;
      default:
        this.groupEnum = Enums.biddingProcessDocumentGroupCodes;
        break;
    }
  }

  goToRegisterEoi() {
    this.router.navigate([`${this.docPackage.id}`, 'eoi', 'register'], {
      relativeTo: this.activatedRoute,
    });
  }

  validateProcessState(): boolean {
    const notAllowedStates = [
      BiddingProcessProcurementProcessStatuses.CANCELLED,
      BiddingProcessProcurementProcessStatuses.MODIFIED,
      BiddingProcessProcurementProcessStatuses.UNDER_REVIEW_MODIFIED,
    ];
    return !notAllowedStates.includes(this.procurementProcess.status);
  }

  isNotice(groupCode: number): boolean {
    return [
      GroupCodeEnum.EOI,
      GroupCodeEnum.SPN,
      GroupCodeEnum.PV_SPN,
    ].includes(groupCode);
  }
}
