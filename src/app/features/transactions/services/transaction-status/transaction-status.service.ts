import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionStatusService {
  private _transactionStatusId = new BehaviorSubject(0);

  constructor() {}

  get transactionStatusId() {
    return this._transactionStatusId;
  }
}
