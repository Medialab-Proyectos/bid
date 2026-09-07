import { Injectable } from '@angular/core';
import { RolesResponse } from '@core/enums';
import { Contact, ErrorResponse, PermissionRequest } from '@core/models';
import {
  PermissionResponse,
  PermissionResponseBody,
  RoleResponseBody,
} from '@core/models/responses/user-response.model';
import { UserApiService } from '@core/services/apis';
import { AppStateWithContact } from '@core/store';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private contact: Contact;
  contractNumber: string;
  operationNumber: string;
  allRoles: PermissionResponse;

  constructor(
    private readonly userApi: UserApiService,
    private readonly translate: TranslateService,
    private readonly store: Store<AppStateWithContact>
  ) {
    this.store.select('contact').subscribe((data) => {
      if (!!data && !!data.contact) {
        this.contact = data.contact;
      }
    });
    this.store.select('selectedProject').subscribe((data) => {
      this.contractNumber = data.selectedProject?.contract;
      this.operationNumber = data.selectedProject?.operationNumber;
    });
  }

  public getRolesPermissionsByContractNumber(
    contractNumber: string
  ): Observable<string[] | ErrorResponse> {
    if (contractNumber != this.contractNumber) {
      this.contractNumber = contractNumber;
    }
    return this.store.select('roles').pipe(
      map((data) => {
        const roles = data.rolesResponse.roles.map((r) => r.roleIdCode);

        return roles;
      })
    );
  }

  public getRoles(): Observable<PermissionRequest> {
    return this.store
      .select('roles')
      .pipe(
        filter((data) => data.loaded),
        map((data) => data.rolesResponse)
      )
      .pipe(
        mergeMap((data: RolesResponse) => {
          return this.getPermissionRequest(data.roles);
        })
      );
  }

  public getRolesPermissions(): Observable<
    PermissionResponseBody[] | ErrorResponse
  > {
    return this.userApi.getPermissionsV2().pipe(
      map((data: PermissionResponseBody[]) => {
        if (!!data) {
          return data;
        }
        throw new Error(
          this.translate.instant('USER.TOAST.GET_PERMISSIONS_ERROR')
        );
      })
    );
  }

  public getContact(): Contact {
    return this.contact;
  }

  public getPermissionRequest(
    array: RoleResponseBody[]
  ): Observable<PermissionRequest> {
    const request: PermissionRequest = {
      contractNumber: '',
      operationNumber: '',
      roles: [],
    };

    if (this.contractNumber == undefined) {
      if (this.contact.is_internal) {
        array.forEach((i) => {
          request.roles.push({
            roleIdCode: i.roleIdCode,
            roleType: i.roleType,
            roleName: i.roleName,
          });
        });
      }
    } else {
      request.contractNumber = this.contractNumber;
      request.operationNumber = this.operationNumber;

      if (this.contact.is_internal) {
        var roleForContract = this.allRoles?.permissions?.filter(
          (p) => p.contractNumber === this.contractNumber
        );

        roleForContract?.forEach((i) => {
          request.roles.push({
            roleIdCode: i.roleIdCode,
            roleType: i.roleType,
            roleName: i.roleName,
          });
        });
      }
    }

    return of(request);
  }
}
