import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorResponse, ExchangeRateResponse } from '@core/models';
import { SHOULD_CACHE_REQUEST } from '@core/utils/httpContexts';
import { environment } from '@fiduciary-interface/environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateApiService {
  private readonly config = environment.hostApi.fiduciaryProcessApi;
  private readonly basePath = this.config.endpoint;

  constructor(private readonly httpClient: HttpClient) {}

  convert(
    fromCurrency: string
  ): Observable<ExchangeRateResponse | ErrorResponse> {
    const url = `${this.basePath}/api/common/exchangerate/usd/converter?fromCurrency=${fromCurrency}`;
    return this.httpClient.get<ExchangeRateResponse>(url, {
      context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
    });
  }

  convertV2(
    date: string,
    fromCurrency: string,
    rangeDays: number = 30
  ): Observable<ExchangeRateResponse | ErrorResponse> {
    if (fromCurrency === 'USD') {
      return of({
        fromCurrency: 'USD',
        toCurrency: 'USD',
        exchangeRate: 1,
        date,
      });
    }

    const url = `${this.basePath}/api/v3/exchangerate/usd-converter?date=${date}&fromCurrency=${fromCurrency}&rangeDays=${rangeDays}`;
    return this.httpClient.get<ExchangeRateResponse>(url, {
      context: new HttpContext().set(SHOULD_CACHE_REQUEST, true),
    });
  }
}
