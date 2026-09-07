import { Injectable } from '@angular/core';
import { SidebarApiService } from '@core/services/apis';
import { AppState } from '@core/store/store.reducers';
import { MenuItem } from '@core/models';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as sidebarActions from '../actions/sidebar.actions';

@Injectable()
export class SidebarEffects {
  constructor(
    readonly actions$: Actions,
    readonly store: Store<AppState>,
    readonly configService: SidebarApiService
  ) {}

  getSidebar$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sidebarActions.getSidebar),
      mergeMap(() =>
        this.configService.getSidebar().pipe(
          map((sidebar: MenuItem[]) =>
            sidebarActions.getSidebarSucces({ sidebar })
          ),
          catchError((err) => {
            return of(sidebarActions.getSidebarError({ payload: err }));
          })
        )
      )
    );
  });
}
