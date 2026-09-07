import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { Observable } from 'rxjs';

type BooleanURLTree =
  | boolean
  | UrlTree
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>;

@Injectable({
  providedIn: 'root',
})
export class HasPermissionGuard  {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly notificationGlobalService: NotificationGlobalService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  private checkPermission(route: ActivatedRouteSnapshot): boolean {
    if (route.data && route.data.permission) {
      if (this.permissionService.hasPermission(route.data.permission)) {
        return true;
      } else {
        this.router.navigate(['..'], { relativeTo: this.activatedRoute });
        this.showErrorMessage();
        return false;
      }
    }

    return true;
  }

  private showErrorMessage(): void {
    const message = this.translate.instant(
      'SHARED.NOTIFICATION.ERROR_LIST.PERMISSION_DENIED'
    );
    this.notificationGlobalService.showError(message, 'right', 'top', 7000);
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): BooleanURLTree {
    return this.checkPermission(route);
  }

  public canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): BooleanURLTree {
    return this.checkPermission(childRoute);
  }
}
