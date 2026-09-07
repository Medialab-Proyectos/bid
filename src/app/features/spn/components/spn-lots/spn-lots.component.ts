import { Component, Input } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { SpnSpdLotsForm } from '../../models/spn-spd.form';

@Component({
  selector: 'fi-spn-lots',
  templateUrl: './spn-lots.component.html',
  styleUrls: ['./spn-lots.component.scss'],
})
export class SpnLotsComponent {
  private _isSubmitted = false;

  @Input() lots: FormArray;
  @Input() optionsUnits;
  @Input()
  set isSubmitted(value: boolean) {
    this._isSubmitted = value;
    if (value === true) {
      this.markAllControlsTouched(this.lots);
    }
  }
  get isSubmitted(): boolean {
    return this._isSubmitted;
  }

  addLot(): void {
    this.lots.push(SpnSpdLotsForm());
    if (this.isSubmitted) {
      this.markAllControlsTouched(this.lots);
    }
  }

  removeLot(index: number): void {
    this.lots.parent.markAsDirty();
    this.lots.removeAt(index);
  }

  markAllControlsTouched(control: AbstractControl): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((ctrl) =>
        this.markAllControlsTouched(ctrl)
      );
    }
    control.markAsTouched();
    control.updateValueAndValidity({ onlySelf: true });
  }
}
