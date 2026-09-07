import { Component, Input } from '@angular/core';
import {
  BiddingContractStatusesEnum,
  ContractMenuOptionsEnum,
  PermissionEnum,
} from '@core/enums';
import { BiddingContractByProcess, Enums, LocationEnums } from '@core/models';
import { ContractsService } from '../../services/contracts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { PermissionService } from '../../../../../../../../core/services/app/permission/permission.service';

@Component({
  selector: 'fi-contracts-tables',
  templateUrl: './contracts-tables.component.html',
  styleUrls: ['./contracts-tables.component.scss'],
})
export class ContractsTablesComponent {
  constructor(
    readonly contractsSvc: ContractsService,
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly translateService: TranslateService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly permissionSvc: PermissionService
  ) {}

  @Input() contracts: BiddingContractByProcess[] = [];
  @Input() accordionSettings = [];
  @Input() procurementProcessId = '';
  @Input() selectedLanguage: string;
  @Input() title: string;
  @Input() isPlanNotInSync: boolean;

  locationEnums = LocationEnums;
  enum = Enums;
  contractTablePermission: PermissionEnum[] = [
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];

  collapseBtnFn(index: number): void {
    this.accordionSettings[index].collapse =
      !this.accordionSettings[index].collapse;
  }

  itemOption(option: string, contract: BiddingContractByProcess): void {
    switch (option) {
      case ContractMenuOptionsEnum.DELETE:
        this.contractsSvc.deleteContractLogic(
          contract.biddingContractId,
          this.procurementProcessId,
          contract.isCopy
        );
        break;
      case ContractMenuOptionsEnum.EDIT:
        this.decideVersionToEdit(contract);
        break;
      case ContractMenuOptionsEnum.TERMINATE:
        if (
          this.checkContractHasAmendmentStatus(contract, [
            BiddingContractStatusesEnum.PENDING_SIGNATURE,
            BiddingContractStatusesEnum.AMENDMENT_UNDER_REV,
          ])
        ) {
          this.errorToastMsg('CONTRACT.TERMINATE_CONTRACT_ERROR');
        } else {
          this.contractsSvc.terminateContractLogic(
            contract,
            this.procurementProcessId,
            this.selectedLanguage
          );
        }

        break;
      case ContractMenuOptionsEnum.AMENDMENT:
        this.router.navigate([`${contract.biddingContractId}/addAmendment`], {
          relativeTo: this.activatedRoute,
        });
        break;
      case ContractMenuOptionsEnum.COMPLETE:
        if (
          this.checkContractHasAmendmentStatus(contract, [
            BiddingContractStatusesEnum.PENDING_SIGNATURE,
            BiddingContractStatusesEnum.AMENDMENT_UNDER_REV,
          ])
        ) {
          this.errorToastMsg('CONTRACT.COMPLETE_CONTRACT_ERROR');
        } else {
          this.contractsSvc.completeContractLogic(
            contract,
            this.procurementProcessId,
            this.selectedLanguage
          );
        }
        break;
      default:
        break;
    }
  }

  checkContractHasAmendmentStatus(
    contract: BiddingContractByProcess,
    amendmentStatuses: BiddingContractStatusesEnum[]
  ): boolean {
    if (contract.amendments.length <= 0) {
      return false;
    }
    let i = 0;
    while (i < contract.amendments.length) {
      if (amendmentStatuses.includes(contract.amendments[i].contractStatus)) {
        return true;
      }
      i++;
    }
    return false;
  }
  detailContract(contract: BiddingContractByProcess, event): void {
    event.preventDefault();
    if (
      contract.contractStatus ===
        BiddingContractStatusesEnum.PENDING_SIGNATURE &&
      this.isPlanNotInSync
    ) {
      this.decideVersionToEdit(contract);
    } else {
      this.decideVersionToDetail(contract);
    }
  }

  errorToastMsg(keyMsg: string) {
    const message = this.translateService.instant(keyMsg);
    this.notificationGlobalService.showError(message);
  }

  decideVersionToDetail(contract: BiddingContractByProcess): void {
    const route = contract.isCopy
      ? `v2/${contract.biddingContractId}/detail`
      : `${contract.biddingContractId}/detail`;
    this.router.navigate([route], { relativeTo: this.activatedRoute });
  }

  decideVersionToEdit(contract: BiddingContractByProcess): void {
    const hasPermissionToEdit = !this.permissionSvc.hasPermission(
      PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION
    );
    const isContractAvailableToEdit =
      contract.contractStatus ===
        BiddingContractStatusesEnum.PENDING_SIGNATURE && this.isPlanNotInSync;
    const route = contract.isCopy
      ? isContractAvailableToEdit && hasPermissionToEdit
        ? `v2/${contract.biddingContractId}/detail`
        : `v2/${contract.biddingContractId}`
      : `${contract.biddingContractId}/edit`;

    this.router.navigate([route], { relativeTo: this.activatedRoute });
  }
}
