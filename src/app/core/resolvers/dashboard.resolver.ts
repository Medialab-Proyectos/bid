import { Injectable } from '@angular/core';
import { AppState } from '@core/store';
import { Store } from '@ngrx/store';
import { EnumsStoreService } from '@core/services/store-services';

@Injectable({
  providedIn: 'root',
})
export class DashboardResolver {
  constructor(
    readonly store: Store<AppState>,
    readonly enumStore: EnumsStoreService
  ) {}

  enums = ['countries'];

  resolve(): void {
    this.enumStore.loadEnum(this.enums);
  }
}
