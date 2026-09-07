import { Component, Input } from '@angular/core';

@Component({
  selector: 'fi-comments-counter',
  templateUrl: './comments-counter.component.html',
})
export class CommentsCounterComponent {
  @Input() commentsNumber: number;
  @Input() id: number;
  @Input() marked: boolean;
}
