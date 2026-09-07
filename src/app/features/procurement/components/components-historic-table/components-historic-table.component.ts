import { Component, Input } from '@angular/core';
import { OutputsChanges } from '../../models';

@Component({
  selector: 'fi-components-historic-table',
  templateUrl: './components-historic-table.component.html',
})
export class ComponentsHistoricTableComponent {
  @Input() title: string;
  @Input() data: OutputsChanges;
  @Input() componentName: string;
  @Input() set isPreviousData(value: boolean) {
    if (value) {
      this.dateLiteral =
        'PROCUREMENT.HISTORIC_CHANGES.COMPONENTS.PREVIOUS_MODIFICATION_DATE';
    } else {
      this.dateLiteral =
        'PROCUREMENT.HISTORIC_CHANGES.COMPONENTS.MODIFICATION_DATE';
    }
  }

  dateLiteral: string;

  constructor() {}
}
