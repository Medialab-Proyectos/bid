import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import {
  BidderApiService,
  BiddingContractApiService,
} from '@core/services/apis';
import { AppState, UsrPreferencesState } from '@core/store';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
@Component({
  selector: 'fi-r-contracts-bidder',
  templateUrl: './r-contracts-bidder.component.html',
  styleUrls: ['./r-contracts-bidder.component.scss'],
})
export class RContractsBidderComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly contractApiSvc = inject(BiddingContractApiService);
  private readonly bidderApiSvc = inject(BidderApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  readonly mode: ProgressSpinnerMode = 'indeterminate';
  readonly color: ThemePalette = 'primary';

  isLoading = true;
  Bidderdata: any;
  jointVenture = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.loadBidderDetails(this.data.bidderInfo?.biddingProcessBidderId);
  }

  loadBidderDetails(biderProcessBidderId: string) {
    this.isLoading = true;
    this.getPreferences()
      .pipe(
        switchMap((lang) =>
          forkJoin({
            bidderInfo:
              this.contractApiSvc.getBidderInfoByIdV2(biderProcessBidderId),
            locations:
              this.bidderApiSvc.searchBidderLocationsById(biderProcessBidderId),
            lang: of(lang),
          })
        ),

        switchMap((response) => {
          const lang = this.getNameByLang(response.lang);
          const jvList = response.bidderInfo.biddersJointVenture || [];

          if (jvList.length === 0) {
            return of({ ...response, mappedJVs: [], langStr: lang });
          }

          const jvRequests = jvList.map((jv) => {
            return this.bidderApiSvc.searchBidderLocationsById(jv.id).pipe(
              map((locRes) => ({
                ...jv,
                economicSector: jv.economicSector
                  ? jv.economicSector[lang]
                  : null,
                type: jv?.type ? jv.type[lang] : null,
                location: locRes?.locations[0],
              }))
            );
          });

          // forkJoin espera a que todas las peticiones de las JVs terminen
          return forkJoin(jvRequests).pipe(
            map((mappedJVs) => ({ ...response, mappedJVs, langStr: lang }))
          );
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading = false;
          // this.contractsSvc.setLoading(false);
        })
      )
      .subscribe((res) => {
        this.Bidderdata = {
          name: res.bidderInfo.name,
          legalRepresentative: res.bidderInfo.legalRepresentative,
          beneficiaryOwner: res.bidderInfo.beneficiaryOwner || null,
          economicSector: res.bidderInfo?.economicSector
            ? res.bidderInfo?.economicSector[res.langStr]
            : null,
          type: res.bidderInfo.type[res.langStr] || null,
          location:
            res.locations.locations.length > 0
              ? this.translate.instant(
                  `ENUM.COUNTRY.${res.locations?.locations[0]?.country}`
                )
              : null,
          biddersJointVenture: res?.mappedJVs || [],
        };
      });
  }

  getPreferences(): Observable<string> {
    return this.store.select('preferences').pipe(
      filter(
        (data: UsrPreferencesState) =>
          data.preferences !== null && data.preferences !== undefined
      ),
      map((data: UsrPreferencesState) => {
        return data.preferences.preferredLanguage;
      }),
      take(1)
    );
  }

  private getNameByLang(lang: string): string {
    const langMap = {
      en: 'nameEn',
      es: 'nameEs',
      fr: 'nameFr',
      pt: 'namePt',
    };
    return langMap[lang] || 'nameEn';
  }
}
