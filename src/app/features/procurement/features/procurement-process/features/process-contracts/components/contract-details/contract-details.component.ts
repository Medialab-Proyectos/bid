import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contract } from '@core/models';

@Component({
  selector: 'fi-contract-details',
  templateUrl: './contract-details.component.html',
})
export class ContractDetailsComponent {
  @Input() contract: Contract;
  @Output() goBack = new EventEmitter();

  goBackClick() {
    this.goBack.emit();
  }
}
