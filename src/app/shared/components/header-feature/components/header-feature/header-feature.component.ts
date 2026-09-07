import { Subscription } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import {
  BiddingProcessPlanStoreService,
  ProjectStoreService,
} from '@core/services/store-services';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'fi-header-feature',
  templateUrl: './header-feature.component.html',
})
export class HeaderFeatureComponent implements OnInit {
  readonly suscriptionsCollection: Subscription = new Subscription();

  @Input() title: string;
  @Input() subtitle: string;
  @Input() feature: string;
  @Input() needProcessId = true;

  contract: string;
  processCode: string;

  constructor(
    private readonly projectStoreSvc: ProjectStoreService,
    private readonly biddingStoreSvc: BiddingProcessPlanStoreService
  ) {}

  ngOnInit(): void {
    this.loadSelectedContract();
    const sub = this.biddingStoreSvc.biddingProcessPlan().subscribe((data) => {
      if (data && data.selectedBiddingProcessProcurementProcess) {
        this.processCode = data.selectedBiddingProcessProcurementProcess.code;
      }
    });
    this.suscriptionsCollection.add(sub);
  }

  loadSelectedContract(): void {
    const sub = this.projectStoreSvc
      .selectedProject()
      .pipe(filter((state) => !!state.selectedProject))
      .subscribe((data) => {
        this.contract = data.selectedProject.contract;
      });
    this.suscriptionsCollection.add(sub);
  }

  ngOnDestroy(): void {
    this.suscriptionsCollection.unsubscribe();
  }
}
