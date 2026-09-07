import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import * as projectsCountriesActions from '../actions/projectsCountries.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProjectsApiService } from '@core/services/apis';
import { AppState, EnumState } from '@core/store';
import { Store } from '@ngrx/store';
import { CountriesResponse, CountryEffectResponse } from '@core/models';
import { countryDictionary } from '@core/dictionaries/countryDictionary';

@Injectable()
export class ProjectsCountriesEffects {
  constructor(
    readonly actions$: Actions,
    readonly projectsSvc: ProjectsApiService,
    readonly store: Store<AppState>
  ) {}

  getProjectsCountries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectsCountriesActions.getProjectsCountries),
      switchMap(() => {
        return this.projectsSvc.getProjectsCountries().pipe(
          concatLatestFrom(() => this.store.select('enums')),
          map(([apiCountries, storeCountries]) => {
            return projectsCountriesActions.getProjectsCountriesSuccess({
              countries: createCountryEffectResponse(
                apiCountries,
                storeCountries
              ),
            });
          }),
          catchError((err) => {
            return of(
              projectsCountriesActions.getProjectsCountriesError({
                payload: err,
              })
            );
          })
        );
      })
    );

    function createCountryEffectResponse(
      apiCountries: CountriesResponse,
      storeCountries: EnumState
    ): CountryEffectResponse[] {
      const mergedCountries = apiCountries.countries.map((apiCountry) => {
        const match = storeCountries.countries.find(
          (storeCountry) => storeCountry.code === apiCountry.countryCode
        );
        return {
          ...apiCountry,
          name: match.name,
          isoCountryCode: countryDictionary[match.code]
            ? countryDictionary[match.code]
            : match.code,
        };
      });

      return mergedCountries;
    }
  });
}
