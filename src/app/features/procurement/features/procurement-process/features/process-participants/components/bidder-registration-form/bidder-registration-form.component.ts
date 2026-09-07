import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Enumerator, MasterDataCountry } from '@core/models';
import { newBidderRegistrationForm } from './bidder-registration-form.form';

@Component({
  selector: 'fi-bidder-registration-form',
  templateUrl: './bidder-registration-form.component.html',
})
export class BidderRegistrationFormComponent implements OnChanges {
  allCountries: MasterDataCountry[];
  isMemberSelectedCountry: boolean;

  @Output() bidderType: EventEmitter<number> = new EventEmitter();
  @Input() bidderForm: UntypedFormGroup = newBidderRegistrationForm();
  @Input() isParticipant: boolean;
  @Input() isReadOnly = false;
  @Input() requiredErrorMessage = 'BIDDER.REQUIRED';
  @Input() typeList: Enumerator[];
  @Input() economicSectorList: Enumerator[];
  @Input() id: number;
  @Input() countries: MasterDataCountry[];
  @Input() memberCountries: MasterDataCountry[];
  @Input() allUnfilterCountries: MasterDataCountry[] = [];
  @Input() hideAditionalFields: boolean;

  bidderTypeChange(type: number): void {
    this.bidderType.emit(type);
  }

  ngOnChanges(): void {
    this.allCountries = this.orderByName([
      ...this.memberCountries,
      ...this.countries,
    ]).filter(
      (item, index, self) =>
        index === self.findIndex((obj) => obj.id === item.id)
    );
    this.allUnfilterCountries = this.orderByName(this.allUnfilterCountries);
    this.valueChangeCountry(this.bidderForm.getRawValue().nationality);
  }

  orderByName(arr: MasterDataCountry[]): MasterDataCountry[] {
    return arr.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  }

  valueChangeCountry($event): void {
    this.isMemberSelectedCountry = this.allCountries.find(
      (c) => c.id === $event
    )?.isMember;
  }

  resetCountrySelection(): void {
    this.isMemberSelectedCountry = true;
  }

  get bidderNationality() {
    return this.bidderForm.controls.nationality.value;
  }
}
