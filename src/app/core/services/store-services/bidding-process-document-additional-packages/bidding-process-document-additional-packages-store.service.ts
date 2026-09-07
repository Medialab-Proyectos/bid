import { Injectable } from '@angular/core';

import { AppStateWithBiddingProcessDocumentPackages } from '@core/store';
import { Store } from '@ngrx/store';
import * as actions from '../../../store/bidding-process-document-packages/actions/bidding-process-document-packages.actions';

@Injectable({
  providedIn: 'root',
})
export class BiddingProcessDocumentAdditionalPackagesStoreService {
  constructor(
    private readonly store: Store<AppStateWithBiddingProcessDocumentPackages>
  ) {}

  deleteAdditionalPackageAction(
    processId: string,
    biddingProcessDocumentPackageId: string
  ) {
    this.store.dispatch(
      actions.deletePackage({ processId, biddingProcessDocumentPackageId })
    );
  }

  updateBidValidityExtensionDateAdditionalPackageAction(
    processId: string,
    biddingProcessDocumentPackageId: string,
    bidValidityExtensionDate: Date
  ) {
    this.store.dispatch(
      actions.updateBidValidityExtensionDate({
        processId,
        biddingProcessDocumentPackageId,
        bidValidityExtensionDate,
      })
    );
  }
}
