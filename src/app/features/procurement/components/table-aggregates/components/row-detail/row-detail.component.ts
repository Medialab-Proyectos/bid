import { Component, Input } from '@angular/core';
import { BiddingProcesses } from '@core/models';

@Component({
  selector: 'fi-row-detail',
  templateUrl: './row-detail.component.html',
})
export class RowDetailComponent {
  @Input() item: BiddingProcesses;
}
