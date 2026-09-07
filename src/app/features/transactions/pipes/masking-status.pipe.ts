import { Pipe, PipeTransform } from '@angular/core';
import { TransactionsStatus } from '../enums';

@Pipe({
  name: 'fiMaskingState',
})
export class MaskingStatusPipe implements PipeTransform {
  transform(value: TransactionsStatus): number {
    switch (value) {
      case TransactionsStatus.PREV:
      case TransactionsStatus.PVAL:
      case TransactionsStatus.RETURNED:
      case TransactionsStatus.REJECT:
      case TransactionsStatus.PAUT:
      case TransactionsStatus.RFS:
        return TransactionsStatus.RECEIVEBYIDB;
      default:
        return value;
    }
  }
}
