import { Injectable } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { EMPTY, Observable, filter, map, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ExchangeRateDialogComponent } from '../components/exchange-rate-dialog/exchange-rate-dialog.component';
import { AddPaymentsDialogComponent } from '../components/add-payments-dialog/add-payments-dialog.component';
import { UpdatePaymentDialogComponent } from '../components/update-payment-dialog/update-payment-dialog.component';
import { ImportedPaymentsDialogComponent } from '../components/imported-payments-dialog/imported-payments-dialog.component';
import { PaymentMechanismDialogComponent } from '../components/payment-mechanism-dialog/payment-mechanism-dialog.component';
import { PickPaymentsDialogComponent } from '../components/pick-payments-dialog/pick-payments-dialog.component';
import { PickCommitmentDialogComponent } from '../components/pick-commitment-dialog/pick-commitment-dialog.component';
import {
  Commitment,
  CommitmentPayment,
  ImportValidationResult,
  ProjectComponent,
} from '../models/payment-record.model';

/** What a dialog reports back through `DialogRef.close()`. */
interface DialogOutcome {
  saved?: boolean;
  confirmed?: boolean;
  /** The add-payments dialog hands over the parsed file for review. */
  imported?: ImportValidationResult;
  /** The pick-payments dialog hands over what the user ticked. */
  paymentIds?: string[];
  /** The pick-commitment dialog hands over the one commitment chosen. */
  commitmentId?: string;
}

/**
 * Opens the module dialogs. Kept inside the feature instead of the shared
 * `ModalService`, which already carries every other screen's modal and would
 * gain a dependency on this feature for no benefit.
 *
 * Every method emits only when the user confirmed; cancelling, pressing escape
 * or clicking the backdrop completes without emitting, so callers can simply
 * subscribe and refresh.
 */
@Injectable()
export class PaymentRecordDialogService {
  constructor(
    private readonly dialogService: DialogService,
    private readonly translate: TranslateService
  ) {}

  openExchangeRates(projectBucketId: string): Observable<boolean> {
    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.EXCHANGE_RATE.TITLE'),
      content: ExchangeRateDialogComponent,
      cssClass: 'pr-modal',
      width: 900,
    });

    const instance = dialog.content.instance as ExchangeRateDialogComponent;
    instance.projectBucketId = projectBucketId;

    return this.confirmed(dialog.result);
  }

  /**
   * Adding payments is one or two steps: taking them from the schedule ends
   * here, while importing a file continues into the review of what was parsed.
   */
  openAddPayments(
    commitmentId: string,
    components: ProjectComponent[],
    contractCurrency?: string
  ): Observable<boolean> {
    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.ADD_PAYMENTS.TITLE'),
      content: AddPaymentsDialogComponent,
      cssClass: 'pr-modal',
      // Wide enough for the four sources to sit side by side.
      width: 1120,
    });

    const instance = dialog.content.instance as AddPaymentsDialogComponent;
    instance.commitmentId = commitmentId;
    instance.components = components;
    instance.contractCurrency = contractCurrency ?? '';

    return dialog.result.pipe(
      switchMap((outcome) => {
        const result = outcome as DialogOutcome;
        if (result?.imported) {
          return this.openImportedPayments(commitmentId, result.imported);
        }
        return result?.saved ? [true] : EMPTY;
      })
    );
  }

  private openImportedPayments(
    commitmentId: string,
    imported: ImportValidationResult
  ): Observable<boolean> {
    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.IMPORT.TITLE'),
      content: ImportedPaymentsDialogComponent,
      cssClass: 'pr-modal',
      width: 1040,
    });

    const instance = dialog.content.instance as ImportedPaymentsDialogComponent;
    instance.commitmentId = commitmentId;
    instance.result = imported;

    return this.confirmed(dialog.result);
  }

  openPaymentMechanism(commitmentId: string): Observable<boolean> {
    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.MECHANISM.TITLE'),
      content: PaymentMechanismDialogComponent,
      cssClass: 'pr-modal',
      width: 1120,
    });

    const instance = dialog.content.instance as PaymentMechanismDialogComponent;
    instance.commitmentId = commitmentId;

    return this.confirmed(dialog.result);
  }

  /**
   * `manage`: only true from "Pagos del compromiso", the one screen that owns
   * this commitment's ledger directly rather than just reporting on it from a
   * request or a statement -- deleting a payment and declaring it reimbursable
   * only make sense there.
   */
  openUpdatePayment(
    payment: CommitmentPayment,
    position: number,
    total: number,
    manage = false
  ): Observable<boolean> {
    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.UPDATE_PAYMENT.TITLE'),
      content: UpdatePaymentDialogComponent,
      cssClass: 'pr-modal',
      // Four fields on the amount row: at 900 their labels wrapped to two
      // lines each and the last one dropped to a line of its own.
      width: 1040,
    });

    const instance = dialog.content.instance as UpdatePaymentDialogComponent;
    instance.payment = payment;
    instance.position = position;
    instance.total = total;
    instance.allowDelete = manage;
    instance.showReimbursable = manage;

    return this.confirmed(dialog.result);
  }

  /**
   * Direct payments are chosen at loan level, across every commitment, so this
   * dialog is not the commitment-scoped one. It offers the same three ways in
   * "Anadir pagos" does, so it needs the same width that gives them room.
   */
  openPickStatementPayments(projectBucketId: string): Observable<string[]> {
    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.PICK_PAYMENTS.TITLE'),
      content: PickPaymentsDialogComponent,
      cssClass: 'pr-modal',
      width: 1120,
    });

    const instance = dialog.content.instance as PickPaymentsDialogComponent;
    instance.projectBucketId = projectBucketId;

    return dialog.result.pipe(
      map((outcome) => (outcome as DialogOutcome)?.paymentIds ?? []),
      filter((paymentIds) => paymentIds.length > 0)
    );
  }

  /**
   * "Importar pagos" on the report list has no commitment of its own: the
   * list shows every commitment of the loan. This is the step in between --
   * pick the one the file belongs to -- before opening the real import
   * dialog (`openAddPayments`) for it.
   */
  openPickCommitment(commitments: Commitment[]): Observable<string> {
    const dialog = this.dialogService.open({
      title: this.translate.instant('PAYMENT_RECORD.PICK_COMMITMENT.TITLE'),
      content: PickCommitmentDialogComponent,
      cssClass: 'pr-modal',
      width: 720,
    });

    const instance = dialog.content.instance as PickCommitmentDialogComponent;
    instance.commitments = commitments;

    return dialog.result.pipe(
      map((outcome) => (outcome as DialogOutcome)?.commitmentId),
      filter((commitmentId): commitmentId is string => Boolean(commitmentId))
    );
  }

  private confirmed(result: Observable<unknown>): Observable<boolean> {
    return result.pipe(
      map((outcome) => Boolean((outcome as DialogOutcome)?.saved)),
      filter((saved) => saved)
    );
  }
}
