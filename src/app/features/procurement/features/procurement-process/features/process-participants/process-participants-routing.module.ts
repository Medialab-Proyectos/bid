import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParticipantsComponent } from './views/participants/participants.component';
import { NewBidderComponent } from './views/new-bidder/new-bidder.component';
import { NewJointVentureComponent } from './views/new-joint-venture/new-joint-venture.component';
import { BidderParentComponent } from './views/bidder-parent/bidder-parent.component';
import { CanDeactivateFromGuard } from '@core/guards/canDeactivateForm.guard';
import { ParticipantsResolver } from '@core/resolvers/participants.resolver';

export const routes: Routes = [
  {
    path: '',
    component: ParticipantsComponent,
    canDeactivate: [CanDeactivateFromGuard],
    resolve: {
      enums: ParticipantsResolver,
    },
  },
  {
    path: 'add-bidder',
    component: BidderParentComponent,
    children: [
      {
        path: '',
        component: NewBidderComponent,
        canDeactivate: [CanDeactivateFromGuard],
        data: {
          breadcrumb: {
            alias: 'addBidder',
          },
        },
      },
      {
        path: 'add-joint-venture',
        component: NewJointVentureComponent,
        canDeactivate: [CanDeactivateFromGuard],
        data: {
          breadcrumb: {
            alias: 'addJointVenture',
          },
        },
      },
    ],
    resolve: {
      enums: ParticipantsResolver,
    },
  },
  {
    path: ':participantId/bidder/:bidderId',
    component: BidderParentComponent,
    children: [
      {
        path: '',
        component: NewBidderComponent,
        canDeactivate: [CanDeactivateFromGuard],
        data: {
          breadcrumb: {
            alias: 'detailBidder',
          },
        },
      },
      {
        path: 'add-joint-venture',
        component: NewJointVentureComponent,
        canDeactivate: [CanDeactivateFromGuard],
        data: {
          breadcrumb: {
            alias: 'addJointVenture',
          },
        },
      },
    ],
    resolve: {
      enums: ParticipantsResolver,
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateFromGuard],
})
export class ProcessParticipantsRoutingModule {}
