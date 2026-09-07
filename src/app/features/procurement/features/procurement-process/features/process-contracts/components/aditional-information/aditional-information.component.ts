import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { ModeEnum, PermissionEnum } from '@core/enums';
import {
  AditionalInformationFormConfig,
  CurrencyChangeEvent,
} from '@core/models';
import { createAditionalInformationForm } from './aditional-information.form';

@Component({
  selector: 'fi-aditional-information',
  templateUrl: './aditional-information.component.html',
})
export class AditionalInformationComponent {
  @Input() addSecurityPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeSecurityPermission: PermissionEnum[] = [
    PermissionEnum.SPECIAL,
  ];
  @Input() addLiqDamagesPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeLiqDamagesPermission: PermissionEnum[] = [
    PermissionEnum.SPECIAL,
  ];
  @Input() addBonusPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeBonusPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() form: UntypedFormGroup = createAditionalInformationForm();
  @Input() number: string | number = '';

  @Input() baseConfig: AditionalInformationFormConfig = {
    data: {
      bonusTypes: [],
      currencies: [],
      damagesTypes: [],
      frequencies: [],
      securityTypes: [],
    },
    settings: {
      mode: ModeEnum.CREATE,
      status: null,
    },
  };

  /**
   * Set and update base config with config parameter
   */
  @Input() set config(config: AditionalInformationFormConfig) {
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

  @Output() securityCurrencyChange = new EventEmitter<CurrencyChangeEvent>();

  get securityList(): UntypedFormArray {
    return this.form.get('securityList') as UntypedFormArray;
  }

  get damagesList(): UntypedFormArray {
    return this.form.get('damagesList') as UntypedFormArray;
  }

  get bonusList(): UntypedFormArray {
    return this.form.get('bonusList') as UntypedFormArray;
  }

  onSecurityCurrencyChange(event: CurrencyChangeEvent) {
    this.securityCurrencyChange.emit(event);
  }
}
