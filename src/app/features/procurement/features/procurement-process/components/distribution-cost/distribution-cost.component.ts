import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcurementProcessDetails } from '@core/models';
import { WindowSizeService } from '@core/services/view';

@Component({
  selector: 'fi-distribution-cost',
  templateUrl: './distribution-cost.component.html',
})
export class DistributionCostComponent implements OnDestroy, OnChanges {
  @Input() details: ProcurementProcessDetails;

  public subscriptionCollection: Subscription[] = [];
  public mobileView = false;
  public totalCounterPartCost: number;
  public totalBidAmount: number;
  public totalCofinancing: number;

  constructor(readonly windowSvc: WindowSizeService) {
    this.initMobileConditionals();
  }

  ngOnChanges(): void {
    if (this.details) {
      this.getTotals();
    }
  }

  getTotals(): void {
    this.totalCounterPartCost = 0;
    this.totalBidAmount = 0;
    this.totalCofinancing = 0;
    this.details.deliverables.forEach((el) => {
      this.totalCounterPartCost += el.localCounterpartActualCost;
      this.totalBidAmount += el.bidActualCost;
      this.totalCofinancing += el.coFinancingActualCost;
    });
  }

  initMobileConditionals() {
    this.subscriptionCollection.push(
      this.windowSvc.windowSizeChanged.subscribe((data) => {
        this.mobileView = data.mobileView;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptionCollection.forEach((el) => {
      el.unsubscribe();
    });
  }
}
