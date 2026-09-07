import { Component, Input } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { ModeEnum, PermissionEnum } from '@core/enums';
import { DamagesFormConfig } from '@core/models';
import { createDamagesGroup } from '../aditional-information/aditional-information.form';

@Component({
  selector: 'fi-damages',
  templateUrl: './damages.component.html',
})
export class DamagesComponent {
  @Input() addLiqDamagesPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeLiqDamagesPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  ModeEnum = ModeEnum;
  @Input() form = new UntypedFormArray([]);

  baseConfig: DamagesFormConfig = {
    data: {
      damagesTypes: [],
      frequencies: [],
    },
    settings: {
      mode: ModeEnum.CREATE,
    },
  };

  /**
   * Set and update base config with config parameter
   */
  @Input() set config(config: DamagesFormConfig) {
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

  addDamages(): void {
    this.form.push(createDamagesGroup());
  }

  deleteDamages(index: number): void {
    this.form.removeAt(index);
  }
}
