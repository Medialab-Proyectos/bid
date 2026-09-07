import { Component, Input, OnInit } from '@angular/core';
import { FormTypesEnum } from '../../enums/form-types.enum';
import { DynamicFormBuildService } from '../../services/dynamic-form/dynamic-form-build.service';
import { take } from 'rxjs/operators';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { FormGroup } from '@angular/forms';
import { RoleObj } from '@core/models';
import { Comments } from '../../models/comment.model';
import { RolEnum } from '@core/enums';
import { TranslateService } from '@ngx-translate/core';
import { ControlDropDownSpecial } from '../constants/control-name-dropdownspecial';

@Component({
  selector: 'fi-special-components',
  templateUrl: './special-components.component.html',
})
export class SpecialComponentsComponent implements OnInit {
  @Input() component: any;
  @Input() dynamicForm: FormGroup;
  @Input() status: FormStatusEnum;
  @Input() rolUser: RoleObj;
  @Input() comments: Comments[];

  public types = FormTypesEnum;
  public isRequired = 'FORMS.VALIDATIONS.IS_REQUIRED';

  constructor(
    private readonly dynamicFormBuildService: DynamicFormBuildService,
    private readonly translate: TranslateService
  ) {}

  handlerRadioButton(component) {
    this.dynamicForm
      .get(component.formControlName)
      .valueChanges.pipe(take(1))
      .subscribe((r) => {
        for (const row of component.specialOptions.rows) {
          for (const comp of row.components) {
            if (r === comp.associationNumber) {
              this.addControl(comp);
            } else {
              this.removeControl(comp);
            }
          }
        }
      });
  }

  handlerDropdownList(valueSelected: any, component) {
    for (const row of component.specialOptions.rows) {
      for (const comp of row.components) {
        if (valueSelected === comp.associationNumber) {
          this.addControl(comp);
        } else {
          this.removeControl(comp);
        }
      }
    }
  }

  addControl(component) {
    this.dynamicFormBuildService.addControls(
      component,
      this.dynamicForm,
      this.status
    );
  }

  removeControl(component) {
    this.dynamicFormBuildService.removeControls(component, this.dynamicForm);
  }

  ngOnInit(): void {
    this.disabledInputs();
    this.enabledInputByComments();
  }

  disabledInputs(): void {
    if (
      this.status === FormStatusEnum.VIEW ||
      this.status === FormStatusEnum.REVIEW ||
      this.status === FormStatusEnum.REVIEW_TEAM_LEADER ||
      this.status === FormStatusEnum.ADJUST_RETURNED
    ) {
      this.dynamicForm.get(this.component.formControlName).disable();
    }
  }

  enabledInputByComments(): void {
    if (
      this.status === FormStatusEnum.ADJUST_RETURNED &&
      (this.rolUser?.roleIdCode === RolEnum.External_Coordinator ||
        this.rolUser.roleIdCode === RolEnum.External_Procurement_Specialist) &&
      this.comments.length !== 0
    ) {
      this.dynamicForm.get(this.component.formControlName).enable();
    }
  }

  handleRequiredField(component: any) {
    const value = component.validators?.find(
      (val: any) => val?.errorMsg === this.isRequired
    )?.value;
    return value?.toLowerCase() === 'true' ? true : false;
  }

  getDefaultItemSpecial(): any {
    if (
      this.component.type === FormTypesEnum.DROPDOWNSPECIAL &&
      (this.component.formControlName === ControlDropDownSpecial.BID_SECURITY ||
        this.component.formControlName ===
          ControlDropDownSpecial.BID_SECURITY_TYPE)
    ) {
      if (
        this.component.defaultItem !== null &&
        this.component.defaultItem !== undefined
      ) {
        return {
          text: this.translate.instant(this.component.defaultItem),
          value: null,
        };
      }
    }
    return null;
  }
}
