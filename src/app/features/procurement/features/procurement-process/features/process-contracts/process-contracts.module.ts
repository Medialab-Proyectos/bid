import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { enumReducer, procurementContractsReducer } from '@core/store';
import { ProcessContractsRoutingModule } from './process-contracts-routing.module';
import {
  AccordionModule,
  DocumentsModule,
  KendoFormsModule,
  TablesModule,
  NotificationModule,
  HeaderFeatureModule,
  DirectivesModule,
  PipeModule,
  LoaderModule,
  DropdownbuttonModule,
  NoContentModule,
} from '@fiduciary-interface/app/shared';
import { FormSectionsModule } from '@fiduciary-interface/app/shared/components/form-sections/form-sections.module';

import { ContractsComponent } from './views/contracts/contracts.component';
import { ContractDetailsComponent } from './components/contract-details/contract-details.component';
import { CreateContractComponent } from './views/create-contract/create-contract.component';
import { WinnerInformationComponent } from './components/winner-information/winner-information.component';
import { ContractGeneralInformationComponent } from './components/contract-general-information/contract-general-information.component';
import { ContractLotsComponent } from './components/contract-lots/contract-lots.component';
import { DestinationPlaceComponent } from './components/destination-place/destination-place.component';
import { AditionalInformationComponent } from './components/aditional-information/aditional-information.component';
import { ContractAttachmentsComponent } from './components/contract-attachments/contract-attachments.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { SecuritiesComponent } from './components/securities/securities.component';
import { DamagesComponent } from './components/damages/damages.component';
import { BonusComponent } from './components/bonus/bonus.component';
import { ContractsForm } from './components/contracts-form/contracts-form.component';
import { EditContractComponent } from './views/edit-contract/edit-contract.component';
import { DetailContractComponent } from './views/detail-contract/detail-contract.component';
import { ContractAmendmentsComponent } from './components/contract-amendments/contract-amendments.component';
import { AddAmendmentComponent } from './views/add-amendment/add-amendment.component';
import { ContractObjetiveComponent } from './components/contract-objetive/contract-objetive.component';
import { AddAmendmentFormComponent } from './components/add-amendment-form/add-amendment-form.component';
import { AmendmentDateUpdateComponent } from './components/amendment-date-update/amendment-date-update.component';
import { ContractAmountComponent } from './components/contract-amount/contract-amount.component';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
import { ContractsTablesComponent } from './components/contracts-tables/contracts-tables.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatNumericComponent } from '@fiduciary-interface/app/shared/components/mat-numeric/mat-numeric.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDateComponent } from '@fiduciary-interface/app/shared/components/mat-date/mat-date.component';
import { CreateContractRebrandComponent } from './views/create-contract-rebrand/create-contract-rebrand.component';
import { RContractsBidderComponent } from './components/r-contracts-bidder/r-contracts-bidder.component';
import { RContractsGeneralInfoComponent } from './components/r-contracts-general-info/r-contracts-general-info.component';
import { RContractsCostDistributionComponent } from './components/r-contracts-cost-distribution/r-contracts-cost-distribution.component';
import { RContractsExecutionPlaceComponent } from './components/r-contracts-execution-place/r-contracts-execution-place.component';
import { RContractsAdditionalInfoComponent } from './components/r-contracts-additional-info/r-contracts-additional-info.component';
import { MatMenuModule } from '@angular/material/menu';
import { RContractsPaymentScheduleComponent } from './components/r-contracts-payment-schedule/r-contracts-payment-schedule.component';
import { RContractsDetailBidderComponent } from './components/r-contracts-detail-bidder/r-contracts-detail-bidder.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RContractsRegisterContractComponent } from './components/r-contracts-register-contract/r-contracts-register-contract.component';
import { RContractsStepperComponent } from './components/r-contracts-stepper/r-contracts-stepper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { RContractsConfirmComponent } from './components/r-contracts-confirm/r-contracts-confirm.component';
import { RContractsLotsComponent } from './components/r-contracts-lots/r-contracts-lots.component';
import { ContractDialogComponent } from './components/contract-dialog/contract-dialog.component';
import { ErrorAlertComponent } from '../../../../../../shared/components/error-alert/error-alert.component';
import { ErrorAlertListComponent } from '../../../../../../shared/components/error-alert-list/error-alert-list.component';
import { MatFileSelectorComponent } from '../../../../../../shared/components/mat-file-select/mat-file-select.component';
import { RContractErrorComponent } from './components/r-contract-error/r-contract-error.component';
import { RContractsDocumentsComponent } from './components/r-contracts-documents/r-contracts-documents.component';
import { RContractsFeesComponent } from './components/r-contracts-fees/r-contracts-fees.component';
import { ErrorFocusDirective } from './directive/error-focus.directive';
import { MatFileListComponent } from '../../../../../../shared/components/mat-file-list/mat-file-list.component';
import { MatDocListComponent } from '../../../../../../shared/components/mat-doc-list/mat-doc-list.component';
import { MatFinishedDocsComponent } from '../../../../../../shared/components/mat-finished-docs/mat-finished-docs.component';

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD MMM YYYY', // Parsing format
  },
  display: {
    dateInput: 'DD MMMM YYYY', // Display format in the input field
    monthYearLabel: 'MMMM YYYY', // Format for month-year in calendar header
    dateA11yLabel: 'LL', // Accessibility label
    monthYearA11yLabel: 'MMMM YYYY', // Accessibility label for month-year
  },
};

@NgModule({
  declarations: [
    ContractsComponent,
    ContractDetailsComponent,
    CreateContractComponent,
    WinnerInformationComponent,
    ContractGeneralInformationComponent,
    ContractLotsComponent,
    DestinationPlaceComponent,
    AditionalInformationComponent,
    ContractAttachmentsComponent,
    SecuritiesComponent,
    DamagesComponent,
    BonusComponent,
    ContractsForm,
    EditContractComponent,
    DetailContractComponent,
    ContractAmendmentsComponent,
    AddAmendmentComponent,
    AmendmentDateUpdateComponent,
    ContractObjetiveComponent,
    AddAmendmentFormComponent,
    ContractAmountComponent,
    ContractsTablesComponent,
    CreateContractRebrandComponent,
    RContractsBidderComponent,
    RContractsGeneralInfoComponent,
    RContractsCostDistributionComponent,
    RContractsExecutionPlaceComponent,
    RContractsAdditionalInfoComponent,
    RContractsPaymentScheduleComponent,
    RContractsDetailBidderComponent,
    RContractsRegisterContractComponent,
    RContractsStepperComponent,
    RContractsConfirmComponent,
    RContractsLotsComponent,
    ContractDialogComponent,
    RContractErrorComponent,
    RContractsDocumentsComponent,
    RContractsFeesComponent,
    ErrorFocusDirective,
  ],
  imports: [
    CommonModule,
    ProcessContractsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    KendoFormsModule,
    TablesModule,
    HeaderFeatureModule,
    DocumentsModule,
    NotificationModule,
    FormSectionsModule,
    TranslateModule,
    DirectivesModule,
    PipeModule,
    LoaderModule,
    DropdownbuttonModule,
    NoContentModule,
    TooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule,
    MatNumericComponent,
    MatTooltipModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatDateComponent,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatFileSelectorComponent,
    MatFileListComponent,
    MatDocListComponent,
    MatFinishedDocsComponent,
    StoreModule.forFeature('procurementContracts', procurementContractsReducer),
    StoreModule.forFeature('enums', enumReducer),
    ErrorAlertComponent,
    ErrorAlertListComponent,
  ],
  providers: [TranslatePipe, IFDatePipe, IfNumberPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProcessContractsModule {}
