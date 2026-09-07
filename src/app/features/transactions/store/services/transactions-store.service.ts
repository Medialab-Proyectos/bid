import { Injectable } from '@angular/core';
import { getProjectBalances } from '@fiduciary-interface/app/features/transactions/store/project-balances/actions/project-Balances.actions';
import { Store, select, createSelector } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  AppState,
  AppStateWithProjectBalance,
  ProjectBalanceState,
  SelectedProjectState,
} from '@core/store';

import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TransactionsStoreService {
  constructor(
    private readonly storeProjectBalances: Store<AppStateWithProjectBalance>,
    private readonly store: Store<AppState>
  ) {}

  public projectBalances(): Observable<ProjectBalanceState> {
    return this.storeProjectBalances.select('projectBalances');
  }

  public getOrLoadProjectBalancesAction(newProjectBucketId: string) {
    return this.store.pipe(
      select(balancesSelector),
      filter((state) => state !== undefined),
      tap((state) => {
        const projectBalancesState = state.projectBalances;
        const projectBuckeId = projectBalancesState.projectBucketId;

        if (projectBuckeId) {
          const isAlreadyLoaded = projectBuckeId === newProjectBucketId;

          if (!isAlreadyLoaded && !projectBalancesState.loading) {
            this.getProjectBalancesAction(newProjectBucketId);
          }
        } else {
          this.getProjectBalancesAction(newProjectBucketId);
        }

        return state;
      })
    );
  }

  public getProjectBalancesAction(projectBucketId: string): void {
    this.storeProjectBalances.dispatch(
      getProjectBalances({
        projectBucketId,
      })
    );
  }
}

const balancesSelector = createSelector(
  (state: AppState) => state.selectedProject,
  (state: AppStateWithProjectBalance) => state.projectBalances,
  (
    projectState: SelectedProjectState,
    projectBalances: ProjectBalanceState
  ) => {
    if (projectState.loaded) {
      return {
        projectState,
        projectBalances,
      };
    }

    return undefined;
  }
);
