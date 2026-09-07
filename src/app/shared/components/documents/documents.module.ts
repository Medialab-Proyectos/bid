import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentsComponent } from './components/documents/documents.component';
import { FinishedDocsComponent } from './components/finished-docs/finished-docs.component';
import { FilesListComponent } from './components/files-list/files-list.component';
import { DocumentStateTagComponent } from './components/document-state-tag/document-state-tag.component';
import { DocumentItemComponent } from './components/document-item/document-item.component';
import { DocsListComponent } from './components/docs-list/docs-list.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { LayoutModule } from '@progress/kendo-angular-layout';
import {
  UploadModule,
  FileSelectModule,
  UploadsModule,
} from '@progress/kendo-angular-upload';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { PipeModule } from '../../pipes/pipe.module';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FileSelectorComponent } from './components/file-selector/file-selector.component';
import { DocBtnsComponent } from './components/doc-btns/doc-btns.component';
import { LoaderModule } from '../../components/loader/loader.module';
import { NotificationModule } from '../../components/notification/notification.module';
import { DirectivesModule } from '../../directives/directives.module';
import { DocumentGroupSectionComponent } from './components/document-group-section/document-group-section.component';
import { DocumentGroupComponent } from './components/document-group/document-group.components';
import { AccordionModule } from '../../components/accordion/accordion.module';
import { MultiselectModule } from '../multiselect/multiselect.module';
import { NoContentModule } from '../no-content/no-conent.module';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DocumentGroupSectionContractComponent } from './components/document-group-section-contract/document-group-section-contract.component';
import { DocumentGroupContractComponent } from './components/document-group-contract/document-group-contract.components';
import { DocsListContractComponent } from './components/docs-list-contract/docs-list-contract.component';
import { FilesListContractComponent } from './components/files-list-contract/files-list-contract.component';
import { FinishedDocsContractsComponent } from './components/finished-docs-contracts/finished-docs-contracts.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UndbBtnsComponent } from './components/undb-btns/undb-btns.component';
import { MatFileSelectorComponent } from '@fiduciary-interface/app/shared/components/mat-file-select/mat-file-select.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    DocumentsComponent,
    DocsListComponent,
    DocsListContractComponent,
    DocumentItemComponent,
    DocumentStateTagComponent,
    FilesListComponent,
    FilesListContractComponent,
    FinishedDocsComponent,
    FinishedDocsContractsComponent,
    FileSelectorComponent,
    DocBtnsComponent,
    DocumentGroupComponent,
    DocumentGroupSectionComponent,
    DocumentGroupSectionContractComponent,
    DocumentGroupContractComponent,
    UndbBtnsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipeModule,
    LayoutModule,
    UploadModule,
    FileSelectModule,
    UploadsModule,
    ButtonsModule,
    DropDownsModule,
    LoaderModule,
    DirectivesModule,
    NotificationModule,
    AccordionModule,
    MultiselectModule,
    NoContentModule,
    TooltipModule,
    InputsModule,
    LabelModule,
    MatDialogModule,
    MatButtonModule,
    MatFileSelectorComponent,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  exports: [
    DocumentsComponent,
    DocsListComponent,
    DocsListContractComponent,
    DocumentItemComponent,
    DocumentStateTagComponent,
    FilesListComponent,
    FilesListContractComponent,
    FinishedDocsComponent,
    FinishedDocsContractsComponent,
    FileSelectorComponent,
    DocBtnsComponent,
    DocumentGroupComponent,
    DocumentGroupSectionComponent,
    DocumentGroupSectionContractComponent,
    DocumentGroupContractComponent,
  ],
  providers: [TranslatePipe],
})
export class DocumentsModule {}
