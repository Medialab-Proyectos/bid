import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { ProcessParticipantsRoutingModule } from './process-participants-routing.module';
import { participantsReducer, selectedProjectReducer } from '@core/store';
import {
  FormTitleModule,
  NotificationModule,
  DirectivesModule,
  KendoFormsModule,
  LoaderModule,
  TablesModule,
  DropdownbuttonModule,
  NoContentModule,
  MultiselectModule,
} from '@fiduciary-interface/app/shared';
import { ParticipantComponent } from './components/participant/participant.component';
import { ParticipantDetailComponent } from './views/participant-detail/participant-detail.component';
import { NewBidderComponent } from './views/new-bidder/new-bidder.component';
import { BidderRegistrationFormComponent } from './components/bidder-registration-form/bidder-registration-form.component';
import { JointVentureBidderComponent } from './components/joint-venture-bidder/joint-venture-bidder.component';
import { BidderSearchComponent } from './components/bidder-search/bidder-search.component';
import { ParticipantsComponent } from './views/participants/participants.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FiInputCurrencyModule } from '@fiduciary-interface/app/shared/components/input-currency/input-currency.module';
import { NewJointVentureComponent } from './views/new-joint-venture/new-joint-venture.component';
import { BidderParentComponent } from './views/bidder-parent/bidder-parent.component';
import { FormSectionsModule } from '@fiduciary-interface/app/shared/components/form-sections/form-sections.module';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

@NgModule({
  declarations: [
    ParticipantComponent,
    ParticipantDetailComponent,
    NewBidderComponent,
    NewJointVentureComponent,
    BidderParentComponent,
    BidderRegistrationFormComponent,
    JointVentureBidderComponent,
    BidderSearchComponent,
    ParticipantsComponent,
    JointVentureBidderComponent,
  ],
  imports: [
    CommonModule,
    ProcessParticipantsRoutingModule,
    KendoFormsModule,
    LoaderModule,
    TranslateModule,
    NotificationModule,
    FormTitleModule,
    DirectivesModule,
    TablesModule,
    FiInputCurrencyModule,
    TooltipModule,
    DropdownbuttonModule,
    NoContentModule,
    FormSectionsModule,
    MultiselectModule,
    StoreModule.forFeature('participants', participantsReducer),
    StoreModule.forFeature('selectedProject', selectedProjectReducer),
  ],
  providers: [TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProcessParticipantsModule {}
