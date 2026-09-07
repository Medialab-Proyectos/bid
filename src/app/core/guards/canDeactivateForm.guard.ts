import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DialogResponse, ModalOptions } from '@core/models';
import { DialogReturn, ModalService } from '@fiduciary-interface/app/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CanComponentDeactivate {
  canDeactivate: () =>
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree;
}

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateFromGuard
  
{
  constructor(private readonly fiModalSvc: ModalService) {}
  canDeactivate(
    component: CanComponentDeactivate,
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ) {
    return component?.canDeactivate ? component.canDeactivate() : true;
  }

  openModalLogic(
    form: UntypedFormGroup, 
    skip = false
  ): boolean | Observable<boolean | Observable<boolean>> {
    if (skip || form?.disabled || !form?.dirty) {
      return true;
    }

    return this.openModal().pipe(
      map((response: DialogResponse) => {
        if (response.result === ModalOptions.CANCEL) {
          return false;
        }
        return true;
      })
    );
  }

  openModal(): Observable<DialogReturn> {
    return this.fiModalSvc.open(
      'MODAL.WARNING_LOST_DATA.TITLE',
      [
        { text: 'MODAL.WARNING_LOST_DATA.CANCEL' },
        {
          text: 'MODAL.WARNING_LOST_DATA.CONTINUE',
          cssClass: 'k-primary',
        },
      ],
      [{ key: 'MODAL.WARNING_LOST_DATA.CONTENT', bold: false }]
    );
  }
}
