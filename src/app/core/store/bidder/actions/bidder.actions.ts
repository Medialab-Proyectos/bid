import { createAction, props } from '@ngrx/store';
import { BiddingProcessBidderRequest } from '@core/models';

export const addBidder = createAction(
  '[Bidder] Add bidder',
  props<{ bidder: BiddingProcessBidderRequest }>()
);
export const addBidderSuccess = createAction(  
  '[Bidder] add bidder success',
  props<{ bidder: BiddingProcessBidderRequest }>()
);
export const addBidderError = createAction(
  '[Bidder] add bidder Error',
  props<{ payload: unknown }>()
);
