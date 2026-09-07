import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CardSystem, CardSystemStatus } from './model/card-system';
import { WindowSizeService } from '@core/services/view';

@Component({
  selector: 'fiduciary-interface-card-system-operations',
  templateUrl: './card-system-operations.component.html',
})
export class CardSystemOperationsComponent {
  mobileView: boolean;
  screenHeight: number;
  screenWidth: number;
  expanded: boolean;

  available: CardSystemStatus = CardSystemStatus.available;
  unavailable: CardSystemStatus = CardSystemStatus.unavailable;
  partialOutage: CardSystemStatus = CardSystemStatus.partialOutage;

  @Input() data: CardSystem;

  @Output() selectedCardEmitter: EventEmitter<CardSystem> =
    new EventEmitter<CardSystem>();

  constructor(readonly windowSvc: WindowSizeService) {
    this.initMobileConditionals();
  }
  readonly subscriptions: Subscription[] = [];

  initMobileConditionals() {
    this.subscriptions.push(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
        this.expanded = !data.mobileView;
      })
    );
  }

  toogleExpanded() {
    if (!this.mobileView) {
      this.expanded = !this.expanded;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((el) => {
      el.unsubscribe();
    });
  }

  selectedCardMobile() {
    this.selectedCardEmitter.emit(this.data);
  }
}
