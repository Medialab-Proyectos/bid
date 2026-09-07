import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { biddingProcessDocumentPackageReducer } from '@core/store';
import { SharedModule as KendoSharedModule } from '@progress/kendo-angular-inputs';
import {
  CommentsCounterModule,
  DocumentsModule,
  NotificationModule,
  PipeModule,
  AdvanceMilestoneModule,
  KendoModule,
  LoaderModule,
  DirectivesModule,
  NoContentModule,
} from '@fiduciary-interface/app/shared';
import { TranslateModule } from '@ngx-translate/core';
import { ProcessAdditionalDocPackagesRoutingModule } from './process-additional-doc-packages-routing.module';
import { AdditionalDocumentTabComponent } from './views/additional-document-tab/additional-document-tab.component';
import { ProcessDocPackagesModule } from '../process-doc-packages/process-doc-packages.module';

@NgModule({
  declarations: [AdditionalDocumentTabComponent],
  imports: [
    CommonModule,
    ProcessAdditionalDocPackagesRoutingModule,
    KendoSharedModule,
    DocumentsModule,
    NotificationModule,
    CommentsCounterModule,
    AdvanceMilestoneModule,
    KendoModule,
    NoContentModule,
    StoreModule.forFeature(
      'biddingProcessDocumentPackages',
      biddingProcessDocumentPackageReducer
    ),
    TranslateModule,
    PipeModule,
    LoaderModule,
    DirectivesModule,
    ProcessDocPackagesModule,
  ],
})
export class ProcessAdditionalDocPackagesModule {}
