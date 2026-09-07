import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-dynamic-preview-dialog',
  templateUrl: './dynamic-preview-dialog.component.html',
})
export class DynamicPreviewDialogComponent {
  @Input() previewHTML: any = null;

  constructor() {}

  ngOnInit(): void {
    const myDiv = document.querySelector('#myDiv');
    const newElement = document.createElement('div');
    newElement.innerHTML = this.previewHTML;
    myDiv.appendChild(newElement);
  }
}
