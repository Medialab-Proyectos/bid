import { Component, Input, OnInit } from '@angular/core';
import { ProcurementComment } from '@fiduciary-interface/app/shared/components/dialog-comments/models';

@Component({
  selector: 'fi-plan-comments-details',
  templateUrl: './plan-comments-details.component.html',
})
export class PlanCommentsDetailsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  actualComments: ProcurementComment[];
  historicComments: ProcurementComment[];

  @Input() set comments(value: ProcurementComment[]) {
    this.actualComments = value.filter((c) => c.actual);
    this.historicComments = value.filter((c) => !c.actual);
  }
}
