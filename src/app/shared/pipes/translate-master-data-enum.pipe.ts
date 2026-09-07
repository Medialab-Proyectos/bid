import { Pipe, PipeTransform } from '@angular/core';
import { MasterDataEnum, MasterDataType } from '@core/models';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { map, Observable, take } from 'rxjs';

@Pipe({
  name: 'translateMasterDataEnum',
})
export class TranslateMasterDataEnumPipe implements PipeTransform {
  actualLang: string;
  translation: string;

  constructor(readonly store: Store<AppState>) {
    this.getActualLang().subscribe((data) => {
      this.actualLang = data;
    });
  }

  transform(index: number, type: MasterDataType): unknown {
    this.getMasterData(type, index);
    return this.translation;
  }

  getActualState(type: MasterDataType): Observable<MasterDataEnum[]> {
    return this.store.select('enumsMasterData').pipe(
      map((data) => {
        return data[type];
      })
    );
  }

  getMasterData(type: MasterDataType, index): void {
    this.getActualState(type).subscribe((data) => {
      this.translation = data.find((t) => t.id === index)?.name[
        this.actualLang
      ];
    });
  }

  getActualLang(): Observable<string> {
    return this.store.select('preferences').pipe(
      map((data) => data.preferences.preferredLanguage),
      take(1)
    );
  }
}
