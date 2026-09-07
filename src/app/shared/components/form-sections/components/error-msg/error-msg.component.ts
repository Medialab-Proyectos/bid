import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'fi-form-error-msg',
  templateUrl: './error-msg.component.html',
})
export class ErrorFormMsgComponent {
  @Input() control: UntypedFormControl;
  @Input() key: string;
}
