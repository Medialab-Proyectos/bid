import {
  Component,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Currency } from '@core/models';
import { TransactionsFormService } from '../../services';
import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { addTotalItemsGroup } from './amounts-reimbursement.form';
import { TransactionsSource, TransactionsTypes } from '../../enums';
import { TransactionHeaderBalances } from '../../models';

@Component({
  selector: 'fi-amounts-reimbursement',
  templateUrl: './amounts-reimbursement.component.html',
})
export class AmountsReimbursementComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewChecked
{
  private readonly subscriptions = new Subscription();

  @Input() number = 2;
  @Input() form: UntypedFormGroup;
  @Input() readonly = false;
  @Input() balances: TransactionHeaderBalances;
  @Input() transactionType: TransactionsTypes;

  isLoading: boolean;
  selectedCurrency: Currency;
  currencyList: Observable<Currency[]>;
  approvedCurrency: Observable<string>;

  rows = [
    TransactionsSource.Idb,
    TransactionsSource.LocalCounterPart,
    TransactionsSource.CoFinancing,
  ];

  constructor(
    readonly transactionFormService: TransactionsFormService,
    private readonly changeDectector: ChangeDetectorRef
  ) {}

  get selectedRequestedCurrency(): UntypedFormControl {
    return this.form.get('selectedRequestedCurrency') as UntypedFormControl;
  }

  get totalItems(): UntypedFormArray {
    return this.form.get('totalItems') as UntypedFormArray;
  }

  get bidExpectedBalance(): UntypedFormControl {
    return this.totalItems.at(0).get('expectedBalances') as UntypedFormControl;
  }

  ngOnInit(): void {
    this.approvedCurrency = this.transactionFormService.getApprovedCurrency();
    this.currencyList = this.transactionFormService.loadCurrencies();

    this.setRequireToBidRow();
    this.formListener();
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (simpleChanges.balances) {
      this.setExpectedBalances(simpleChanges.balances.currentValue);
    }
    if (
      simpleChanges.balances &&
      simpleChanges.balances.currentValue &&
      !simpleChanges.balances.currentValue.cofinanced
    ) {
      this.totalItems.at(2).disable();
    }
    if (this.transactionType === TransactionsTypes.DPI) {
      this.totalItems.at(1).disable();
      this.totalItems.at(2).disable();
    }
    // A direct payment carries over what was already picked in Payment
    // Record: the requested currency and all three source amounts (IDB
    // included -- a direct payment to a third party has no local or
    // cofinancing split to distribute, so the IDB row is the only one
    // that ever has anything in it) come in already computed and are not
    // meant to be retyped here. Gated on the rows actually existing --
    // `totalItems` is still empty on the first change, before `balances`
    // (or, editing an existing transaction, the loaded totals) has arrived
    // to populate it, so this has to run every time `ngOnChanges` fires,
    // not once in `ngOnInit`, and only once there is a row 2 to disable.
    if (
      this.transactionType === TransactionsTypes.DPS &&
      this.totalItems.length === 3
    ) {
      this.totalItems.at(0).disable();
      this.totalItems.at(1).disable();
      this.totalItems.at(2).disable();
      this.selectedRequestedCurrency.disable();
    }
  }

  ngAfterViewChecked(): void {
    this.changeDectector.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setRequireToBidRow(): void {
    this.totalItems
      ?.at(0)
      .get('requestedAmount')
      .setValidators([Validators.required, Validators.min(1)]);
    this.totalItems.at(0).get('requestedAmount').updateValueAndValidity();
    this.totalItems
      ?.at(0)
      .get('equivalentCurrency')
      .setValidators([Validators.required, Validators.min(1)]);
    this.totalItems.at(0).get('equivalentCurrency').updateValueAndValidity();
  }

  setExpectedBalances(balances: TransactionHeaderBalances): void {
    this.balances = balances;

    this.rows.forEach((elem, index) => {
      if (balances && this.totalItems.controls.length < 3) {
        switch (index) {
          case 0:
            this.totalItems.push(
              addTotalItemsGroup(
                elem,
                index,
                balances.budgetContributionProjectedAvailableBalance
                  ? balances.budgetContributionProjectedAvailableBalance
                  : balances.projectedAvailableBalance
              )
            );
            break;
          case 1:
            this.totalItems.push(
              addTotalItemsGroup(elem, index, balances.localCounterpart)
            );
            break;
          case 2:
            this.totalItems.push(
              addTotalItemsGroup(elem, index, balances.cofinanced)
            );
            break;
        }
      }
    });
  }

  formListener(): void {
    const totalItemsSubs = this.totalItems.valueChanges.subscribe(() => {
      this.checkBidExpectedBalance();
    });

    const selectedRequestedCurrencySubs =
      this.selectedRequestedCurrency.valueChanges.subscribe((change) => {
        this.selectedCurrency = change;
      });

    this.subscriptions.add(totalItemsSubs);
    this.subscriptions.add(selectedRequestedCurrencySubs);
  }

  checkBidExpectedBalance(): void {
    if (this.bidExpectedBalance && this.bidExpectedBalance.value < 0) {
      this.bidExpectedBalance.setErrors({ notValid: true });
    }
  }
}
