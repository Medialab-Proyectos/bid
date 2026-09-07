import { createReducer, on } from '@ngrx/store';
import { Bidder } from '@core/models/bidder.model';
import * as bidderActions from '../actions/bidder.actions';
import { AppState } from '@core/store/store.reducers';

export interface BidderState {
  bidder: Bidder;
  loaded: boolean;
  loading: boolean;
  error: unknown;
}
export interface AppStateWithBidder extends AppState {
  bidder: BidderState;
}
export const bidderInitialState: BidderState = {
  bidder: null,
  loaded: false,
  loading: false,
  error: null,
};

const _bidderReducer = createReducer(
  bidderInitialState,
  on(bidderActions.addBidder, (state) => ({
    ...state,
    loading: true,
  })),
  on(bidderActions.addBidderSuccess, (state, { bidder }) => ({
    ...state,
    loading: false,
    loaded: true,
    bidder,
  })),
  on(bidderActions.addBidderError, (state, { payload }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: payload,
  }))
);

export function bidderReducer(state, action) {
  return _bidderReducer(state, action);
}
