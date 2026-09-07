import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PersistTransactionEditService {
  public _transactionId = 0;

  constructor() {}

  setTransactionId(value: number) {
    this._transactionId = value;
  }

  get getTransactionId(): number {
    return this._transactionId;
  }

  public verifityTransactionId(transactionId: number): number {
    if (transactionId) {
      return transactionId;
    } else {
      this._transactionId = 0;
      return undefined;
    }
  }
}
