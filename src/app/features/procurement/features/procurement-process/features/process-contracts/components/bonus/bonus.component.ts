import { Component, Input } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { ModeEnum, PermissionEnum } from '@core/enums';
import { BonusFormConfig } from '@core/models';
import { createBonusGroup } from '../aditional-information/aditional-information.form';

@Component({
  selector: 'fi-bonus',
  templateUrl: './bonus.component.html',
})
export class BonusComponent {
  @Input() addBonusPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() removeBonusPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  ModeEnum = ModeEnum;
  @Input() form = new UntypedFormArray([]);

  baseConfig: BonusFormConfig = {
    data: {
      bonusTypes: [],
      frequencies: [],
    },
    settings: {
      mode: ModeEnum.CREATE,
    },
  };

  /**
   * Set and update base config with config parameter
   */
  @Input() set config(config: BonusFormConfig) {
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

  addBonus(): void {
    this.form.push(createBonusGroup());
  }

  deleteBonus(index: number): void {
    this.form.removeAt(index);
  }
}
