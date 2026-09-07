import { Component, inject, Input, OnInit } from '@angular/core';
import { FormType } from '@core/utils';
import { FormArray } from '@angular/forms';
import {
  ContractExecutionPlace,
  ExecutionLocation,
} from '../../rebrand-form/models';
import {
  createExecutionPlaceForm,
  createLocationForm,
  EXECUTION_PLACE_ADRRESS_MAX_LENGTH,
  EXECUTION_PLACE_POSTAL_CODE_MAX_LENGTH,
  EXECUTION_PLACE_LOCALITY_MAX_LENGTH,
} from '../../rebrand-form/forms';
import { MasterDataCountryEnum } from '@core/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'fi-r-contracts-execution-place',
  templateUrl: './r-contracts-execution-place.component.html',
  styleUrls: ['./r-contracts-execution-place.component.scss'],
})
export class RContractsExecutionPlaceComponent implements OnInit {
  private translateService = inject(TranslateService);

  @Input() form: FormType<ContractExecutionPlace> = createExecutionPlaceForm();
  @Input() countries: MasterDataCountryEnum[];
  @Input() operationCountryCode: string = '';

  sortedCountries: MasterDataCountryEnum[] = [];

  EXECUTION_PLACE_ADRRESS_MAX_LENGTH = EXECUTION_PLACE_ADRRESS_MAX_LENGTH;
  EXECUTION_PLACE_POSTAL_CODE_MAX_LENGTH =
    EXECUTION_PLACE_POSTAL_CODE_MAX_LENGTH;
  EXECUTION_PLACE_LOCALITY_MAX_LENGTH = EXECUTION_PLACE_LOCALITY_MAX_LENGTH;

  get locationsFormArray(): FormArray<FormType<ExecutionLocation>> {
    return this.form.controls.locations;
  }

  ngOnInit(): void {
    this.sortCountries();
  }

  addLocation(): void {
    const group = createLocationForm();
    group.controls.country.setValue(
      //TODO REMOVE MAGIC STRING
      this.operationCountryCode === 'RG' ? '' : this.operationCountryCode
    );
    this.locationsFormArray.push(group);
  }

  getCountryCode(countryEnum: string): string {
    return countryEnum.split('.').pop() || '';
  }

  removeLocation(index: number): void {
    if (this.locationsFormArray.length > 1) {
      this.locationsFormArray.removeAt(index);
    }
  }

  private sortCountries(): void {
    if (!this.countries) return;

    this.sortedCountries = [
      ...this.countries.filter((c) => c.isActive && c.isBorrower),
    ].sort((a, b) => {
      const translatedA = this.translateService
        .instant(a.translatedName)
        .toLowerCase();
      const translatedB = this.translateService
        .instant(b.translatedName)
        .toLowerCase();
      return translatedA.localeCompare(translatedB);
    });
  }
}
