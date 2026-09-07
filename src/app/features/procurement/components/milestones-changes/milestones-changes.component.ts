import { Component, Input } from '@angular/core';
import { MilestoneChange, MilestonesChanges } from '../../models';

@Component({
  selector: 'fi-milestones-changes',
  templateUrl: './milestones-changes.component.html',
})
export class MilestonesChangesComponent {
  @Input() set changesMilestones(value: MilestonesChanges) {
    this.previousMilestonesData = value?.previousMilestones;
    this.newMilestonesData = value?.newMilestones;
  }

  previousMilestonesData: MilestoneChange[];
  newMilestonesData: MilestoneChange[];

  constructor() {}
}
