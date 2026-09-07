import { Component, Input, OnInit } from '@angular/core';
import { TransactionHeaderBalances } from '../../models';
import { TranslateService } from '@ngx-translate/core';
import { FiTransactionsApiService } from '../../services';
import { ProjectStoreService } from '@core/services/store-services';
import { filter, mergeMap, take, tap } from 'rxjs/operators';
import { SelectedProjectState } from '@core/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fi-project-balances',
  templateUrl: './project-balances.component.html',
})
export class ProjectBalancesComponent implements OnInit {
  @Input() projectBalances: TransactionHeaderBalances;
  @Input() loading: boolean;
  @Input() transactionDetailScreen;
  projectBucketId: string;
  showAlert: boolean;
  readonly subscriptionsCollection: Subscription[] = [];

  constructor(
    private readonly translate: TranslateService,
    readonly projectStoreSvc: ProjectStoreService,
    readonly transactionsApi: FiTransactionsApiService
  ) {}

  public textTooltip = this.translate.instant('TRANSACTION.TOOLTIP_TEXT');

  ngOnInit(): void {
    const sub = this.projectStoreSvc
      .selectedProject()
      .pipe(filter((res: SelectedProjectState) => res.selectedProject !== null))
      .pipe(take(1))
      .pipe(
        tap((data) => {
          this.projectBucketId = data.selectedProject.projectBucketId;
        })
      )
      .pipe(
        mergeMap((data) => {
          return this.transactionsApi.hasPendingTransactions(
            data.selectedProject.projectBucketId
          );
        })
      )
      .subscribe((data) => {
        this.showAlert = data;
      });

    this.subscriptionsCollection.push(sub);
  }
}
