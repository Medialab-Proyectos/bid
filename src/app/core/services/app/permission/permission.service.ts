import { Injectable, OnDestroy } from '@angular/core';
import { PermissionEnum } from '@core/enums/permission.enum';
import { Permission, RoleObj, RoleResponseBody } from '@core/models';
import { ProjectStoreService } from '@core/services/store-services';
import { AppState, RolesState } from '@core/store';
import { Store } from '@ngrx/store';
import { environment } from '@fiduciary-interface/environments/environment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { filter, map } from 'rxjs/operators';
import { InteractionStatus } from '@azure/msal-browser';

@Injectable({
  providedIn: 'root',
})
export class PermissionService implements OnDestroy {
  private contractNumber = String();
  private permissions: Permission[] = [];
  private roles: RoleResponseBody[];
  private readonly subscriptions = new Subscription();
  loadedRoles$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    readonly msal: MsalService,
    readonly store: Store<AppState>,
    readonly projectStore: ProjectStoreService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    this.projectStore.selectedProject().subscribe((data) => {
      if (!!data && !!data.selectedProject) {
        this.contractNumber = data.selectedProject.contract;
      }
    });
    this.store.select('permissions').subscribe((data) => {
      this.permissions = data.permissions;
    });

    this.store
      .select('roles')
      .pipe(
        filter((data) => data.loaded),
        map((data) => data.rolesResponse.roles)
      )
      .subscribe((data) => (this.roles = data));
  }

  getRolesStore(): Observable<RolesState> {
    return this.store.select('roles');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public hasPermission(permission: PermissionEnum): boolean {
    return this.getPermissions().includes(permission);
  }

  public haveSomePermissions(permissions: PermissionEnum[]): boolean {
    return this.getPermissions().some((p) => permissions.includes(p));
  }

  public haveSomeRoles(roleObj: RoleObj[], contractNumber: string): boolean {
    return this.getRolesByContractNumber(contractNumber).some((p) =>
      roleObj.includes(p)
    );
  }

  public getPermissions(): PermissionEnum[] {
    if (!environment.permissionsByPass) {
      return [
        ...new Set(
          this.permissions
            .filter((p) => p.contractNumber === this.contractNumber)
            .map((p) => p.permissions)
            .reduce((prev, current) => {
              return prev.concat(current);
            }, [])
        ),
      ];
    } else {
      return Object.values(PermissionEnum);
    }
  }

  public getRolesByContractNumber(contractNumber: string): RoleObj[] {
    return [
      ...new Set(
        this.permissions
          .filter((p) => p.contractNumber === contractNumber)
          .map((fp) => {
            const role = this.roles.find(
              (role) => role.roleIdCode === fp.roleIdCode
            );
            return {
              roleIdCode: fp.roleIdCode,
              roleType: fp.roleType,
              roleName: role.roleName,
            } as RoleObj;
          })
      ),
    ];
  }

  public hasSpecialPermission(permissions: PermissionEnum[]): boolean {
    return permissions.includes(PermissionEnum.SPECIAL);
  }

  validateIfUserIsLogged(): Observable<boolean> {
    return this.msalBroadcastService.inProgress$
      .pipe(filter((status) => status === InteractionStatus.None))
      .pipe(
        map(() => {
          return (
            this.msal.instance.getActiveAccount() !== undefined &&
            this.msal.instance.getActiveAccount() !== null
          );
        })
      )
      .pipe(filter((data) => data === true));
  }
}
