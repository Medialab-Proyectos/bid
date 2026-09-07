import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Enumerator, MasterDataCountryEnum } from '@core/models';
import { FormType } from '@core/utils';
import { ContractsGeneralInfoModel } from '../../rebrand-form/models';
import { BiddingContractTypesV2 } from '../../enums';
import { Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ContractRebrandService } from '../../services/contract-rebrand.service';
import {
  GENERAL_INFORMATION_APPLICABLE_LAW,
  GENERAL_INFORMATION_CONFLICT_JUSTIFICATION_MAX_LENGT,
  GENERAL_INFORMATION_INTERNAL_NUMBER,
  GENERAL_INFORMATION_JUSTIFICATION_MAX_LENGTH,
  GENERAL_INFORMATION_NAME_MAX_LENGHT,
  GENERAL_INFORMATION_OBJECTIVE,
} from '../../rebrand-form/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-r-contracts-general-info',
  templateUrl: './r-contracts-general-info.component.html',
  styleUrls: ['./r-contracts-general-info.component.scss'],
})
export class RContractsGeneralInfoComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  readonly CONFLICT_RESOLUTION_OTHER_ID = 4;
  conflictResolutionOther = false;

  private translateService = inject(TranslateService);

  @Input() contractType;
  @Input() conflictResolution;
  @Input() goodsOrigin;
  @Input() biddingContractTypes: Enumerator[];
  @Input() biddingContractConflictResolutionMethods: Enumerator[];
  @Input() countries: MasterDataCountryEnum[];
  @Input() form: FormType<ContractsGeneralInfoModel>;
  @Input() isGoods: boolean;

  private readonly contractsSvc = inject(ContractRebrandService);

  SIGNATURE_MIN_DATE = new Date(2022, 0, 1);
  private cdr = inject(ChangeDetectorRef);
  maxDate = new Date();
  sortedContractTypes: Enumerator[];
  sortedCountries: MasterDataCountryEnum[];
  contractTypeOther: boolean;
  private destroy$ = new Subject<void>();
  GENERAL_INFORMATION_NAME_MAX_LENGHT = GENERAL_INFORMATION_NAME_MAX_LENGHT;
  GENERAL_INFORMATION_OBJECTIVE = GENERAL_INFORMATION_OBJECTIVE;
  GENERAL_INFORMATION_INTERNAL_NUMBER = GENERAL_INFORMATION_INTERNAL_NUMBER;
  GENERAL_INFORMATION_APPLICABLE_LAW = GENERAL_INFORMATION_APPLICABLE_LAW;
  GENERAL_INFORMATION_JUSTIFICATION_MAX_LENGTH =
    GENERAL_INFORMATION_JUSTIFICATION_MAX_LENGTH;
  GENERAL_INFORMATION_CONFLICT_JUSTIFICATION_MAX_LENGT =
    GENERAL_INFORMATION_CONFLICT_JUSTIFICATION_MAX_LENGT;

  constructor() {}

  ngAfterViewInit(): void {
    this.contractTypeOther =
      this.form.controls.contractType.value === BiddingContractTypesV2.OTHER;
    this.conflictResolutionOther =
      this.form.controls.conflictResolutionMethod.value ===
      this.CONFLICT_RESOLUTION_OTHER_ID;
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.form.controls.signatureDate?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.contractsSvc.setSignDate(data);
        this.form.controls.startDate?.updateValueAndValidity();
      });

    this.form.controls.startDate.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.controls.endDate?.updateValueAndValidity();
      });

    this.form.controls.conflictResolutionMethod.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.conflictResolutionOther =
          value === this.CONFLICT_RESOLUTION_OTHER_ID;

        const descControl = this.form.controls.conflictResolutionJustification;
        if (this.conflictResolutionOther) {
          descControl?.setValidators([Validators.required]);
        } else {
          descControl?.clearValidators();
          descControl?.setValue(null);
        }
        descControl?.updateValueAndValidity();
      });

    this.form.controls.contractType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.contractTypeOther = data === BiddingContractTypesV2.OTHER;

        if (this.contractTypeOther) {
          this.form.controls.justification?.setValidators([
            Validators.required,
          ]);
        } else {
          this.form.controls.justification?.clearValidators();
          this.form.controls.justification?.setValue(null);
        }
        this.form.controls.justification?.updateValueAndValidity();
      });

    this.form.controls.hasAdvancePayment.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const parentForm = this.form.parent;
        if (parentForm) {
          parentForm.updateValueAndValidity();
        }
      });
    this.form.controls.conflictResolutionMethod.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.conflictResolutionOther =
          value === this.CONFLICT_RESOLUTION_OTHER_ID;

        const descControl = this.form.controls.conflictResolutionJustification;
        if (this.conflictResolutionOther) {
          descControl?.setValidators([Validators.required]);
        } else {
          descControl?.clearValidators();
          descControl?.setValue(null);
        }
        descControl?.updateValueAndValidity();
      });
    this.sortContractType();
    this.sortMemberCountries();
  }

  private sortMemberCountries() {
    this.sortedCountries = [...this.countries?.filter((c) => c.isActive)].sort(
      (a, b) => {
        const countryA = this.translateService
          .instant(a.translatedName)
          .toLowerCase();
        const countryB = this.translateService
          .instant(b.translatedName)
          .toLowerCase();
        return countryA.localeCompare(countryB);
      }
    );
  }

  getCountryCode(countryEnum: string): string {
    return countryEnum.split('.').pop() || '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private sortContractType() {
    if (!this.biddingContractTypes) return;

    this.sortedContractTypes = [...this.biddingContractTypes].sort((a, b) => {
      const typeA = this.translateService.instant(a.name).toLowerCase();
      const typeB = this.translateService.instant(b.name).toLowerCase();
      return typeA.localeCompare(typeB);
    });
  }

  getContractObjectiveLength() {
    return this.form?.controls?.contractObjective?.value?.length;
  }

  getContractNameLength() {
    return this.form?.controls?.contractName?.value?.length ?? 0;
  }

  getContractJustificationLength() {
    return this.form?.controls?.justification?.value?.length ?? 0;
  }

  getContractConflictJustificationLength() {
    return (
      this.form?.controls?.conflictResolutionJustification?.value?.length ?? 0
    );
  }
}
