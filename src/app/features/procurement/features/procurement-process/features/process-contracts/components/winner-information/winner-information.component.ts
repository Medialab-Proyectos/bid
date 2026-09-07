import { Component, Input, OnChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { ModeEnum } from '@core/enums';
import { WinnerInformationFormConfig } from '@core/models/components/process-contract/winner-information-form-config.model';
import { createWinnerInformationForm } from './winner-information-form.form';

@Component({
  selector: 'fi-winner-information',
  templateUrl: './winner-information.component.html',
})
export class WinnerInformationComponent implements OnChanges {
  ModeEnum = ModeEnum;
  @Input() form: UntypedFormGroup = createWinnerInformationForm();
  @Input() number: string | number = '';
  @Input() baseConfig: WinnerInformationFormConfig = {
    data: {
      memberCountries: [],
    },
    settings: {
      mode: ModeEnum.CREATE,
    },
  };

  ngOnChanges() {
    for (let index = 0; index < this.winnerList.length; index++) {
      this.winnerList.at(index).get('nationality').disable();
      this.winnerList.at(index).get('name').disable();
    }
  }

  /**
   * Set and update base config with config parameter
   */
  @Input() set config(config: WinnerInformationFormConfig) {
    this.baseConfig.data = { ...this.baseConfig.data, ...config.data };
    this.baseConfig.settings = {
      ...this.baseConfig.settings,
      ...config.settings,
    };
    if (this.baseConfig.settings.mode === ModeEnum.READ) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  get winnerList(): UntypedFormArray {
    return this.form?.get('winnerList') as UntypedFormArray;
  }
}
