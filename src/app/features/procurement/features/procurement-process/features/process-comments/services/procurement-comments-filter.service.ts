import { Injectable } from '@angular/core';
import { AppStateWithCommentsFilter } from '@core/store/commentsFilter/reducer/commentsFilter.reducer';
import { Store } from '@ngrx/store';
import * as actions from '@core/store/commentsFilter/actions/commentsFilter.actions';

@Injectable({
  providedIn: 'root',
})
export class ProcurementCommentsFilterService {
  constructor(
    private readonly procurementCommentFilterStore: Store<AppStateWithCommentsFilter>
  ) {}

  setVersions(versions: boolean) {
    this.procurementCommentFilterStore.dispatch(
      actions.setVersionToggle({ versions })
    );
  }
}
