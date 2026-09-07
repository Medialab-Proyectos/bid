import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BiddingContractStatusesEnum } from '@core/enums';
import { BiddingContractByProcess, Enums, LocationEnums } from '@core/models';

@Component({
  selector: 'fi-contract-amendments',
  templateUrl: './contract-amendments.component.html',
})
export class ContractAmendmentsComponent {
  @Input() data: BiddingContractByProcess[];
  @Input() contractId: string;
  @Input() contract: BiddingContractByProcess;
  @Input() locationEnums: LocationEnums;

  enum = Enums;

  constructor(
    readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  goToAmendment(
    $event,
    index: number,
    amendment: BiddingContractByProcess
  ): void {
    if (
      index + 1 === this.data.length &&
      (amendment.contractStatus ===
        BiddingContractStatusesEnum.PENDING_SIGNATURE ||
        amendment.contractStatus ===
          BiddingContractStatusesEnum.RETURNED_WITH_COMMENTS)
    ) {
      this.editAmendment($event, amendment.biddingContractId);
    } else {
      this.viewAmendment($event, amendment.biddingContractId);
    }
  }

  editAmendment($event, amendmentId: string): void {
    $event.preventDefault();
    this.router.navigate([`${this.contractId}/editAmendment/${amendmentId}`], {
      relativeTo: this.activatedRoute,
    });
  }

  viewAmendment($event, amendmentId: string): void {
    $event.preventDefault();
    this.router.navigate([`${this.contractId}/viewAmendment/${amendmentId}`], {
      relativeTo: this.activatedRoute,
    });
  }
}
