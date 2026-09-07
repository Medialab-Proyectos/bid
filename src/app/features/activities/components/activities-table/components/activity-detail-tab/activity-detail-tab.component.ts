import { Component, Input, OnInit } from '@angular/core';
import { ActivityTableRow } from '@fiduciary-interface/app/features/activities/models/activities.model';
import { SelectEvent } from '@progress/kendo-angular-layout';

@Component({
  selector: 'fi-activity-detail-tab',
  templateUrl: './activity-detail-tab.component.html',
})
export class ActivityDetailTabComponent implements OnInit {
  @Input() activityTableRow: ActivityTableRow;

  constructor() {}

  ngOnInit(): void {}

  public onTabSelect(e: SelectEvent): void {
    console.log(e);
  }
}
