import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  SpecialOptions,
  JsonFormModel,
  FormValidator,
} from '../../models/dynamic-form.model';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { FormValidatorType } from '../../enums/validators-type.enum';
import { FormTypesEnum } from '../../enums/form-types.enum';

@Injectable({
  providedIn: 'root',
})
export class DynamicFormBuildService {
  private readonly basePath = `${environment.hostApi.fiduciaryProcessApi.endpoint}/api/`;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly httpClient: HttpClient
  ) {}

  getDynamicForm(
    type: string,
    operationNumber: string,
    language: string,
    biddingProcessProcurementProcessId: string
  ): Observable<any> {
    let url = `${this.basePath}biddingDocuments/forms?type=${type}&operationNumber=${operationNumber}&language=${language}`;

    if (!!biddingProcessProcurementProcessId) {
      url = `${url}&biddingProcessProcurementProcessId=${biddingProcessProcurementProcessId}`;
    }

    return this.httpClient.get<JsonFormModel>(url);
  }

  getDynamicFormById(formId: string): Observable<JsonFormModel> {
    const url = `${this.basePath}biddingDocuments/${formId}/form`;
    return this.httpClient.get<JsonFormModel>(url);
  }

  addControls(component, dynamicForm: UntypedFormGroup, state) {
    if (component.validators !== null) {
      const validators = this.addValidators(component.validators);
      dynamicForm.addControl(
        component.key,
        this.fb.control(
          { value: this.checkComponentType(component), disabled: false },
          validators
        )
      );
    } else {
      dynamicForm.addControl(
        component.key,
        this.fb.control({
          value: this.checkComponentType(component),
          disabled: false,
        })
      );
    }

    if (component.specialOptions !== null) {
      for (const row of component.specialOptions.rows) {
        for (const comp of row.components) {
          if (component.value === comp.associationNumber) {
            this.generateSpecialCaseForm(
              component.specialOptions,
              dynamicForm,
              state,
              this.checkComponentType(component)
            );
          }
        }
      }
    }
  }

  checkComponentType(component): any {
    switch (component.type) {
      case FormTypesEnum.DATEPICKER:
      case FormTypesEnum.DATETIMEPICKER:
        return new Date(component.value);
      case FormTypesEnum.INPUTNUMERIC:
        if (component.value !== '') {
          return Number(component.value);
        }
      default:
        return component.value;
    }
  }

  addValidators(validators: FormValidator[]) {
    const validatorsList = [];
    for (const val of validators) {
      switch (val.name) {
        case FormValidatorType.REQUIRED:
          validatorsList.push(Validators.required);
          break;
        case FormValidatorType.MIN_LENGTH:
          validatorsList.push(Validators.minLength(Number(val.value)));
          break;
        case FormValidatorType.MAX_LENGTH:
          validatorsList.push(Validators.maxLength(Number(val.value)));
          break;
        case FormValidatorType.PATTERN:
          validatorsList.push(Validators.pattern(new RegExp(val.value)));
          break;
        case FormValidatorType.MAX_ERROR:
          validatorsList.push(Validators.max(Number(val.value)));
          break;
        case FormValidatorType.MIN_ERROR:
          validatorsList.push(Validators.min(Number(val.value)));
          break;
        default:
          break;
      }
    }
    return validatorsList;
  }

  generateForm(
    formModel: JsonFormModel,
    dynamicForm: UntypedFormGroup,
    state: FormStatusEnum
  ) {
    for (const numeral of formModel.numerals) {
      for (const row of numeral.rows) {
        for (const component of row.components) {
          this.addControls(component, dynamicForm, state);
        }
      }
    }
  }

  generateSpecialCaseForm(
    component: SpecialOptions,
    dynamicForm: UntypedFormGroup,
    state: FormStatusEnum,
    componentValue: number
  ) {
    for (const row of component.rows) {
      for (const component of row.components) {
        if (
          component.value !== null &&
          componentValue === component.associationNumber
        ) {
          this.addControls(component, dynamicForm, state);
        }
      }
    }
  }

  removeControls(component, dynamicForm: UntypedFormGroup) {
    dynamicForm.removeControl(component.key);
  }
}
