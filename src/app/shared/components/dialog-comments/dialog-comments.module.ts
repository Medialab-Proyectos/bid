import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogPlanCommentsComponent } from './components/dialog-plan-comments/dialog-plan-comments.component';
import { CommentsListComponent } from './components/comments-list/comments-list.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AvatarModule } from '../avatar/avatar.module';
import { NoContentModule } from '../no-content/no-conent.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { EditorModule } from '@progress/kendo-angular-editor';
import { CompletedCommentsComponent } from './components/completed-comments/completed-comments.component';
import { DraftCommentsComponent } from './components/draft-comments/draft-comments.component';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { DialogCommentsComponent } from './components/dialog-comments/dialog-comments.component';
import { NotificationModule } from '../notification/notification.module';

@NgModule({
  declarations: [
    DialogPlanCommentsComponent,
    CommentsListComponent,
    CompletedCommentsComponent,
    DraftCommentsComponent,
    AddCommentComponent,
    DialogCommentsComponent,
  ],
  imports: [
    CommonModule,
    DialogsModule,
    ButtonsModule,
    TranslateModule,
    AvatarModule,
    NoContentModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    InputsModule,
    LabelModule,
    NotificationModule,
    EditorModule,
  ],
  exports: [
    DialogPlanCommentsComponent,
    DialogCommentsComponent,
    CommentsListComponent,
    CompletedCommentsComponent,
  ],
  providers: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DialogCommentsModule {}
