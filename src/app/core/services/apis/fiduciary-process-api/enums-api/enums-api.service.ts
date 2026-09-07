import { Observable } from 'rxjs';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  GetEnumsResponse,
  ErrorResponse,
  GetEnumsLocationResponse,
  MasterDataEnum,
  ContractsMasterData,
  ContractsEnum,
} from '@core/models';
import { environment } from '@fiduciary-interface/environments/environment';
import { shareReplay } from 'rxjs/operators';
import { SHOULD_CACHE_REQUEST } from '../../../../utils/httpContexts';

@Injectable({
  providedIn: 'root',
})
export class EnumsApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  constructor(private readonly httpClient: HttpClient) {}

  getEnumType(url: string): Observable<GetEnumsResponse | ErrorResponse> {
    return this.httpClient
      .get<GetEnumsResponse>(`${this.basePath}/api/${url}`)
      .pipe(shareReplay());
  }

  getEnumMasterDataType(
    url: string,
    v1: boolean = false
  ): Observable<MasterDataEnum[]> {
    const version = v1 === false ? 'v2' : 'v1';
    return this.httpClient.get<MasterDataEnum[]>(
      `${this.basePath}/api/${version}/master-data/${url}`,
      {
        context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
      }
    );
  }

  getLocationEnums(
    url: string
  ): Observable<GetEnumsLocationResponse | ErrorResponse> {
    return this.httpClient.get<GetEnumsLocationResponse>(
      `${this.basePath}/api/${url}`
    );
  }

  getContractsEnumMasterData(
    code: ContractsEnum
  ): Observable<ContractsMasterData[]> {
    return this.httpClient.get<ContractsMasterData[]>(
      `${this.basePath}/api/v3/bidding-contracts/enums/${code}`
    );
  }
}
