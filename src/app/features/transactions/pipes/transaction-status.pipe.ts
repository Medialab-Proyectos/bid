import { Pipe, PipeTransform } from '@angular/core';
import { TransactionsStatus } from '../enums';

@Pipe({
  name: 'transactionStatus',
})
export class TransactionStatusPipe implements PipeTransform {
  transform(value: number, status: number): string {
    if (value !== null) {
      if (
        status === TransactionsStatus.EREJECT ||
        status === TransactionsStatus.EREJECTEDBYIDB
      ) {
        return '&mdash;';
      } else {
        return String(value);
      }
    } else {
      return '&mdash;';
    }
  }
}
