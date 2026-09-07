import { Component, Input, OnInit } from '@angular/core';
import { TransactionComponent } from '../../models';

@Component({
  selector: 'fi-modal-available-amounts-modal',
  templateUrl: './modal-available-amounts-modal.component.html',
  styleUrls: [],
})
export class ModalAvailableAmountsModalComponent implements OnInit {
  constructor() {}
  @Input() components: TransactionComponent[];

  ngOnInit(): void {}
}
