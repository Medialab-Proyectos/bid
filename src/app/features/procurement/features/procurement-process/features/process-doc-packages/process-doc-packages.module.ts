import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreModule } from '@ngrx/store';
import { biddingProcessDocumentPackageReducer } from '@core/store';

import { ProcessDocPackagesRoutingModule } from './process-doc-packages-routing.module';
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
import { DocumentsTabComponent } from './views/documents-tab/documents-tab.component';
import { DocumentDetailComponent } from './components/document-detail/document-detail.component';
import { PackageDocComponent } from './components/package-doc/package-doc.component';
import { ProcessUpdateBidValidityDateComponent } from '../../components/process-update-bid-validity-date/process-update-bid-validity-date.component';
import { PackageDocAdditionalComponent } from './components/package-doc-additional/package-doc-additional.component';
import { UBOComponent } from './components/ubo/ubo.component';
import { UboModalComponent } from './components/modal/ubo-modal/ubo-modal.component';
import { UboRegisterEmailComponent } from './components/ubo-register-email/ubo-register-email.component';
import { UboModalStatusComponent } from './components/modal/ubo-modal-status/ubo-modal-status.component';
import { packageScreenVisibilityReducer } from '@core/store/visibility-package-screen/reducer/visibility-package-screen.reducer';

@NgModule({
  declarations: [
    DocumentsTabComponent,
    PackageDocComponent,
    DocumentDetailComponent,
    ProcessUpdateBidValidityDateComponent,
    PackageDocAdditionalComponent,
    UBOComponent,
    UboModalComponent,
    UboRegisterEmailComponent,
    UboModalStatusComponent,
  ],
  imports: [
    CommonModule,
    ProcessDocPackagesRoutingModule,
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
    StoreModule.forFeature('packageScreen', packageScreenVisibilityReducer),
    TranslateModule,
    PipeModule,
    LoaderModule,
    DirectivesModule,
  ],
  exports: [
    PackageDocComponent,
    DocumentDetailComponent,
    ProcessUpdateBidValidityDateComponent,
    PackageDocAdditionalComponent,
  ],
})
export class ProcessDocPackagesModule {}
