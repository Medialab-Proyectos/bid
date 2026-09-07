import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Currency, ErrorResponse } from '@core/models';
import { SHOULD_CACHE_REQUEST } from '@core/utils/httpContexts';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  constructor(private readonly httpClient: HttpClient) {}

  getCurrencies(): Observable<Currency[] | ErrorResponse> {
    const url = `${this.basePath}/api/common/currencies`;
    return this.httpClient.get<Currency[]>(url, {
      context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
    });
  }
}
