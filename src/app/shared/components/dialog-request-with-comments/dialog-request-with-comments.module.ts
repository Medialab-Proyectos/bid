import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogWithCommentComponent } from './components/dialog-with-comment/dialog-with-comment.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@progress/kendo-angular-editor';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { AvatarModule } from '@progress/kendo-angular-layout';
import { NoContentModule } from '../no-content/no-conent.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';

@NgModule({
  declarations: [DialogWithCommentComponent],
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
  exports: [DialogWithCommentComponent],
  providers: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DialogRequestWithCommentsModule {}
