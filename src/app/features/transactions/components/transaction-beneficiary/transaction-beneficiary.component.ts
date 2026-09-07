import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  Beneficiary,
  BeneficiaryDetails,
  BeneficiaryEmmiter,
  ExecutorBeneficiaries,
} from '../../models';
import { Observable, Subscription } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { ProjectStoreService } from '@core/services/store-services';
import { transactionBeneficiaryForm } from './transaction-beneficiary.form';
import { FiTransactionsApiService } from '../../services';
import { map } from 'rxjs/operators';
import { TransactionsTypes } from '../../enums';

@Component({
  selector: 'fi-transaction-beneficiary',
  templateUrl: './transaction-beneficiary.component.html',
})
export class TransactionBeneficiaryComponent
  implements OnInit, OnDestroy, OnChanges
{
  private readonly subscriptions: Subscription = new Subscription();

  @Input() order: string;
  @Input() isEditMode = true;
  @Input() beneficiaryForm = transactionBeneficiaryForm();
  @Input() beneficiaries: Beneficiary[] = [
    {
      institutionName: '',
      acronym: '',
      beneficiaryName: '',
      accountNumber: '',
      bankFlowId: '',
      details: null,
    },
  ];
  @Input() projectBucketId: string;
  @Input() institutionNotFound: boolean;
  @Input() isInvalidBeneficiary: boolean;
  @Input() transactionType: TransactionsTypes;
  @Input() showAlert: boolean;

  TransactionsTypes = TransactionsTypes;

  @Output() beneficiaryEmmiter: EventEmitter<BeneficiaryEmmiter> =
    new EventEmitter<BeneficiaryEmmiter>();
  @Output() dpsbeneficiaryEmmiter: EventEmitter<Beneficiary[]> =
    new EventEmitter<Beneficiary[]>();
  @Output() reloadBeneficiaryEmmiter = new EventEmitter<unknown>();

  public filteredBeneficiaries: Beneficiary[] = [
    {
      institutionName: '',
      acronym: '',
      beneficiaryName: '',
      accountNumber: '',
      bankFlowId: '',
    },
  ];
  public executor: string;
  public executorAcronym: string;
  public beneficiaryDetails: BeneficiaryDetails;

  isLoading = false;

  constructor(
    private readonly projectStoreSvc: ProjectStoreService,
    readonly transactionApi: FiTransactionsApiService
  ) {}

  get bankFlowId() {
    return this.beneficiaryForm.get('bankFlowId') as UntypedFormControl;
  }

  get country() {
    return this.beneficiaryForm.get('country') as UntypedFormControl;
  }

  get acronym() {
    return this.beneficiaryForm.get('acronym') as UntypedFormControl;
  }

  get numberId() {
    return this.beneficiaryForm.get('numberId') as UntypedFormControl;
  }

  get institutionName() {
    return this.beneficiaryForm.get('institutionName') as UntypedFormControl;
  }

  ngOnInit(): void {
    if (this.transactionType !== TransactionsTypes.DPS) {
      this.getExecutor();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.beneficiaries) {
      this.beneficiaries = changes.beneficiaries.currentValue;
      this.filteredBeneficiaries = this.beneficiaries;

      if (this.beneficiaries) {
        this.setBeneficiaryDetails(this.beneficiaries);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getExecutor(): void {
    const sub = this.projectStoreSvc.selectedProject().subscribe((data) => {
      if (data && data.selectedProject) {
        this.executorAcronym = data.selectedProject.executorAcronym;
        this.executor = data.selectedProject.executor;
      }
    });
    this.subscriptions.add(sub);
  }

  filterValue(searchText: string): void {
    if (searchText === '') {
      this.filteredBeneficiaries = this.beneficiaries;
    } else if (searchText.length >= 3) {
      this.beneficiaryForm.reset();
      if (this.transactionType === TransactionsTypes.DPS) {
        this.getDpsBeneficiaries(searchText);
      } else {
        this.filteredBeneficiaries = this.beneficiaries.filter(
          (beneficiary) =>
            beneficiary.institutionName
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            beneficiary.acronym
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            beneficiary.beneficiaryName
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            beneficiary.accountNumber
              .toLowerCase()
              .includes(searchText.toLowerCase())
        );
      }
    }
  }

  onBeneficiaryChange(event: Beneficiary): void {
    this.beneficiaryForm.setValue({
      bankFlowId: event.bankFlowId,
      country: event.acronym,
      acronym: event.institutionName,
      institutionName: event.details?.beneficiaryBasicData?.country,
      numberId: event.beneficiaryId,
    });

    const output = {
      bankFlowId: event.bankFlowId,
      accountCurrency: event.details?.beneficiaryAccountData?.accountCurrency,
    };

    this.beneficiaryEmmiter.emit(output);
  }

  getBeneficiaryDetails(
    projectBucketId: string,
    beneficiary: Beneficiary
  ): Observable<BeneficiaryDetails> {
    return this.transactionApi
      .getBeneficiaryDetail(projectBucketId, beneficiary.bankFlowId)
      .pipe(
        map((data: BeneficiaryDetails) => (this.beneficiaryDetails = data))
      );
  }

  setBeneficiaryDetails(beneficiaries: Beneficiary[]): void {
    if (beneficiaries.length === 0) {
      this.isLoading = false;
    }

    beneficiaries.forEach((beneficiary, i, array) => {
      const sub = this.getBeneficiaryDetails(
        this.projectBucketId,
        beneficiary
      ).subscribe(
        (data) => {
          beneficiary.details = data;

          if (i === array.length - 1) {
            this.isLoading = false;
          }
        },
        () => {
          if (i === array.length - 1) {
            this.isLoading = false;
          }
        }
      );
      this.subscriptions.add(sub);
    });
    this.dpsbeneficiaryEmmiter.emit(beneficiaries);
  }

  getDpsBeneficiaries(searchText: string): void {
    this.isLoading = true;
    this.institutionNotFound = false;
    this.isInvalidBeneficiary = false;
    this.transactionApi
      .getBeneficiaries(this.projectBucketId, searchText, TransactionsTypes.DPS)
      .subscribe((data: ExecutorBeneficiaries) => {
        this.beneficiaries = data.beneficiaries;
        this.filteredBeneficiaries = data.beneficiaries;
        if (data.beneficiaries.length === 0) {
          this.institutionNotFound = false;
        } else {
          this.setBeneficiaryDetails(this.beneficiaries);
        }
      })
      .add(() => (this.isLoading = false));
  }

  reloadBeneficiary(): void {
    this.isLoading = true;
    this.beneficiaryForm.reset();
    this.reloadBeneficiaryEmmiter.emit();
  }
}
