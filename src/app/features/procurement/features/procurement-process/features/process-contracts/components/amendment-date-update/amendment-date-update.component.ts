import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { BiddingContractStatusesEnum } from '@core/enums';
import { createDateUpdateForm } from './amendment-date-update.form';

@Component({
  selector: 'fi-amendment-date-update',
  templateUrl: './amendment-date-update.component.html',
})
export class AmendmentDateUpdateComponent {
  @Input() number: string | number = '';
  @Input() form = createDateUpdateForm();
  @Input() startDateContract = null;
  @Input() endDateContract = null;
  @Input() signatureDateContract = null;
  @Input() displaySignatureWarning = false;
  @Input() set amendmentStatus(value: BiddingContractStatusesEnum) {
    if (
      value === BiddingContractStatusesEnum.AMENDMENT_REVIEWED ||
      value === BiddingContractStatusesEnum.SIGNED
    ) {
      this.showAlert = false;
    } else {
      this.showAlert = true;
    }
  }

  showAlert = true;

  get startDateControl(): UntypedFormControl {
    return this.form.get('startDate') as UntypedFormControl;
  }

  get endDateControl(): UntypedFormControl {
    return this.form.get('endDate') as UntypedFormControl;
  }

  get signatureDateControl(): UntypedFormControl {
    return this.form.get('signatureDate') as UntypedFormControl;
  }
}
