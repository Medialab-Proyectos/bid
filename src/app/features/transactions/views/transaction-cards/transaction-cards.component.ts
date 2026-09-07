import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionCard, TransactionsCardsResponse } from '../../models';
import { VisibilityService } from '@core/services/view';
import { ProjectStoreService } from '@core/services/store-services';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FiTransactionsApiService,
  TransactionsFormService,
} from '../../services';
import { exhaustMap, filter, map } from 'rxjs/operators';
import { SelectedProjectState } from '@core/store';

@Component({
  selector: 'fi-transaction-cards',
  templateUrl: './transaction-cards.component.html',
})
export class TransactionCardsComponent implements OnInit, OnDestroy {
  readonly subscriptions = new Subscription();
  transactionCard: TransactionCard[] = [];
  isLoading: boolean;

  constructor(
    readonly fiTransactionsApiService: FiTransactionsApiService,
    readonly transactionsFormService: TransactionsFormService,
    private readonly visibilityService: VisibilityService,
    readonly projectStoreService: ProjectStoreService,
    private readonly activatedRoute: ActivatedRoute,
    readonly router: Router
  ) {}

  ngOnInit(): void {
    this.visibilityServices();
    this.loadTransactionTypes();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadTransactionTypes(): void {
    this.isLoading = true;
    const sub = this.projectStoreService
      .selectedProject()
      .pipe(
        filter((res: SelectedProjectState) => res.selectedProject !== null),
        exhaustMap((value: SelectedProjectState) =>
          this.fiTransactionsApiService
            .getProjectTransactionTypes(value?.selectedProject?.projectBucketId)
            .pipe(
              map(
                (response: TransactionsCardsResponse) =>
                  response.transactionsType
              )
            )
        )
      )
      .subscribe(
        (data: TransactionCard[]) => {
          this.transactionCard = this.sortTransactionByType(data);
          this.isLoading = false;
        },
        () => {
          this.transactionsFormService.showErrorToast(
            'TRANSACTION.ERRORS.GET_CARDS_VALIDATION'
          );
          this.isLoading = false;
        }
      );
    this.subscriptions.add(sub);
  }

  initTransactionType(event: string): void {
    this.router.navigate([`../${event.toLowerCase()}`], {
      relativeTo: this.activatedRoute,
    });
  }

  visibilityServices(): void {
    this.visibilityService.setVisiblityProjectHeader(false);
    this.visibilityService.breadcrumbService.set(
      '@transactions',
      'BREADCRUMB.FINALCIAL_TRANSACTIONS'
    );
    this.visibilityService.breadcrumbService.set(
      '@newTransaction',
      'BREADCRUMB.TRANSACTION'
    );
  }

  sortTransactionByType(transaction: TransactionCard[]): TransactionCard[] {
    const sortedTransaction = transaction.sort((a, b) =>
      a.type.localeCompare(b.type)
    );
    const transactionCards = sortedTransaction;

    return [
      transactionCards[1],
      transactionCards[2],
      transactionCards[3],
      transactionCards[4],
      transactionCards[6],
      transactionCards[7],
      transactionCards[5],
      transactionCards[0],
    ].filter((item) => item !== null && item !== undefined);
  }
}
