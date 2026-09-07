import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-no-content',
  templateUrl: './no-content.component.html',
})
export class NoContentComponent {
  @Input() content: string;
}
