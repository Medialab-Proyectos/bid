import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsCounterComponent } from './components/comments-counter/comments-counter.component';

@NgModule({
  declarations: [CommentsCounterComponent],
  imports: [CommonModule],
  exports: [CommentsCounterComponent],
})
export class CommentsCounterModule {}
