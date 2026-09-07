import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { AddDocumentComponent } from './components/add-document.component';
import { DocumentsModule } from '../documents/documents.module';
import {
  LoaderModule,
  NoContentModule,
  NotificationModule,
} from '@fiduciary-interface/app/shared';

@NgModule({
  declarations: [AddDocumentComponent],
  imports: [
    CommonModule,
    TranslateModule,
    DocumentsModule,
    LoaderModule,
    NotificationModule,
    NoContentModule,
  ],
  exports: [AddDocumentComponent],
  providers: [TranslatePipe],
  schemas: [],
})
export class DialogDocumentsModule {}
