import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { TransactionsTypes } from '../../enums';
import { createTransactionComponentsForm } from './transaction-components.form';

@Component({
  selector: 'fi-transaction-components',
  templateUrl: './transaction-components.component.html',
})
export class TransactionComponentsComponent
  implements OnInit, AfterViewChecked
{
  @ViewChild(TooltipDirective) tooltipDir: TooltipDirective;

  @Input() number = null;
  @Input() form = createTransactionComponentsForm();
  @Input() isLoading: boolean;
  @Input() approvedCurrency: string;
  @Input() readonly: boolean;
  @Input() transactionType: TransactionsTypes;
  readonlyDPS: boolean;
  readonlyDPI: boolean;

  constructor(private readonly changeDectector: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.transactionType === TransactionsTypes.DPS) {
      this.readonlyDPS = true;
    }
    if (this.transactionType === TransactionsTypes.DPI) {
      this.readonlyDPI = true;
    }
  }

  ngAfterViewChecked(): void {
    this.changeDectector.detectChanges();
  }

  get componentsArray(): UntypedFormArray {
    return this.form.get('components') as UntypedFormArray;
  }

  get totalsGroup(): UntypedFormGroup {
    return this.form.get('totals') as UntypedFormGroup;
  }

  onBlur(controlName: string, event: number, index: number): void {
    if (event === null) {
      this.componentsArray.controls.forEach((group, i) => {
        if (index === i) {
          group.get(controlName).setValue(0);
        }
      });
    }
  }

  showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;

    if (
      element.classList.contains('has-ellipsis') &&
      element.offsetWidth < element.scrollWidth
    ) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
}
