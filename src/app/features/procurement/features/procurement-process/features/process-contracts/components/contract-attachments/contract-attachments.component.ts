import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-contract-attachments',
  templateUrl: './contract-attachments.component.html',
})
export class ContractAttachmentsComponent {
  @Input() number: string | number = '';
}
