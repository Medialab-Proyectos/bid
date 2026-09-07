import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { createEmail } from '../modal/ubo-modal/ubo.form';
import { BidderForm, EmailForm } from '@core/models/ubo.model';

@Component({
  selector: 'fi-ubo-register-email',
  templateUrl: './ubo-register-email.component.html',
  styleUrls: [],
})
export class UboRegisterEmailComponent implements OnInit {
  @Input() set form(form: FormGroup<BidderForm>) {
    this.bidderForm = form;
    this.bidderName = this.bidderForm.controls.name.value;
  }
  bidderForm: FormGroup<BidderForm>;
  bidderName: string;

  ngOnInit(): void {
    this.emails.push(createEmail());
  }

  addRow(): void {
    this.emails.push(createEmail());
  }
  deleteRow(index: number): void {
    this.emails.removeAt(index);
  }

  preventSpaces(index: number): void {
    const emailControl = this.emails.controls[index].controls.email;
    if (emailControl) {
      const valueWithoutSpaces = emailControl.value.replace(/\s+/g, ''); // Elimina espacios
      if (emailControl.value !== valueWithoutSpaces) {
        emailControl.setValue(valueWithoutSpaces, { emitEvent: false }); // Actualiza sin disparar eventos adicionales
      }
    }
  }

  get emails(): FormArray<FormGroup<EmailForm>> {
    return this.bidderForm.controls.emails;
  }
}
