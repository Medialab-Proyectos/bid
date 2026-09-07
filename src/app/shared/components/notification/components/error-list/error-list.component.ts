import { Component, Input } from '@angular/core';
import { FormErrorTranslateKey } from '@core/services/validation/form-validation/formErrorTranslateKey.model';

@Component({
  selector: 'fi-error-list',
  templateUrl: './error-list.component.html',
})
export class ErrorListComponent {
  @Input() errorListTitle = 'SHARED.NOTIFICATION.ERROR_LIST.REVIEW_ERROR';
  @Input() errorList: FormErrorTranslateKey[] = [];
}
