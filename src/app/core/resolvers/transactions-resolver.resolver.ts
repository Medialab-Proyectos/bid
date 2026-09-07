import { Injectable } from '@angular/core';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { EnumsStoreService } from '@core/services/store-services';

@Injectable({
  providedIn: 'root',
})
export class TransactionsResolver {
  constructor(
    readonly store: Store<AppState>,
    readonly enumStore: EnumsStoreService
  ) {}

  enums = ['transactionDocumentGroupCodes', 'TransactionStatuses'];

  resolve(): void {
    this.enumStore.loadEnum(this.enums);
  }
}
