import { CardSystem, CardSystemStatus } from './../model/card-system';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fiduciary-interface-details-system-operations',
  templateUrl: './details-system-operations.component.html',
})
export class DetailsSystemOperationsComponent implements OnInit {
  @Input() data: CardSystem;
  @Output() hideCard: EventEmitter<boolean> = new EventEmitter<boolean>();

  available: CardSystemStatus = CardSystemStatus.available;
  unavailable: CardSystemStatus = CardSystemStatus.unavailable;
  partialOutage: CardSystemStatus = CardSystemStatus.partialOutage;

  constructor() {}

  ngOnInit(): void {}

  goBack() {
    this.hideCard.emit(true);
  }
}
