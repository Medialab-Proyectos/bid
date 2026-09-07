import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Enums } from '@core/models';
import { VisibilityService } from '@core/services/view';
import { Subscription } from 'rxjs';
import { TransactionsStatus, TransactionsTypes } from '../../enums';
import { AvailableNumbers } from '../../models';
import { TransactionsFormService } from '../../services';
import { FiTransactionsApiService } from '../../services/fi-transactions-api/fi-transactions-api.service';

@Component({
  selector: 'fi-transaction-detail-atj',
  templateUrl: './transaction-detail-atj.component.html',
})
export class TransactionDetailAtjComponent implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();

  @Input() number = 1;
  @Input() isEditMode = true;
  @Input() detailForm: UntypedFormGroup;
  @Input() transactionNumberANJ: string;
  @Input() transactionNumberANT: string;
  @Input() transactionNumberATJ: string;
  @Input() transactionStatusId: TransactionsStatus;
  @Input() requestNumberANT: number;
  @Input() transactionType: TransactionsTypes;

  @Input() set availableNumbers(aN: AvailableNumbers) {
    this.currentAvailableNumbers = { ...aN };
    this.selectedAvailableNumbers = { ...aN };
    this.currentANJpartNumber = aN.partNumber;
    this.currentANJrequestNumber = aN.requestNumber;
    this.currentANTpartNumber = aN.partNumber;
    this.currentANTrequestNumber = this.requestNumberANT;
  }

  selectedAvailableNumbers: AvailableNumbers;
  currentAvailableNumbers: AvailableNumbers;
  currentANJrequestNumber: number;
  currentANJpartNumber: number;
  currentANTrequestNumber: number;
  currentANTpartNumber: number;

  MAX_NUMBER = 90000;
  public title = 'TRANSACION_DETAILS.TITLE';

  enum = Enums;
  isOcupiedANT = false;
  isOcupiedANJ = false;
  isLoading: boolean;
  @Input() transactionId: number = this.router.snapshot.params?.id;
  showExporToPdfButton: boolean;
  transactionsStatus = TransactionsStatus;

  constructor(
    readonly transactionsApiService: FiTransactionsApiService,
    readonly transactionsFormService: TransactionsFormService,
    readonly visibilitySvc: VisibilityService,
    readonly router: ActivatedRoute
  ) {}

  get requestNumberJustification() {
    return this.detailForm.get('requestNumberJustification') as UntypedFormControl;
  }

  get partNumberJustification() {
    return this.detailForm.get('partNumberJustification') as UntypedFormControl;
  }

  get requestNumberAdvanceOfFunds() {
    return this.detailForm.get('requestNumberAdvanceOfFunds') as UntypedFormControl;
  }

  get partNumberAdvanceOfFunds() {
    return this.detailForm.get('partNumberAdvanceOfFunds') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.visibilitySvc.setVisiblityProjectHeader(false);

    this.showExporToPdfButton =
      this.transactionsFormService.isExportToPdfVisible(
        this.transactionStatusId
      );

    this.detailFormValueChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  detailFormValueChanges(): void {
    const sub = this.detailForm.valueChanges.subscribe(() => {
      this.isOcupiedANJLogic();
      this.isOcupiedANTLogic();
    });
    this.subscription.add(sub);
  }

  isOcupiedANJLogic(): void {
    const reqNumbersValueANJ =
      this.currentAvailableNumbers.currentRequestPartNumbers[
        this.partNumberJustification.value
      ];

    this.isOcupiedANJ = this.transactionsFormService.areReqPartNumberOcupied(
      reqNumbersValueANJ,
      this.requestNumberJustification.value
    );

    if (
      this.selectedAvailableNumbers.requestNumber ===
        this.requestNumberJustification.value &&
      this.selectedAvailableNumbers.partNumber ===
        this.partNumberJustification.value
    ) {
      this.isOcupiedANJ = false;
    }

    if(this.equalRequestNumberANTAndANJ()){
      this.isOcupiedANJ = true;
    }
  }

  isOcupiedANTLogic(): void {
    const reqNumbersValueANT =
      this.currentAvailableNumbers.currentRequestPartNumbers[
        this.partNumberAdvanceOfFunds.value
      ];

    this.isOcupiedANT = this.transactionsFormService.areReqPartNumberOcupied(
      reqNumbersValueANT,
      this.requestNumberAdvanceOfFunds.value
    );

    if (
      this.selectedAvailableNumbers.requestNumber + 1 ===
        this.requestNumberAdvanceOfFunds.value &&
      this.selectedAvailableNumbers.partNumber ===
        this.partNumberAdvanceOfFunds.value
    ) {
      this.isOcupiedANT = false;
    }

    if(this.equalRequestNumberANTAndANJ()){
      this.isOcupiedANT = true;
    }
  }

  addRequestNumberANT(): void {
    if (this.currentANTrequestNumber === null) {
      this.currentANTrequestNumber = this.requestNumberANT;
      this.requestNumberAdvanceOfFunds.setValue(this.currentANTrequestNumber);
    } else if (this.currentANTrequestNumber < this.MAX_NUMBER) {
      this.currentANTrequestNumber++;
      this.requestNumberAdvanceOfFunds.setValue(this.currentANTrequestNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  subRequestNumberANT(): void {
    if (this.currentANTrequestNumber === null) {
      this.currentANTrequestNumber = this.requestNumberANT;
      this.requestNumberAdvanceOfFunds.setValue(this.currentANTrequestNumber);
    } else if (this.currentANTrequestNumber) {
      this.currentANTrequestNumber--;
      this.requestNumberAdvanceOfFunds.setValue(this.currentANTrequestNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  typedRequestNumberANT(event: number): void {
    this.currentANTrequestNumber = event;
    this.requestNumberAdvanceOfFunds.setValue(event);
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  addPartNumberANT(): void {
    if (this.currentANTpartNumber === null) {
      this.currentANTpartNumber = this.currentAvailableNumbers.partNumber;
      this.partNumberAdvanceOfFunds.setValue(this.currentANTpartNumber);
    } else if (this.currentANTpartNumber < this.MAX_NUMBER) {
      this.currentANTpartNumber++;
      this.partNumberAdvanceOfFunds.setValue(this.currentANTpartNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  subPartNumberANT(): void {
    if (this.currentANTpartNumber === null) {
      this.currentANTpartNumber = this.currentAvailableNumbers.partNumber;
      this.partNumberAdvanceOfFunds.setValue(this.currentANTpartNumber);
    } else if (this.currentANTpartNumber) {
      this.currentANTpartNumber--;
      this.partNumberAdvanceOfFunds.setValue(this.currentANTpartNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  typedPartNumberANT(event: number): void {
    this.currentANTpartNumber = event;
    this.partNumberAdvanceOfFunds.setValue(event);
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  addRequestNumberANJ(): void {
    if (this.currentANJrequestNumber === null) {
      this.currentANJrequestNumber = this.currentAvailableNumbers.requestNumber;
      this.requestNumberJustification.setValue(this.currentANJrequestNumber);
    } else if (this.currentANJrequestNumber < this.MAX_NUMBER) {
      this.currentANJrequestNumber++;
      this.requestNumberJustification.setValue(this.currentANJrequestNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  subRequestNumberANJ(): void {
    if (this.currentANJrequestNumber === null) {
      this.currentANJrequestNumber = this.currentAvailableNumbers.requestNumber;
      this.requestNumberJustification.setValue(this.currentANJrequestNumber);
    } else if (this.currentANJrequestNumber) {
      this.currentANJrequestNumber--;
      this.requestNumberJustification.setValue(this.currentANJrequestNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  typedRequestNumberANJ(event: number): void {
    this.currentANJrequestNumber = event;
    this.requestNumberJustification.setValue(event);
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  addPartNumberANJ(): void {
    if (this.currentANJpartNumber === null) {
      this.currentANJpartNumber = this.currentAvailableNumbers.partNumber;
      this.partNumberJustification.setValue(this.currentANJpartNumber);
    } else if (this.currentANJpartNumber < this.MAX_NUMBER) {
      this.currentANJpartNumber++;
      this.partNumberJustification.setValue(this.currentANJpartNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  subPartNumberANJ(): void {
    if (this.currentANJpartNumber === null) {
      this.currentANJpartNumber = this.currentAvailableNumbers.partNumber;
      this.partNumberJustification.setValue(this.currentANJpartNumber);
    } else if (this.currentANJpartNumber) {
      this.currentANJpartNumber--;
      this.partNumberJustification.setValue(this.currentANJpartNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  typedPartNumberANJ(event: number): void {
    this.currentANJpartNumber = event;
    this.partNumberJustification.setValue(event);
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  exportToPdf(): void {
    this.isLoading = true;
    this.transactionsFormService
      .exportToPdf(
        this.transactionId,
        this.transactionNumberATJ,
        this.transactionType,
        [
          this.requestNumberJustification.value,
          this.requestNumberAdvanceOfFunds.value,
        ]
      )
      .subscribe(
        () => {},
        () =>
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.ERROR_GENERATING_PDF'
          )
      )
      .add(() => (this.isLoading = false));
  }

  equalRequestNumberANTAndANJ(): boolean{
    var statusOfTransactions = [0, TransactionsStatus.DRAFT, TransactionsStatus.EDRAFT]
    if(this.requestNumberAdvanceOfFunds.value === this.requestNumberJustification.value && statusOfTransactions.includes(this.transactionStatusId)){
      if(this.partNumberAdvanceOfFunds.value === this.partNumberJustification.value && statusOfTransactions.includes(this.transactionStatusId)){
        return true;
      }
      else{
        return false;
      }
    }
    return false;
  }
}
