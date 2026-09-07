import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-scroll-button',
  templateUrl: './scroll-button.component.html',
})
export class ScrollButtonComponent {
  @Input() id: string;

  scrollTopButton(): void {
    document.getElementById(this.id).scrollIntoView();
  }
}
