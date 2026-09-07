import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TransactionCard } from '../../models';

@Component({
  selector: 'fi-transaction-type-card',
  templateUrl: './transaction-type-card.component.html',
})
export class TransactionTypeCardComponent {
  @Input() id: number;
  @Input() transactionCard: TransactionCard;

  @Output() transactionCardType: EventEmitter<string> =
    new EventEmitter<string>();

  initTransaction(): void {
    this.transactionCardType.emit(this.transactionCard.type);
  }
}
