import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-card-header',
  templateUrl: './card-header.component.html',
})
export class CardHeaderComponent {
  @Input() title = '';
}
