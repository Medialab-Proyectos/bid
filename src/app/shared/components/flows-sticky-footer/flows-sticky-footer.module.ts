import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowStickyFooterComponent } from './components/flow-sticky-footer/flow-sticky-footer.component';
import { KendoModule } from '../../kendo/kendo.module';
import { PipeModule } from '../../pipes/pipe.module';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { DialogDocumentsModule } from '../dialog-documents/dialog-documents.module';

@NgModule({
  declarations: [FlowStickyFooterComponent],
  imports: [
    CommonModule,
    KendoModule,
    PipeModule,
    TranslateModule,
    DialogDocumentsModule,
  ],
  exports: [CommonModule, FlowStickyFooterComponent],
  providers: [TranslatePipe],
})
export class FlowsStickyFooterModule {}
