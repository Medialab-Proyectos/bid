import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { FormValidator } from '@fiduciary-interface/app/features/forms/models/dynamic-form.model';

@Component({
  selector: 'fi-form-errors-msg',
  templateUrl: './errors-msg.component.html',
})
export class ErrorsFormMsgComponent {
  @Input() control: UntypedFormControl;
  @Input() keys: FormValidator[] = [];

  public errorMsg(errors): string {
    const error = this.keys.find((k) => k.name === Object.keys(errors)[0]);
    return error ? error.errorMsg : String();
  }
}
