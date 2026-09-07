import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CodeNameEnum } from '@core/models';
import { DestinationPlaceFormConfig } from '@core/models/components/process-contract/destination-place.config.model';
import { createDestinationPlaceForm } from './destination-place.form';

@Component({
  selector: 'fi-destination-place',
  templateUrl: './destination-place.component.html',
})
export class DestinationPlaceComponent {
  @Input() form: UntypedFormGroup = createDestinationPlaceForm();
  @Input() number: string | number = '';

  public countries: CodeNameEnum[];
  public baseConfig: DestinationPlaceFormConfig = {
    data: {
      beneficiaryCountries: [],
    },
    settings: {
      disabled: false,
      status: null,
    },
  };

  @Input() set config(config: DestinationPlaceFormConfig) {
    this.baseConfig = { ...this.baseConfig, ...config };
  }
}
