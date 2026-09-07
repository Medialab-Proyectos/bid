import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ProcessOutputs } from '../../procurement-process.form';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IdNameString } from '@core/models';

@Component({
  selector: 'fi-process-outputs',
  templateUrl: './process-outputs.component.html',
})
export class ProcessOutputsComponent implements OnChanges {
  public requiredErrorMessage = this.translate.instant('PROCUREMENT.REQUIRED');

  @Input() totalAssigned = 100;
  @Input() components$: Observable<IdNameString[]>;
  @Input() componentsForm: UntypedFormGroup = ProcessOutputs();
  @Input() number: number;
  @Input() selectedOutputs$: Observable<IdNameString[]>;
  selectedId: string;
  @Input() readOnly = false;

  selectedsIds: string[];

  @Output() selectedComponent: EventEmitter<string> =
    new EventEmitter<string>();
  @Output() addOutput: EventEmitter<unknown> = new EventEmitter<unknown>();
  @Output() outputsTotal: EventEmitter<number> = new EventEmitter<number>();

  get outputsAsigned() {
    return this.componentsForm.get('outputsAsigned') as UntypedFormArray;
  }

  constructor(private readonly translate: TranslateService) {}

  ngOnChanges(): void {
    this.calcTotal();
  }

  selectComponent(event: string): void {
    this.selectedComponent.emit(event);
  }

  addOutputFormGroup(): void {
    this.addOutput.emit('added');
  }

  calcTotal(index?: number): void {
    this.outputsTotal.emit(index);
  }

  deleteOutputFormGroup(index: number): void {
    if (this.outputsAsigned.length > 1) {
      this.outputsAsigned.removeAt(index);
      this.calcTotal();
    }
  }

  onValueChange(id, index): void {
    this.outputsAsigned.controls.forEach((control, idx) => {
      if (control.value.id === id && idx !== index) {
        this.outputsAsigned
          .at(index)
          .patchValue({ id: null, percentage: null });
      }
    });
  }
}
