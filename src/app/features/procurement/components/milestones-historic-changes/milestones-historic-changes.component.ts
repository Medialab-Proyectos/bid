import { Component, Input } from '@angular/core';
import { OutputsChanges } from '../../models';

@Component({
  selector: 'fi-milestones-historic-changes',
  templateUrl: './milestones-historic-changes.component.html',
})
export class MilestonesHistoricChangesComponent {
  @Input() data: OutputsChanges;

  constructor() {}
}
