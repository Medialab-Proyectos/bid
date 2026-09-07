import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fi-document-detail',
  templateUrl: './document-detail.component.html',
})
export class DocumentDetailComponent {
  @Input() document: unknown | any;
  @Output() goBack = new EventEmitter();

  goBackClick(): void {
    this.goBack.emit();
  }
}
