import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BiddingMilestonesSchema } from '@core/models';
import { WindowSizeService } from '@core/services/view';

@Component({
  selector: 'fi-milestone-component',
  templateUrl: './milestone-component.component.html',
})
export class MilestoneComponentComponent implements OnDestroy {
  @Input() milestones: BiddingMilestonesSchema[];

  public subscriptionCollection: Subscription[] = [];
  public mobileView = false;

  constructor(readonly windowSvc: WindowSizeService) {
    this.initMobileConditionals();
  }

  expandMobile(index: number): void {
    if (this.mobileView) {
      const el = document.getElementById(`milestoneIndex${index}`);
      if (el.classList.contains('expanded')) {
        el.classList.remove('expanded');
        el.children[1].classList.add('d-none');
        el.children[2].classList.add('d-none');
        el.children[3].classList.add('d-none');
      } else {
        el.classList.add('expanded');
        el.children[1].classList.remove('d-none');
        el.children[2].classList.remove('d-none');
        el.children[3].classList.remove('d-none');
      }
    }
  }

  initMobileConditionals(): void {
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
