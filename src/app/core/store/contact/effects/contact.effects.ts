import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as contactActions from '../actions/contact.actions';

@Injectable()
export class ContactEffect {
  constructor(readonly actions$: Actions) {}

  getContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(contactActions.getContact),
      tap(() => {
        /* console.log('effect tap',data) */
      })
    )
  );
}
