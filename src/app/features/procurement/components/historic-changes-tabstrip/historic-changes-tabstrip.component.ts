import { Component, Input } from '@angular/core';
import { HistoricChanges } from '../../models';

@Component({
  selector: 'fi-historic-changes-tabstrip',
  templateUrl: './historic-changes-tabstrip.component.html',
})
export class HistoricChangesTabstripComponent {
  @Input() set changes(value: HistoricChanges) {
    this.tabstripChanges = {
      milestonesChanges: value?.milestonesChanges,
      componentsChanges: value?.componentsChanges,
      processChanges: null,
    };
  }

  tabstripChanges: HistoricChanges;

  constructor() {}
}
