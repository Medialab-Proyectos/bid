import { TransactionsTypes } from './../../enums/transactions-types.enum';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { VisibilityService } from '@core/services/view';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FiTransactionsApiService,
  TransactionsFormService,
} from '../../services';
import { Enums } from '@core/models';
import { AvailableNumbers } from '../../models';
import { Subscription } from 'rxjs';
import { TransactionsStatus} from '../../enums';

@Component({
  selector: 'fi-transaction-detail',
  templateUrl: './transaction-detail.component.html',
})
export class TransactionDetailComponent implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();

  @Input() isEditMode = true;
  @Input() detailForm: UntypedFormGroup;
  @Input() transactionNumber: string;
  @Input() isANT: boolean;
  @Input() isANI: boolean;
  @Input() transactionStatusId: number;
  @Input() set availableNumbers(ab: AvailableNumbers) {
    this.currentAvailableNumbers = { ...ab };
    this.selectedCurrentAvailableNumbers = { ...ab };
  }

  selectedCurrentAvailableNumbers: AvailableNumbers;
  currentAvailableNumbers: AvailableNumbers;

  public number = 1;
  MAX_NUMBER = 90000;
  public title = 'TRANSACION_DETAILS.TITLE';
  @Input() transactionType: TransactionsTypes;

  enum = Enums;
  isOcupied = false;
  isLoading: boolean;
  @Input() transactionId = this.activatedRoute.snapshot.params?.id;
  showExporToPdfButton: boolean;
  transactionsStatus = TransactionsStatus;

  constructor(
    readonly transactionsApiService: FiTransactionsApiService,
    readonly transactionsFormService: TransactionsFormService,
    readonly visibilitySvc: VisibilityService,
    readonly activatedRoute: ActivatedRoute
  ) {}

  get requestNumber() {
    return this.detailForm.get('requestNumber') as UntypedFormControl;
  }

  get partNumber() {
    return this.detailForm.get('partNumber') as UntypedFormControl;
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
      const reqNumbersValue =
        this.currentAvailableNumbers.currentRequestPartNumbers[
          this.partNumber.value
        ];

      this.isOcupied = this.transactionsFormService.areReqPartNumberOcupied(
        reqNumbersValue,
        this.requestNumber.value
      );

      if (
        this.selectedCurrentAvailableNumbers.partNumber ===
          this.partNumber.value &&
        this.selectedCurrentAvailableNumbers.requestNumber ===
          this.requestNumber.value
      ) {
        this.isOcupied = false;
      }
    });
    this.subscription.add(sub);
  }

  addRequestNumber(): void {
    if (this.currentAvailableNumbers.requestNumber === null) {
      this.currentAvailableNumbers.requestNumber =
        this.selectedCurrentAvailableNumbers.requestNumber;
      this.requestNumber.setValue(this.currentAvailableNumbers.requestNumber);
    } else if (this.currentAvailableNumbers.requestNumber < this.MAX_NUMBER) {
      this.currentAvailableNumbers.requestNumber++;
      this.requestNumber.setValue(this.currentAvailableNumbers.requestNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  subRequestNumber(): void {
    if (this.currentAvailableNumbers.requestNumber === null) {
      this.currentAvailableNumbers.requestNumber =
        this.selectedCurrentAvailableNumbers.requestNumber;
      this.requestNumber.setValue(this.currentAvailableNumbers.requestNumber);
    } else if (this.currentAvailableNumbers.requestNumber) {
      this.currentAvailableNumbers.requestNumber--;
      this.requestNumber.setValue(this.currentAvailableNumbers.requestNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  typedRequestNumber(event: number): void {
    this.currentAvailableNumbers.requestNumber = event;
    this.requestNumber.setValue(event);
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  addPartNumber(): void {
    if (this.currentAvailableNumbers.partNumber === null) {
      this.currentAvailableNumbers.partNumber =
        this.selectedCurrentAvailableNumbers.partNumber;
      this.partNumber.setValue(this.currentAvailableNumbers.partNumber);
    } else if (this.currentAvailableNumbers.partNumber < this.MAX_NUMBER) {
      this.currentAvailableNumbers.partNumber++;
      this.partNumber.setValue(this.currentAvailableNumbers.partNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  subPartNumber(): void {
    if (this.currentAvailableNumbers.partNumber === null) {
      this.currentAvailableNumbers.partNumber =
        this.selectedCurrentAvailableNumbers.partNumber;
      this.partNumber.setValue(this.currentAvailableNumbers.partNumber);
    } else if (this.currentAvailableNumbers.partNumber) {
      this.currentAvailableNumbers.partNumber--;
      this.partNumber.setValue(this.currentAvailableNumbers.partNumber);
    }
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  typedPartNumber(event: number): void {
    this.currentAvailableNumbers.partNumber = event;
    this.partNumber.setValue(event);
    this.detailForm.markAllAsTouched();
    this.detailForm.markAsDirty();
  }

  exportToPdf(): void {
    this.isLoading = true;
    this.transactionsFormService
      .exportToPdf(
        this.transactionId,
        this.transactionNumber,
        this.transactionType,
        [this.requestNumber.value]
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
}
