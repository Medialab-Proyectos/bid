import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@core/store';
import * as projectHeaderActions from '@core/store/visibility-header-project/actions/header-project.actions';
import * as processHeaderActions from '@core/store/visibility-header-process/actions/header-process.actions';
import * as packageScreenActions from '@core/store/visibility-package-screen/actions/visibility-package-screen.actions';
import { WindowSizeService } from '../window-size/window-size.service';
import { BreadcrumbService } from 'xng-breadcrumb';

@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  constructor(
    private readonly windowSizeSvc: WindowSizeService,
    readonly store: Store<AppState>,
    readonly breadcrumbService: BreadcrumbService
  ) {}

  sizeWindow(): Observable<any> {
    return this.windowSizeSvc.windowSizeChanged;
  }

  breadcrumbSvc() {
    return this.breadcrumbService;
  }

  /** @param value */
  setVisiblityProjectHeader(value: boolean) {
    this.store.dispatch(
      projectHeaderActions.setHeaderProjectVisibility({ visibility: value })
    );
  }

  setVisiblityProcessHeader(value: boolean) {
    this.store.dispatch(
      processHeaderActions.setHeaderProcessVisibility({ visibility: value })
    );
  }

  setVisibilityPackagesScreen(isVisible: boolean) {
    this.store.dispatch(
      packageScreenActions.setPackageScreenVisibility({ isVisible })
    );
  }
}
