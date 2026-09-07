import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, filter, map, Observable, of, switchMap, take } from 'rxjs';
import { AppState, AppStateWithPermissions } from '@core/store';
import { Store } from '@ngrx/store';
import { ProjectStoreService } from '@core/services/store-services';
import { ProjectsApiService, UserApiService } from '@core/services/apis';
import * as selectedProjectActions from '@core/store/selectedProject/actions/selectedProject.actions';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import * as rolesActions from '@core/store/roles/actions/roles.actions';
import * as permissionActions from '@core/store/permissions/actions/permissions.actions';
import { NotificationGlobalService } from '@fiduciary-interface/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { ContractOperation } from '@core/models';
import * as activitiesSelectedProjectActions from '@core/store/activitiesSelectedProject/actions/activitiesSelectedProject.actions';
@Injectable({
  providedIn: 'root',
})
export class SelectedProjectGuard {
  constructor(
    readonly storePermissions: Store<AppStateWithPermissions>,
    readonly projectStore: ProjectStoreService,
    readonly store: Store<AppState>,
    readonly projectSvc: ProjectsApiService,
    private msalBroadcastService: MsalBroadcastService,
    private readonly usrSvc: UserApiService,
    readonly msal: MsalService,
    readonly notificationGlobalService: NotificationGlobalService,
    readonly translate: TranslateService
  ) {}

  currentLang: string;
  projectCollection;

  private checkSelectedProject(
    route: ActivatedRouteSnapshot
  ): Observable<boolean> {
    let code = route.params.code;
    let contract = route.params.contract.replace('%2F', '/');

    return this.store.select('preferences').pipe(
      filter((data) => data.preferences !== null),
      map((data) => data.preferences.preferredLanguage),
      switchMap((lang) =>
        this.projectStore.projects().pipe(
          map((data) => ({
            projects: data.newProjects,
            loading: data.loading,
            lang,
          }))
        )
      ),
      switchMap((data) => {
        this.currentLang = data.lang;
        this.projectCollection = data.projects.filter(
          (el) =>
            el.operationNumber === code &&
            (el.contract === contract ||
              encodeURIComponent(el.contract) === contract)
        );

        if (this.projectCollection && this.projectCollection.length > 0) {
          this.store.dispatch(
            selectedProjectActions.setSelectedProjectSuccess({
              SelectedProject: this.projectCollection[0],
            })
          );
          this.store.dispatch(
            activitiesSelectedProjectActions.setActivitiesSelectedProjectBucketId(
              {
                ActivitiesSelectedProjectBucketId:
                  this.projectCollection[0].projectBucketId,
              }
            )
          );

          return of(true);
        } else {
          let contractCode = contract.replace('%2F', '/');
          return this.projectSvc.getSpecificProject(contractCode).pipe(
            map((response) => {
              const project = this.mapDataOperation(response.data[0]);
              this.store.dispatch(
                selectedProjectActions.setSelectedProjectSuccess({
                  SelectedProject: project,
                })
              );
              this.store.dispatch(
                activitiesSelectedProjectActions.setActivitiesSelectedProjectBucketId(
                  {
                    ActivitiesSelectedProjectBucketId: project.id,
                  }
                )
              );
              return true;
            })
          );
        }
      }),
      switchMap((dataSelectedProject) => {
        return this.validateIfUserIsLogged().pipe(
          take(1),
          switchMap(() => {
            let contract = route.params.contract.replace('%2F', '/');
            let code = route.params.code;
            return this.usrSvc.getPermissionsV2(contract, code).pipe(
              map((data) => {
                return this.mapRolesAndPermissions(data);
              }),
              catchError(() => {
                return this.handleNoPermissions();
              }),
              switchMap((data) => {
                this.store.dispatch(
                  rolesActions.getRolesSuccess({
                    roles: { roles: data.roles },
                  })
                );
                this.store.dispatch(
                  permissionActions.getUserPermissionsSuccess({
                    permissions: data.permissions,
                  })
                );
                return of(dataSelectedProject);
              })
            );
          })
        );
      })
    );
  }

  private handleNoPermissions() {
    const message = this.translate.instant(
      'SHARED.NOTIFICATION.ERROR.ZERO_PERMISSIONS'
    );
    this.notificationGlobalService.showError(message);
    return of({
      roles: [],
      permissions: [],
    });
  }

  private mapRolesAndPermissions(data) {
    let roles = data.map((r) => {
      return {
        roleIdCode: r.roleIdCode,
        roleName: r.roleName,
        roleType: r.roleType,
        roleTypeOrigin: r.roleTypeOrigin,
      };
    });
    let permissions = data.map((p) => {
      return {
        contractNumber: p.contratNumber,
        operationNumber: p.operationNumber,
        roleType: p.roleType,
        roleIdCode: p.roleIdCode,
        permissions: p.permissions.map((per) => per.permissionCode),
      };
    });
    return {
      roles,
      permissions,
    };
  }

  private mapDataOperation(project: ContractOperation) {
    return {
      name: project.projectName[this.currentLang],
      projectName: {
        en: project.projectName.en,
        es: project.projectName.es,
        pt: project.projectName.pt,
        fr: project.projectName.fr,
      },
      nameEn: project.projectName.en,
      nameEs: project.projectName.es,
      nameFr: project.projectName.fr,
      namePt: project.projectName.pt,
      operationNumber: project.project,
      executor: project.executor,
      executorAcronym: project.executorAcronym,
      contract: project.operation,
      approvedAmount: project.originalApprovedAmount,
      countryCode: project.countryCode,
      projectBucketId: project.id,
      id: project.id,
      currentApprovedAmount: project.currentApprovedAmount,
      favorite: false,
    };
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkSelectedProject(route);
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
