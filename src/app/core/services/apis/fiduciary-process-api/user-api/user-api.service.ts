import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionResponse } from '@core/models/responses/user-response.model';
import { SHOULD_CACHE_REQUEST } from '@core/utils/httpContexts';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly apiUrl = environment.hostApi.fiduciaryProcessApi.endpoint;

  constructor(readonly http: HttpClient) {}

  public getPermissionsV2(
    contractNumber?: string,
    operationNumber?: string
  ): Observable<any> {
    let url = this.apiUrl.replace(/\/dev/g, '');
    url = `${url}/api/v2/users/permissions`;

    if (!!contractNumber) {
      url = url.concat(`?contractNumber=${contractNumber}`);
    }
    if (!!operationNumber) {
      url = url.concat(`&operationNumber=${operationNumber}`);
    }
    return this.http.get<PermissionResponse>(url, {
      context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
    });
  }
}
