import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectStoreService } from '@core/services/store-services';

import { TransactionHeaderBalances } from '../../models';
import { TransactionsStoreService } from '../../store/services/transactions-store.service';

@Component({
  selector: 'fi-transactions-header',
  templateUrl: './transactions-header.component.html',
})
export class TransactionsHeaderComponent implements OnInit, OnDestroy {
  readonly suscriptions: Subscription = new Subscription();

  @Input() transactionType: string;
  @Input() transaction: string;
  @Input() transactionDetailScreen: boolean = true;

  projectCode: number;

  contract$: Observable<string> = of();
  projectBalances$: Observable<TransactionHeaderBalances> = of();
  loading = true;
  @Input() expandedHeader = true;

  constructor(
    readonly transactionsStoreSvc: TransactionsStoreService,
    readonly projectStoreSvc: ProjectStoreService
  ) {}

  ngOnInit(): void {
    this.projectBalances$ = this.getProjectBalances();
    this.contract$ = this.loadProjectAndContract();
  }

  ngOnDestroy(): void {
    this.suscriptions.unsubscribe();
  }

  loadProjectAndContract(): Observable<string> {
    let contract = '';
    return this.projectStoreSvc.selectedProject().pipe(
      map((data) => {
        if (data && data.selectedProject) {
          const sub = this.transactionsStoreSvc
            .getOrLoadProjectBalancesAction(
              data.selectedProject.projectBucketId
            )
            .subscribe();
          this.suscriptions.add(sub);
          contract = data.selectedProject.contract;
        }
        return contract;
      })
    );
  }

  getProjectBalances(): Observable<TransactionHeaderBalances> {
    return this.transactionsStoreSvc.projectBalances().pipe(
      map((data) => {
        this.loading = data?.loading;
        return data?.projectBalances;
      })
    );
  }

  expandHeader(): void {
    this.expandedHeader = !this.expandedHeader;
  }
}
