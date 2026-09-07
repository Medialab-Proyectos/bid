import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { createContractObjetiveForm } from './contract-objetive.form';

@Component({
  selector: 'fi-contract-objetive',
  templateUrl: './contract-objetive.component.html',
})
export class ContractObjetiveComponent {
  @Input() form: UntypedFormControl = createContractObjetiveForm();
  @Input() number: string | number = '';
  @Input() object: string;
}
