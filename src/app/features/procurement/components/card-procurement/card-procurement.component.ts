import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-card-procurement',
  templateUrl: './card-procurement.component.html',
  styleUrls: ['./card-procurement.component.scss'],
})
export class CardProcurementComponent {
  @Input() data: any;

  public expanded: boolean;

  toogleExpanded() {
    this.expanded = !this.expanded;
  }
}
