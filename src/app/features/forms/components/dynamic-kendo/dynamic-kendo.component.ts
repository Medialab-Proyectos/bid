import { Component, Input, OnInit } from '@angular/core';
import { FormTypesEnum } from '../../enums/form-types.enum';
import { FormGroup } from '@angular/forms';
import { FormStatusEnum } from '../../enums/form-status.enum';
import { RolEnum } from '@core/enums';
import { RoleObj } from '@core/models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Comments } from '../../models/comment.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlDropDownList } from '../constants/control-name-dropdownlist';

@Component({
  selector: 'fi-dynamic-kendo',
  templateUrl: './dynamic-kendo.component.html',
})
export class DynamicKendoComponent implements OnInit {
  @Input() component: any;
  @Input() dynamicForm: FormGroup;
  @Input() status: FormStatusEnum;
  @Input() rolUser: RoleObj;
  @Input() comments: Comments[];

  public types = FormTypesEnum;
  public charachtersCount = 0;
  public maxlength = 1000;
  public maxlengthTextArea = 3000;
  public counter = `${this.charachtersCount}/${this.maxlength}`;
  public dateMin: Date = null;
  public dateMax: Date = null;
  public isRequired = 'FORMS.VALIDATIONS.IS_REQUIRED';
  public hourDefault: Date = new Date();
  public source: Array<{
    description: string;
    id: number;
    text: string;
    value: number;
  }>;

  public data: Array<{
    description: string;
    id: number;
    text: string;
    value: number;
  }>;
  readonlyRichText: boolean;
  showGrid = false;

  public pasteCleanupSettings = {
    convertMsLists: true,
    removeHtmlComments: true,
    stripTags: ['span', 'h1', 'img'],
    removeAttributes: ['lang', 'style', 'class', 'contenteditable'],
    removeMsClasses: true,
    removeMsStyles: true,
    removeInvalidHTML: true,
  };

  public gridData: any[] = [
    { country: 'Alemania (+49)', code: '+49' },
    { country: 'Argentina (+54)', code: '+54' },
    { country: 'Austria (+43)', code: '+43' },
    { country: 'Bahamas (+1 242)', code: '+1 242' },
    { country: 'Bélgica (+32)', code: '+32' },
    { country: 'Barbados (+1 246)', code: '+1 246' },
    { country: 'Belice (+501)', code: '+501' },
    { country: 'Bolivia (+591)', code: '+591' },
    { country: 'Brasil (+55)', code: '+55' },
    { country: 'Canadá (+1)', code: '+1' },
    { country: 'Chile (+56)', code: '+56' },
    { country: 'Colombia (+57)', code: '+57' },
    { country: 'Costa Rica (+506)', code: '+506' },
    { country: 'Croacia (+385)', code: '+385' },
    { country: 'Dinamarca (+45)', code: '+45' },
    { country: 'Ecuador (+593)', code: '+593' },
    { country: 'El Salvador (+503)', code: '+503' },
    { country: 'España (+34)', code: '+34' },
    { country: 'Estados Unidos (+1)', code: '+1' },
    { country: 'Eslovenia (+386)', code: '+386' },
    { country: 'Finlandia (+358)', code: '+358' },
    { country: 'Francia (+33)', code: '+33' },
    { country: 'Guatemala (+502)', code: '+502' },
    { country: 'Guyana (+592)', code: '+592' },
    { country: 'Haití (+509)', code: '+509' },
    { country: 'Holanda (+31)', code: '+31' },
    { country: 'Honduras (+504)', code: '+504' },
    { country: 'Israel (+972)', code: '+972' },
    { country: 'Italia (+39)', code: '+39' },
    { country: 'Jamaica (+1 876)', code: '+1 876' },
    { country: 'Japón (+81)', code: '+81' },
    { country: 'México (+52)', code: '+52' },
    { country: 'Nicaragua (+505)', code: '+505' },
    { country: 'Noruega (+47)', code: '+47' },
    { country: 'Panamá (+507)', code: '+507' },
    { country: 'Paraguay (+595)', code: '+595' },
    { country: 'Perú (+51)', code: '+51' },
    { country: 'Portugal (+351)', code: '+351' },
    { country: 'Reino Unido (+44)', code: '+44' },
    { country: 'República de Corea (+82)', code: '+82' },
    { country: 'República Dominicana (+1 (809))', code: '+1 (809)' },
    { country: 'República Dominicana (+1 (829))', code: '+1 (829)' },
    { country: 'República Dominicana (+1 (849))', code: '+1 (849)' },
    { country: 'República Popular de China (+86)', code: '+86' },
    { country: 'Suecia (+46)', code: '+46' },
    { country: 'Suiza (+41)', code: '+41' },
    { country: 'Surinam (+597)', code: '+597' },
    { country: 'Trinidad y Tobago (+1 868)', code: '+1 868' },
    { country: 'Uruguay (+598)', code: '+598' },
    { country: 'Venezuela (+58)', code: '+58' },
  ];

  public colorLabel = {
    color: '',
  };

  constructor(
    private sanitizer: DomSanitizer,
    private readonly translate: TranslateService
  ) {}

  ngOnInit() {
    this.disabledInputs();
    this.enabledInputByComments();
    this.validateMinDate();
    this.formatDate();
    this.formatDateTime();
    this.onValueChangeTextBox(this.component.value, this.component.type);
    this.iniDropDown();
  }

  onValueChange(dateTimePickerValue, component): void {
    this.dynamicForm.controls[component.formControlName].setValue(
      dateTimePickerValue
    );
  }

  disabledInputs(): void {
    if (
      this.status === FormStatusEnum.VIEW ||
      this.status === FormStatusEnum.REVIEW ||
      this.status === FormStatusEnum.REVIEW_TEAM_LEADER ||
      this.status === FormStatusEnum.ADJUST_RETURNED
    ) {
      if (this.checkIsReadOnly()) {
        this.readonlyRichText = true;
      } else {
        this.dynamicForm.get(this.component.formControlName).disable();
      }
    }
  }

  enabledInputByComments(): void {
    if (
      this.status === FormStatusEnum.ADJUST_RETURNED &&
      this.isCoordinatorOrSpecialist(this.rolUser?.roleIdCode) &&
      this.checkCommentTeamLeader()
    ) {
      if (this.checkIsReadOnly()) {
        this.readonlyRichText = false;
      } else {
        this.dynamicForm.get(this.component.formControlName).enable();
      }
    }
  }

  public onValueChangeTextBox(ev: string, type: string): void {
    if (type === FormTypesEnum.TEXTBOX && this.maxlength > 0) {
      this.charachtersCount = ev.length;
      this.counter = `${this.charachtersCount}/${this.maxlength}`;
    }
  }

  public formatDate(): void {
    if (
      this.component.type === this.types.DATEPICKER ||
      this.component.type === this.types.DATETIMEPICKER
    ) {
      if (this.cheackValueDate(this.component.datePickerOptions.min)) {
        this.dateMin = new Date(this.component.datePickerOptions.min);
      }

      if (this.cheackValueDate(this.component.datePickerOptions.max)) {
        this.dateMax = new Date(this.component.datePickerOptions.max);
      }
    }
  }

  cheackValueDate(dateValidationValue: string): boolean {
    return dateValidationValue !== '' && dateValidationValue !== null;
  }

  handleTextSanitization(text: string): SafeHtml {
    const htmlTagRegex = /<(p|div|span|a)>/;
    if (htmlTagRegex.test(text)) {
      return this.sanitizer.bypassSecurityTrustHtml(text);
    }
    return text;
  }

  handleRequiredField(component: any) {
    const value = component.validators?.find(
      (val: any) => val?.errorMsg === this.isRequired
    )?.value;

    return value?.toLowerCase() === 'true' ? true : false;
  }

  checkIsReadOnly(): boolean {
    return (
      this.component.type === FormTypesEnum.RICHTEXT ||
      this.component.type === FormTypesEnum.TEXTAREA
    );
  }

  formatDateTime(): void {
    if (
      this.component.type === this.types.TIMEPICKER ||
      this.component.type === this.types.DATETIMEPICKER
    ) {
      if (this.component.value.includes('Z')) {
        const [dateValues, timeValues] = this.component.value.split('T');

        const [year, month, day] = dateValues.split('-');
        const [hours, minutes, seconds] = timeValues
          .replace('Z', '')
          .split(':');

        this.hourDefault = new Date(
          +year,
          +month - 1,
          +day,
          +hours,
          +minutes,
          +seconds
        );
      }

      this.dynamicForm
        .get(this.component.formControlName)
        .setValue(this.hourDefault);
    }
  }

  isCoordinatorOrSpecialist(rol: string): boolean {
    return (
      rol === RolEnum.External_Coordinator ||
      rol === RolEnum.External_Procurement_Specialist
    );
  }

  clickCheckOpenInNewTab(event: any): void {
    let elementClass: DOMTokenList = null;
    if (event.target?.classList.length === 4) {
      elementClass = event.target.classList;
    }
    if (event.target?.firstElementChild?.classList.length === 4) {
      elementClass = event.target.firstElementChild.classList;
    }

    if (elementClass.contains('k-i-link')) {
      const checkbox = document.getElementById(
        'k-target-blank'
      ) as HTMLInputElement | null;

      checkbox.click();
    }
  }

  validateMinDate() {
    const { type, datePickerOptions, value } = this.component;
    const isDateTimePicker = type === this.types.DATETIMEPICKER;
    const isTimePicker = type === this.types.TIMEPICKER;
    const isDatePicker = type === this.types.DATEPICKER;
    if (isDateTimePicker || isTimePicker || isDatePicker) {
      if (datePickerOptions !== null && datePickerOptions.min !== '') {
        const minDate = new Date(datePickerOptions.min);
        const dateValue = new Date(value);
        this.hourDefault = dateValue < minDate ? minDate : dateValue;
      }
    }
  }

  getDefaultItem(): any {
    if (
      this.component.type === FormTypesEnum.DROPDONWLIST &&
      (this.component.formControlName ===
        ControlDropDownList.DOWN_BID_DOC_COST_LOCAL_CURRENCY ||
        this.component.formControlName === ControlDropDownList.LANGUAGE_CHECK ||
        this.component.formControlName ===
          ControlDropDownList.DOWN_BID_DOC_COST_OTHER_CURRENCY ||
        this.component.formControlName ===
          ControlDropDownList.DOWN_BID_SECURITY_TYPE_LOCAL_CURRENCY ||
        this.component.formControlName ===
          ControlDropDownList.DOWN_BID_SECURITY_TYPE_OTHER_CURRENCY)
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

  iniDropDown(): void {
    if (
      this.component?.type === this.types.DROPDONWLIST ||
      this.component?.type === this.types.DROPDOWNSPECIAL
    ) {
      this.source = this.component.dropdownOptions;
      this.data = this.component.dropdownOptions;
    }
  }

  handleFilter(value): void {
    this.data = this.source.filter(
      (s) => s.text.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  checkCommentTeamLeader(): boolean {
    if (this.comments.length !== 0) {
      return this.comments.some(
        (obj) =>
          obj.userRole === RolEnum.Team_Leader ||
          obj.userRole === RolEnum.Alternate_TeamLeader
      );
    }
    return false;
  }
}
