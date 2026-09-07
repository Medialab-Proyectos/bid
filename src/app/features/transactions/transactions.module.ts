import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './views/transactions/transactions.component';
import { TransactionCardsComponent } from './views/transaction-cards/transaction-cards.component';
import { TransactionAntComponent } from './views/transaction-ant/transaction-ant.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';
import { TransactionBeneficiaryComponent } from './components/transaction-beneficiary/transaction-beneficiary.component';
import { TransactionsHeaderComponent } from './components/transactions-header/transactions-header.component';
import { ProjectBalancesComponent } from './components/project-balances/project-balances.component';
import { TransactionsListComponent } from './components/transactions-list/transactions-list.component';
import { TransactionTypeCardComponent } from './components/transaction-type-card/transaction-type-card.component';
import { AmountsDisbursementComponent } from './components/amounts-disbursement/amounts-disbursement.component';
import { TransactionDocumentsComponent } from './components/transaction-documents/transaction-documents.component';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { StoreModule } from '@ngrx/store';
import { projectBalancesReducer, selectedProjectReducer } from '@core/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionAnjComponent } from './views/transaction-anj/transaction-anj.component';
import { AmountsJustificationComponent } from './components/amounts-justification/amounts-justification.component';
import { TransactionComponentsComponent } from './components/transaction-components/transaction-components.component';
import { TransactionAtjComponent } from './views/transaction-atj/transaction-atj.component';
import { TransactionDpbComponent } from './views/transaction-dpb/transaction-dpb.component';
import { TransactionDpsComponent } from './views/transaction-dps/transaction-dps.component';
import { BeneficiaryComponent } from './components/beneficiary/beneficiary.component';
import { BeneficiaryDetailComponent } from './components/beneficiary-detail/beneficiary-detail.component';
import {
  FilterModule,
  NotificationModule,
  AccordionModule,
  PipeModule,
  KendoModule,
  LoaderModule,
  DropdownbuttonModule,
  StatusLabelModule,
  DocumentsModule,
  NoContentModule,
  DirectivesModule,
} from '@fiduciary-interface/app/shared';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FiInputNumericModule } from '@fiduciary-interface/app/shared/components/input-numeric/input-numeric.module';
import { AuditTrailComponent } from './components/audit-trail/audit-trail.component';
import { FormSectionsModule } from '@fiduciary-interface/app/shared/components/form-sections/form-sections.module';
import { TransactionDocumentListComponent } from './components/transaction-document-list/transaction-document-list.component';
import { TransactionDetailAtjComponent } from './components/transaction-detail-atj/transaction-detail-atj.component';
import { AmountsReimbursementComponent } from './components/amounts-reimbursement/amounts-reimbursement.component';
import { EquivalentAmountComponent } from './components/equivalent-amount/equivalent-amount.component';
import { TransactionDrpComponent } from './views/transaction-drp/transaction-drp.component';
import { FlowsStickyFooterModule } from '@fiduciary-interface/app/shared/components/flows-sticky-footer/flows-sticky-footer.module';
import { IFDatePipe } from '@fiduciary-interface/app/shared/pipes/if-date-pipe.pipe';
import { AniHeaderDetailComponent } from './components/ani-header-detail/ani-header-detail.component';
import { TransactionAniComponent } from './views/transaction-ani/transaction-ani.component';
import { MaskingStatusPipe } from './pipes/masking-status.pipe';
import { ModalAvailableAmountsModalComponent } from './components/modal-available-amounts-modal/modal-available-amounts-modal.component';
import { TransactionStatusPipe } from './pipes/transaction-status.pipe';
import { TransactionDpiComponent } from './views/transaction-dpi/transaction-dpi.component';
import { IfNumberPipe } from '@fiduciary-interface/app/shared/pipes/if-number.pipe';
@NgModule({
  declarations: [
    TransactionsComponent,
    TransactionCardsComponent,
    TransactionAntComponent,
    TransactionDetailComponent,
    TransactionBeneficiaryComponent,
    TransactionDocumentsComponent,
    TransactionDocumentListComponent,
    TransactionsHeaderComponent,
    ProjectBalancesComponent,
    TransactionsListComponent,
    TransactionTypeCardComponent,
    AmountsDisbursementComponent,
    TransactionAnjComponent,
    AmountsJustificationComponent,
    TransactionComponentsComponent,
    TransactionAtjComponent,
    TransactionDpbComponent,
    TransactionDpsComponent,
    BeneficiaryComponent,
    BeneficiaryDetailComponent,
    AuditTrailComponent,
    TransactionDetailAtjComponent,
    AmountsReimbursementComponent,
    EquivalentAmountComponent,
    TransactionDrpComponent,
    AniHeaderDetailComponent,
    TransactionAniComponent,
    MaskingStatusPipe,
    ModalAvailableAmountsModalComponent,
    TransactionStatusPipe,
    TransactionDpiComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TransactionsRoutingModule,
    BreadcrumbModule,
    FiInputNumericModule,
    FilterModule,
    NotificationModule,
    AccordionModule,
    PipeModule,
    KendoModule,
    TranslateModule,
    LoaderModule,
    DropdownbuttonModule,
    DocumentsModule,
    FormSectionsModule,
    StatusLabelModule,
    NoContentModule,
    DirectivesModule,
    FlowsStickyFooterModule,
    StoreModule.forFeature('projectBalances', projectBalancesReducer),
    StoreModule.forFeature('selectedProject', selectedProjectReducer),
  ],
  providers: [TranslatePipe, IFDatePipe, MaskingStatusPipe, IfNumberPipe],
  exports: [TransactionsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionsModule {}
