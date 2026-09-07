import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Beneficiary, BeneficiaryDetails } from '../../models';

@Component({
  selector: 'fi-beneficiary',
  templateUrl: './beneficiary.component.html',
})
export class BeneficiaryComponent implements OnChanges {
  @Input() beneficiary: Beneficiary;
  @Input() beneficiaryIndex: number;
  @Input() projectBucketId: string;
  @Input() beneficiaryDetails: BeneficiaryDetails;

  sections: string[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.beneficiaryDetails && changes.beneficiaryDetails.currentValue) {
      this.beneficiaryDetails = changes.beneficiaryDetails.currentValue;

      if (this.beneficiary && this.beneficiary.details) {
        this.beneficiarySections();
      }
    }
  }

  beneficiarySections(): void {
    this.sections = Object.keys(this.beneficiary.details);
  }
}
