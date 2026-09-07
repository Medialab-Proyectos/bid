import { Component, Input } from '@angular/core';
import { DisbursementBalances } from '../../models';

@Component({
  selector: 'fi-components-table',
  templateUrl: './components-table.component.html',
  styleUrls: ['./components-table.component.scss'],
})
export class ComponentsTableComponent {
  @Input() disbursementBalances: DisbursementBalances;

  constructor() {}
}
