import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionEnum } from '@core/enums/permission.enum';
import { PermissionService } from '@core/services/app/permission/permission.service';
import { environment } from '@fiduciary-interface/environments/environment';
@Directive({
  selector: '[fiDisplayByPermissionsSa]',
  standalone: true,
})
export class DisplayByPermissionsSaDirective {
  constructor(
    private readonly view: ViewContainerRef,
    private readonly template: TemplateRef<any>,
    private readonly permissionService: PermissionService
  ) {}

  @Input() set fiDisplayByPermissionsSa(permissions: PermissionEnum[]) {
    const getPermissions = this.permissionService.getPermissions();

    const hasPermission = getPermissions.some((permission) =>
      permissions.includes(permission)
    );

    if (!environment.permissionsByPass) {
      if (
        hasPermission ||
        this.permissionService.hasSpecialPermission(permissions)
      ) {
        this.view.createEmbeddedView(this.template);
      } else {
        this.view.clear();
      }
    } else {
      this.view.createEmbeddedView(this.template);
    }
  }
}
