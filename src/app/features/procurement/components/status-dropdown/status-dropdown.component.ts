import { Component, Input, OnInit } from '@angular/core';
import { PermissionEnum, SettingActionType, SettingType } from '@core/enums';
import {
  BiddingProcesses,
  Enums,
  GetSettingsResponse,
  KeyValueInput,
} from '@core/models';
import { ProcessConfiguration } from '@core/services/process-configuration.service';
import { BiddingProcessPlanStoreService } from '@core/services/store-services';
import { AppUtilsService } from '@fiduciary-interface/app/app-utils.service';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateEnumPipe } from '@fiduciary-interface/app/shared/pipes/translate-enum.pipe';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { PermissionService } from '@core/services/app/permission/permission.service';

@Component({
  selector: 'fi-status-dropdown',
  templateUrl: './status-dropdown.component.html',
})
export class StatusDropdownComponent implements OnInit {
  _item: BiddingProcesses;
  selectedValue: number;
  previousValue: number;
  attributesSettings: KeyValueInput[];
  isloading: boolean;

  Enums: Enums;
  prefix = 'ENUM.PROCUREMENT.PROCESS.STATUS.';

  @Input() permission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Input() disabled = false;
  @Input() data$: Observable<any> = of([]);
  @Input() set item(value: BiddingProcesses) {
    this._item = value;
    this.data$ = of([
      {
        text: this._item?.statusEnum?.name,
        value: this._item?.status,
      },
    ]);
    this.selectedValue = this._item?.status;
    this.previousValue = this.selectedValue;
  }

  @Input() countryCode: string;
  @Input() id: number;
  disableByPermission = false;

  constructor(
    private readonly utilsSvc: AppUtilsService,
    readonly configSvc: ProcessConfiguration,
    private readonly translateEnum: TranslateEnumPipe,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    readonly procurementStore: BiddingProcessPlanStoreService,
    private readonly permissionSvc: PermissionService
  ) {}

  ngOnInit(): void {
    this.disableByPermission =
      this.permissionSvc.haveSomePermissions(this.permission) ||
      this.permission.includes(PermissionEnum.SPECIAL);
  }

  public open(): void {
    this.isloading = true;

    this.buildAttributesArray();

    this.configSvc
      .settings(
        this.attributesSettings,
        SettingActionType.Extend,
        SettingType.Method
      )
      .subscribe(
        (data: GetSettingsResponse) => {
          this.successResponseConfig(data);
        },
        () => {
          this.errorResponse();
        }
      )
      .add(() => {
        this.isloading = false;
      });
  }

  valueChange(event: number): void {
    this.procurementStore.updateProcurementStatusAction(
      this._item.id,
      this.countryCode,
      event
    );
  }

  showErrorToast(): void {
    const msg = this.translate.instant(
      'PROCESS_DOC.DOC_BTNS.ERROR_SUBMIT_PACKAGE'
    );
    this.notificationGlobalService.showError(msg);
  }

  errorResponse(): void {
    this.data$ = of([
      {
        text: this._item?.statusEnum?.name,
        value: this._item?.status,
      },
    ]);
    this.showErrorToast();
  }

  successResponseConfig(data: GetSettingsResponse): void {
    const settings = data.settings;
    if (settings.length >= 1) {
      const formatedString = settings[0].values?.replace(/\\"/g, '"');
      if (formatedString !== '') {
        const newArray = JSON.parse(formatedString)
          .status[0].split(',')
          .map((el) => {
            return {
              text: `${this.prefix}${el}`,
              value: this.translateEnum.getIdByName(
                `${this.prefix}${el}`,
                Enums.biddingProcessProcurementProcessStatuses
              ),
            };
          });
        this.selectedValue = this._item.status;
        this.previousValue = this.selectedValue;
        this.data$ = of(newArray);
      } else {
        this.data$ = of([
          {
            text: this._item?.statusEnum?.name,
            value: this._item?.status,
          },
        ]);
      }
    }
  }

  buildAttributesArray(): void {
    const countryAttribute: KeyValueInput = {
      key: 'countryCode',
      value: this.countryCode,
    };
    const categoryAttribute: KeyValueInput = {
      key: 'category',
      value: this._item.category.name,
    };
    const procurementAttribute: KeyValueInput = {
      key: 'methods',
      value: this._item.procurementMethod.name,
    };
    const supervisionAttribute: KeyValueInput = {
      key: 'supervision',
      value: this._item.supervisionMethod.name,
    };
    const expiredAttribute: KeyValueInput = { key: 'expired', value: 'false' };

    this.attributesSettings = this.utilsSvc.buildAttributesArray(
      SettingType.Method,
      countryAttribute,
      categoryAttribute,
      procurementAttribute,
      null,
      supervisionAttribute,
      expiredAttribute
    );
    this.data$ = of([]);
  }
}
