import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-advance-milestone',
  templateUrl: './advance-milestone.component.html',
})
export class AdvanceMilestoneComponent {
  @Input() total: number = null;
  @Input() totalCompleted: number;
}
