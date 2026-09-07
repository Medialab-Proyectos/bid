import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModeEnum, PermissionEnum } from '@core/enums';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { BiddingContractDetail } from '@core/models';
import {
  BiddingContractAwardees,
  BiddingContractCurrenciesResponse,
  BiddingContractDocumentsResponse,
  BiddingContractLocationsResponse,
  BiddingContractLotsResponse,
  BiddingContractResponse,
  BiddingContractSecuritiesResponse,
} from '@core/models/responses/bidding-contracts-response.model';
import { ContractFormCompleteService } from '@core/services/forms/contract-form-complete.service';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { createContractsForm } from '../../components/contracts-form/contracts-form.form';

@Component({
  selector: 'fi-edit-contract',
  templateUrl: './edit-contract.component.html',
})
export class EditContractComponent implements OnInit {
  form: UntypedFormGroup = createContractsForm();
  formErrorCollection: string[] = [];
  mode = ModeEnum.UPDATE;
  public errorListTitle = 'CONTRACT.VALIDATION_ERRORS_TITLE';

  biddingContractId = '';
  procurementProcessId = '';
  stateSubmit = 'edit';
  visualCode = '';

  isLoading: boolean;

  contract: BiddingContractResponse;
  winnerInformation: BiddingContractAwardees[];
  destinationPlace: BiddingContractLocationsResponse;
  currencyList: BiddingContractCurrenciesResponse;
  lots: BiddingContractLotsResponse[];
  securities: BiddingContractSecuritiesResponse;
  documents: BiddingContractDocumentsResponse;

  contractEditPermission: PermissionEnum[] = [
    PermissionEnum.ENTER_UPDATE_CONTRACT_PROCUREMENT_INFORMATION,
    PermissionEnum.VIEW_PROCUREMENT_INFORMATION,
  ];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    private readonly contractFormSvc: ContractFormCompleteService,
    private readonly canDeactivateFromGuard: CanDeactivateFromGuard
  ) {}

  ngOnInit(): void {
    this.biddingContractId = this.activatedRoute.snapshot.params.contractId;
    this.procurementProcessId = this.activatedRoute.snapshot.params.processId;
    this.isLoading = true;
    this.getContractInformation(
      this.biddingContractId,
      this.procurementProcessId
    );
  }

  updateErrorList(event): void {
    this.formErrorCollection = event;
    if (this.formErrorCollection.length > 0) {
      document.getElementById('top').scrollIntoView();
    }
  }

  getContractInformation(
    biddingContractId: string,
    procurementProcessId: string
  ): void {
    this.contractFormSvc
      .getContractDetail(biddingContractId, procurementProcessId)
      .subscribe(
        (response: BiddingContractDetail) => {
          this.contractFormSvc.fillFormData(this.form, response, 'edit');
          this.visualCode = response.visualCode;
          this.isLoading = false;
        },
        (err) => {
          if (err) {
            this.notifications(
              this.translate.instant(
                'CONTRACT.TOASTMESSAGE.ERRORLOADINGINFORMATION'
              )
            );
          }
        }
      );
  }

  notifications(message: string): void {
    this.notificationGlobalService.showErrorUndefined(
      message,
      'right',
      'top',
      7000
    );
  }

  canDeactivate(): boolean | Observable<boolean | Observable<boolean>> {
    return this.canDeactivateFromGuard.openModalLogic(this.form);
  }
}
