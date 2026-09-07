import { Enumerator } from '@core/models';
import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AdditionalInformation } from '../../procurement-process.form';

@Component({
  selector: 'fi-process-additional-info',
  templateUrl: './process-additional-info.component.html',
})
export class ProcessAdditionalInfoComponent {
  @Input() adittionalInfo: UntypedFormGroup = AdditionalInformation();
  @Input() number = 5;
  @Input() radioOption: Enumerator[];
  @Input() goodsReferenceVisibility: boolean;
  @Input() showBAFO: boolean;
  @Input() showLots: boolean;
  @Input() isPROCT_PFA: boolean;
}